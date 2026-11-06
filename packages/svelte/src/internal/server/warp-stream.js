/** @import { Session, UnevalReplacer } from 'devalue' */
/** @import { WarpKey } from '#shared' */
/** @import { Csp, Sha256Source } from '../../server/public.js' */
/** @import { BackgroundWork } from './renderer.js' */
/** @import { WarpStore } from './warp-store.js' */
import * as devalue from 'devalue';
import { sha256 } from './crypto.js';
import * as e from './errors.js';
import * as w from './warnings.js';
import { deferred, is_native_promise } from '../shared/utils.js';

/**
 * @typedef {{
 *   id_prefix: string;
 *   replacer: UnevalReplacer | undefined;
 *   csp: Csp & { script_hashes: Sha256Source[] };
 *   transformError: (error: unknown) => unknown;
 *   background: BackgroundWork | null;
 *   abort: () => void;
 * }} WarpStreamOptions
 */

/**
 * Serializes the values added to `Warp` instances into a `<script>` for the `head`, which recreates them
 * on the client, and, when there's background work, a `tail` that streams the rest.
 *
 * The `head` only contains the values that were added outside pending boundaries (or used outside them),
 * and waits for every promise among them to settle, so that it doesn't depend on timing. When there's
 * background work (inside pending boundaries), the values it adds are streamed via the `tail`, along with
 * the values added after the `head`, and a message for each boundary once the values that its children
 * read synchronously have been sent
 * @param {WarpStore} store
 * @param {WarpStreamOptions} options `abort` aborts the render's signals, once nothing that's streamed can depend on them
 * @returns {Promise<{ head: string | null, tail: AsyncIterable<string> | null }>}
 */
export async function serialize_warp(store, options) {
	const { background, csp } = options;

	if (background !== null && csp.hash) {
		e.invalid_csp_streaming();
	}

	const values = store.emit();

	if (values.size === 0 && background === null) {
		return { head: null, tail: null };
	}

	/** Asynchronous `transformError` calls that haven't finished yet */
	let transforms = 0;

	const session = new devalue.Session({
		// renders whose streams overlap on the same page need different `idPrefix`es, just like
		// their boundary ids (and those from `$props.id()`) do
		id: `${options.id_prefix}w`,
		scope: 'window.__svelte.d',
		replacer: options.replacer,
		transformError: (error) => {
			// a promise resolved to something that can't be serialized, which `flush` reports
			if (error instanceof devalue.DevalueError) return;

			// rejected promises reject on the client too, with whatever `transformError` returns
			const result = options.transformError(error);

			// devalue only waits for `transformError` results that are `instanceof Promise`
			if (result instanceof Promise) {
				transforms += 1;
				const done = () => (transforms -= 1);
				result.then(done, done);
			}

			return result;
		}
	});

	const csp_attr = csp.nonce ? ` nonce="${csp.nonce}"` : '';
	const tail =
		background === null ? null : new Tail(store, session, background, csp_attr, options.abort);

	let head;
	let blocks;

	try {
		head = session.uneval(values);

		// everything that's added from now on goes in the `tail`, so background work that was waiting for
		// that can start. it waits until the `head` has been serialized, so that it doesn't start if that fails
		background?.open();

		const pending = watch_pending(values);

		blocks = await take_head(
			session,
			() => transforms,
			() => {
				// this is a problem -- it means we've finished the render but we're still waiting on a promise
				// to resolve so we can serialize it, so we're blocking the response on useless content.
				w.unresolved_warp(describe_pending(pending));
			}
		);
	} catch (error) {
		tail?.close();
		serialization_failed(error);
	}

	if (tail === null) {
		blocks += `\n\t\t\t${session.end()}`;
	} else {
		tail.open();
	}

	// the messages wait in `window.__svelte.d` until the client's `Warp` handles them (see `receive_warp_values`)
	const body = `
			window.__svelte ??= {};
			${head}${blocks}
		`;

	if (!csp.nonce && csp.hash) {
		// note to future selves: this doesn't need to be optimized with a Map<body, hash>
		// because the it's impossible for identical data to occur multiple times in a single render
		const hash = await sha256(body);
		csp.script_hashes.push(`sha256-${hash}`);
	}

	return { head: `\n\t\t<script${csp_attr}>${body}</script>`, tail };
}

