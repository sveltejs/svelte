/** @import { PendingBoundary, TailMessage } from '#server' */
/** @import { WarpKey } from '#shared' */
import { DEV } from 'esm-env';
import { get_user_code_location } from './dev.js';
import * as e from './errors.js';
import { is_native_promise, noop } from '../shared/utils.js';

/** Passed to `read` when every key is being read */
export const ALL = Symbol();

// (a `typedef`, since TypeScript considers `typeof ALL` circular in some positions)
/** @typedef {typeof ALL} All */

/**
 * The values added to `Warp` instances during a render, and the bookkeeping that decides how they're
 * sent to the client. Every value is sent exactly once, either in the `head` (serialized once the HTML
 * is put together) or in the `tail` (streamed afterwards).
 *
 * Until the `head` is serialized (see `emit`):
 * - every value in the queue was added inside a pending boundary
 * - every key in `#tail_keys` has exactly one value in the queue (keys are write-once)
 *
 * When the `head` is serialized, the values whose keys are still in `#tail_keys` stay in the queue for
 * the `tail`, and the rest go in the `head`. After that, every value that's added goes straight into
 * the queue, as long as a `tail` is streaming
 */
export class WarpStore {
	/**
	 * The values stored in each `Warp`, keyed by the `Warp`'s id
	 * @type {Map<string, Map<WarpKey, unknown>>}
	 */
	#values = new Map();

	/**
	 * dev-only: where each value was set, keyed by the `Warp`'s id
	 * @type {Map<string, Map<WarpKey, string>>}
	 */
	#stacks = new Map();

	/** Whether the values have been serialized into the `head` */
	#emitted = false;

	/**
	 * The keys, for each `Warp`'s id, that were added by work inside pending boundaries and haven't been
	 * read outside one. They go in the `tail`. Reading one outside a boundary removes it, so it goes in the
	 * `head` instead, since the rest of the render depends on it. Empty once the `head` is serialized
	 * @type {Map<string, Set<WarpKey>>}
	 */
	#tail_keys = new Map();

	/**
	 * Messages for the `tail`, in the order they happened, until the `tail` takes them
	 * @type {TailMessage[]}
	 */
	#queue = [];

	/**
	 * While a `tail` is streaming, called when a message is added to the queue, so it can be sent.
	 * Once the `head` is serialized, values can only be added while this is set
	 * @type {(() => void) | null}
	 */
	#listener = null;

	/**
	 * The values stored in the `Warp` with the given id, without recording that they were read
	 * @param {string} id
	 */
	values(id) {
		return this.#values.get(id);
	}

	/**
	 * Returns the values stored in the `Warp` with the given id, recording that `key` was read (or
	 * every key, if it's `ALL`). If the work inside a pending boundary added it, but it's read outside one
	 * before the `head` is serialized, it moves to the `head`, since the rest of the render depends on it
	 * @param {string} id
	 * @param {WarpKey | All} key
	 * @param {boolean} in_boundary Whether the read happens inside a pending boundary
	 */
	read(id, key, in_boundary) {
		if (!in_boundary && !this.#emitted) {
			if (key === ALL) {
				this.#tail_keys.delete(id);
			} else {
				this.#tail_keys.get(id)?.delete(key);
			}
		}

		return this.#values.get(id);
	}

	/**
	 * Adds a value. Throws if it can't be added (because the values have been serialized and nothing is
	 * streaming), in which case it isn't added
	 * @param {string} id
	 * @param {WarpKey} key
	 * @param {unknown} value
	 * @param {boolean} in_boundary Whether the value is added inside a pending boundary
	 */
	add(id, key, value, in_boundary) {
		if (is_native_promise(value)) {
			// the rejection is sent to the client, but devalue only subscribes once it reaches the
			// promise, which can be after it rejects (e.g. if it was added by work in a pending boundary)
			Promise.prototype.then.call(value, undefined, noop);
		}

		if (this.#emitted && this.#listener === null) {
			e.warp_set_after_render(String(key), id);
		}

		// values added inside pending boundaries go in the `tail`, so that the `head` only contains what
		// the rest of the render added (and used). so do values added after the `head` was serialized
		if (in_boundary || this.#emitted) {
			if (!this.#emitted) {
				let keys = this.#tail_keys.get(id);
				if (keys === undefined) this.#tail_keys.set(id, (keys = new Set()));
				keys.add(key);
			}

			this.#push([id, key, value]);
		}

		if (DEV) {
			let stacks = this.#stacks.get(id);
			if (stacks === undefined) this.#stacks.set(id, (stacks = new Map()));
			stacks.set(key, get_user_code_location());
		}

		let values = this.#values.get(id);
		if (values === undefined) this.#values.set(id, (values = new Map()));
		values.set(key, value);
	}

	/**
	 * dev-only: the location at which a value was set
	 * @param {string} id
	 * @param {WarpKey} key
	 */
	stack(id, key) {
		return this.#stacks.get(id)?.get(key) ?? '<missing stack trace>';
	}

	/**
	 * Tells the client that a pending boundary's children can be rendered, once the values they read
	 * synchronously have been added
	 * @param {PendingBoundary} boundary
	 */
	release(boundary) {
		this.#push(boundary);
	}

	/**
	 * Called once the `head` is about to be serialized. Decides which values go in the `head` and which in
	 * the `tail`: the values added inside pending boundaries that nothing outside one has read stay in the
	 * queue, along with every boundary message, and the rest are returned for the `head`
	 * @returns {Map<string, Map<WarpKey, unknown>>}
	 */
	emit() {
		this.#emitted = true;

		const tail_keys = this.#tail_keys;

		// values from pending boundaries that the rest of the render has read go in the `head` instead
		this.#queue = this.#queue.filter((message) => {
			if (!Array.isArray(message)) return true;
			const [id, key] = message;
			return tail_keys.get(id)?.has(key) ?? false;
		});

		const head = without(this.#values, tail_keys);
		tail_keys.clear();

		return head;
	}

	/**
	 * Called by the `tail` while it's streaming, so that values can still be added after the `head`
	 * has been serialized. `listener` is called whenever a message is added. Pass `null` once the
	 * `tail` can't send anything more
	 * @param {(() => void) | null} listener
	 */
	listen(listener) {
		this.#listener = listener;
	}

	/** Returns the messages that have been added since the last call, in order */
	take() {
		const messages = this.#queue;
		this.#queue = [];
		return messages;
	}

	/** @param {TailMessage} message */
	#push(message) {
		this.#queue.push(message);
		this.#listener?.();
	}
}

/**
 * Returns `values` without the keys in `omit`
 * @param {Map<string, Map<WarpKey, unknown>>} values
 * @param {Map<string, Set<WarpKey>>} omit
 */
function without(values, omit) {
	if (omit.size === 0) return values;

	/** @type {Map<string, Map<WarpKey, unknown>>} */
	const result = new Map();

	for (const [id, entries] of values) {
		const keys = omit.get(id);

		if (keys === undefined || keys.size === 0) {
			result.set(id, entries);
			continue;
		}

		const kept = new Map();
		for (const [key, value] of entries) {
			if (!keys.has(key)) kept.set(key, value);
		}

		if (kept.size > 0) result.set(id, kept);
	}

	return result;
}