const MACROTASK = Symbol('macrotask');

function macrotask() {
	return new Promise((fulfil) => setTimeout(() => fulfil(MACROTASK), 0));
}

/**
 * Takes the statements that settle the promises in the `head`, once they've all settled. Throws if a
 * value can't be serialized
 * @param {Session} session
 * @param {() => number} transforms The number of asynchronous `transformError` calls that haven't finished
 * @param {() => void} warn Called if the `head` is waiting on promises that hadn't settled when the render finished
 * @returns {Promise<string>}
 */
async function take_head(session, transforms, warn) {
	let blocks = '';
	let warned = false;

	while (true) {
		const { code, errors } = session.flush();
		if (errors.length > 0) throw errors[0].error;
		if (code !== '') blocks += `\n\t\t\t${code}`;
		if (session.pending === 0) return blocks;

		// devalue hears about promises that have already settled within a few microtasks, so if nothing
		// has settled for a macrotask, and promises (rather than just `transformError` calls) are still
		// pending, the render didn't wait for them
		if (!warned && (await Promise.race([session.changed(), macrotask()])) === MACROTASK) {
			if (session.pending > transforms()) {
				warned = true;
				warn();
			}
		}

		await session.changed();
	}
}

/**
 * The `tail`: the `<script>`s that are streamed after the `head`. They send two things:
 * - the messages in the store's queue: the values that were added inside pending boundaries, or after the
 *   `head` was serialized, and the boundaries whose synchronous work has finished
 * - the settlements of the promises that the `head`, or the `tail` itself, has sent
 *
 * The `head` uses the session until `open` is called, after which the `tail` owns it. Until then, messages
 * are held rather than serialized, since the rest of the `head` could otherwise refer to objects that
 * only the `tail` introduces. Each value is serialized by itself, so one that can't be serialized doesn't
 * affect the others. No more messages can be added once the background work is done
 * @implements {AsyncIterable<string>}
 */
class Tail {
	/** @type {WarpStore} */
	#store;

	/** @type {Session} */
	#session;

	/** @type {BackgroundWork} */
	#background;

	/** The attribute that each `<script>` needs for the CSP, if any */
	#csp_attr;

	/** Aborts the render's signals */
	#abort;

	#open = false;

	#closed = false;

	/** The statements for the messages that have been serialized but not taken yet */
	#code = '';

	/** Resolves the next time a message is added, or once no more can be */
	#change = deferred();

	/** @type {AsyncIterableIterator<string> | null} */
	#iterator = null;

	/**
	 * @param {WarpStore} store
	 * @param {Session} session
	 * @param {BackgroundWork} background
	 * @param {string} csp_attr
	 * @param {() => void} abort
	 */
	constructor(store, session, background, csp_attr, abort) {
		this.#store = store;
		this.#session = session;
		this.#background = background;
		this.#csp_attr = csp_attr;
		this.#abort = abort;

		store.listen(() => {
			if (!this.#open) return;
			this.#drain();
			this.#notify();
		});

		background.settle().then(() => this.close());
	}

	/** Called once the `head` is done, after which the `tail` owns the session */
	open() {
		this.#open = true;
		this.#drain();
	}

	/** Stops accepting messages. Promises that were already sent can still settle */
	close() {
		if (this.#closed) return;
		this.#closed = true;
		this.#store.listen(null);
		this.#notify();
	}

	[Symbol.asyncIterator]() {
		if (this.#iterator !== null) return this.#iterator;

		const generator = this.#generate();

		/** @type {AsyncIterableIterator<string>} */
		const iterator = {
			next: () => generator.next(),
			// if the consumer stops early, stop the background work. this is
			// done here because `return` doesn't run a generator that hasn't started
			return: async () => {
				this.#background.abort();
				this.close();
				this.#finish();
				return generator.return(undefined);
			},
			[Symbol.asyncIterator]: () => iterator
		};

		return (this.#iterator = iterator);
	}

	/** Turns what the `tail` sends into `<script>` tags */
	async *#generate() {
		while (!this.#done) {
			await this.#wait();
			const code = this.#take();
			if (code !== '') yield `<script${this.#csp_attr}>${code}</script>`;
		}

		// every streamed promise has settled, and nothing more can be added
		this.#finish();
		yield `<script${this.#csp_attr}>${this.#session.end()}</script>`;
	}

	/** Whether everything has been sent: no more messages can be added, and every promise that was sent has settled */
	get #done() {
		return this.#closed && this.#code === '' && this.#session.pending === 0;
	}

	/**
	 * Resolves once there's something to send (or nothing more can be), straight away if there already is,
	 * after waiting for a macrotask. That gives server-side work which was waiting on a promise that just
	 * settled a chance to add the values that depend on it, so they're sent with the settlement — otherwise,
	 * the client might not receive them before it needs them
	 */
	async #wait() {
		if (this.#code === '' && !this.#done) {
			const settled = this.#session.changed();
			await Promise.race(this.#closed ? [settled] : [settled, this.#change.promise]);
		}

		await macrotask();
	}

	/** Returns the statements for the messages and settlements since the last call */
	#take() {
		const flushed = this.#session.flush();

		for (const { error } of flushed.errors) {
			// too late to fail the render, so the promise rejects on the client with a generic error
			w.warp_stream_serialization_failed(describe_error(error));
		}

		// the values come first, since they were serialized before the settlements
		const result = this.#code + flushed.code;
		this.#code = '';
		return result;
	}

	/** Aborts the signals from `getAbortSignal`, once nothing that's streamed can depend on them */
	#finish() {
		this.#abort();
		this.#background.abort();
	}

	#drain() {
		for (const message of this.#store.take()) {
			if (!Array.isArray(message)) {
				// the boundary's id is assigned when the HTML is put together. if it hasn't been, it isn't in the HTML
				if (message.id !== null) this.#code += this.#session.uneval(message.id);
				continue;
			}

			try {
				this.#code += this.#session.uneval(message);
			} catch (error) {
				// the client doesn't get the value, so it will need to load it itself
				w.warp_stream_serialization_failed(describe_error(error));
			}
		}
	}

	#notify() {
		const current = this.#change;
		this.#change = deferred();
		current.resolve();
	}
}

/**
 * Keeps track of which values are promises that haven't settled yet, for `unresolved_warp`
 * @param {Map<string, Map<WarpKey, unknown>>} values
 */
function watch_pending(values) {
	/** @type {Map<Promise<unknown>, string>} */
	const pending = new Map();

	for (const [id, v] of values) {
		for (const [key, value] of v) {
			if (!is_native_promise(value)) continue;

			pending.set(value, `\`${String(key)}\` in \`${id}\``);
			const settled = () => pending.delete(value);
			Promise.prototype.then.call(value, settled, settled);
		}
	}

	return pending;
}

/** @param {Map<Promise<unknown>, string>} pending */
function describe_pending(pending) {
	return pending.size > 0 ? ` (${[...pending.values()].join(', ')}).` : '.';
}

/** @param {unknown} error */
function describe_error(error) {
	const { stack, path } = /** @type {any} */ (error) ?? {};
	return (stack ?? String(error)) + (path ? `\n(at \`${path}\`)` : '');
}

/**
 * @param {unknown} error
 * @returns {never}
 */
function serialization_failed(error) {
	e.warp_serialization_failed(describe_error(error));
}
