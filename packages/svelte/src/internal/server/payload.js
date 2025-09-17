import { pop, push, set_ssr_context, ssr_context } from './context.js';
import * as e from './errors.js';

/** @typedef {'head' | 'body'} PayloadType */
/** @typedef {{ [key in PayloadType]: string }} AccumulatedContent */
/**
 * @template T
 * @typedef {T | Promise<T>} MaybePromise<T>
 */
/**
 * @typedef {string | Payload} PayloadItem
 */

/**
 * Payloads are basically a tree of `string | Payload`s, where each `Payload` in the tree represents
 * work that may or may not have completed. A payload can be {@link collect}ed to aggregate the
 * content from itself and all of its children, but this will throw if any of the children are
 * performing asynchronous work. To asynchronously collect a payload, just `await` it.
 *
 * The `string` values within a payload are always associated with the {@link type} of that payload. To switch types,
 * call {@link child} with a different `type` argument.
 */
export class Payload {
	/**
	 * The contents of the payload.
	 * @type {PayloadItem[]}
	 */
	#out = [];

	/**
	 * Any `onDestroy` callbacks registered during execution of this payload.
	 * @type {(() => void)[] | undefined}
	 */
	#on_destroy = undefined;

	/**
	 * Whether this payload is a component body.
	 * @type {boolean}
	 */
	#is_component_body = false;

	/**
	 * The type of string content that this payload is accumulating.
	 * @type {PayloadType}
	 */
	type;

	/** @type {Payload | undefined} */
	#parent;

	/**
	 * Asynchronous work associated with this payload. `initial` is the promise from the function
	 * this payload was passed to (if that function was async), and `followup` is any any additional
	 * work from `compact` calls that needs to complete prior to collecting this payload's content.
	 * @type {{ initial: Promise<void> | undefined, followup: Promise<void>[] }}
	 */
	promises = { initial: undefined, followup: [] };

	/**
	 * State which is associated with the content tree as a whole.
	 * It will be re-exposed, uncopied, on all children.
	 * @type {SSRState}
	 * @readonly
	 */
	global;

	/**
	 * State that is local to the branch it is declared in.
	 * It will be shallow-copied to all children.
	 *
	 * @type {{ select_value: string | undefined }}
	 */
	local;

	/**
	 * @param {SSRState} global
	 * @param {Payload | undefined} [parent]
	 * @param {PayloadType} [type]
	 */
	constructor(global, parent, type) {
		this.global = global;
		this.local = parent ? { ...parent.local } : { select_value: undefined };
		this.#parent = parent;
		this.type = type ?? parent?.type ?? 'body';
	}

	/**
	 * Create a child payload. The child payload inherits the state from the parent,
	 * but has its own content.
	 * @param {(tree: Payload) => MaybePromise<void>} fn
	 * @param {PayloadType} [type]
	 */
	child(fn, type) {
		const child = new Payload(this.global, this, type);
		this.#out.push(child);

		set_ssr_context({
			...ssr_context,
			p: ssr_context?.p ?? null,
			c: ssr_context?.c ?? null,
			r: child
		});

		const result = fn(child);

		if (result instanceof Promise) {
			if (child.global.mode === 'sync') {
				e.await_invalid();
			}
			// just to avoid unhandled promise rejections -- we'll end up throwing in `collect_async` if something fails
			result.catch(() => {});
			child.promises.initial = result;
		}

		return child;
	}

	/**
	 * Create a component payload. The component payload inherits the state from the parent,
	 * but has its own content. It is treated as an ordering boundary for ondestroy callbacks.
	 * @param {(tree: Payload) => MaybePromise<void>} fn
	 * @param {Function} [component_fn]
	 * @returns {void}
	 */
	component(fn, component_fn) {
		push(component_fn);
		const child = this.child(fn);
		child.#is_component_body = true;
		pop();
	}

	/**
	 * @param {string | (() => Promise<string>)} content
	 */
	push(content) {
		if (typeof content === 'function') {
			this.child(async (payload) => payload.push(await content()));
		} else {
			this.#out.push(content);
		}
	}

	/**
	 * Compact everything between `start` and `end` into a single payload, then call `fn` with the result of that payload.
	 * The compacted payload will be sync if all of the children are sync and {@link fn} is sync, otherwise it will be async.
	 * @param {{ start: number, end?: number, fn: (content: AccumulatedContent) => AccumulatedContent | Promise<AccumulatedContent> }} args
	 */
	compact({ start, end = this.#out.length, fn }) {
		const child = new Payload(this.global, this);
		const to_compact = this.#out.splice(start, end - start, child);

		if (this.global.mode === 'sync') {
			Payload.#compact(fn, child, to_compact, this.type);
		} else {
			this.promises.followup.push(Payload.#compact_async(fn, child, to_compact, this.type));
		}
	}

	/**
	 * @param {() => void} fn
	 */
	on_destroy(fn) {
		(this.#on_destroy ??= []).push(fn);
	}

	/**
	 * @returns {number[]}
	 */
	get_path() {
		return this.#parent ? [...this.#parent.get_path(), this.#parent.#out.indexOf(this)] : [];
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string. Throws if any of the children are
	 * performing asynchronous work.
	 * @returns {AccumulatedContent}
	 */
	collect() {
		return Payload.#collect_content([this], this.type);
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string.
	 * @returns {Promise<AccumulatedContent>}
	 */
	collect_async() {
		return Payload.#collect_content_async([this], this.type);
	}

	/**
	 * Collect all of the `onDestroy` callbacks regsitered during rendering. In an async context, this is only safe to call
	 * after awaiting `collect_async`.
	 *
	 * Child payloads are "porous" and don't affect execution order, but component body payloads
	 * create ordering boundaries. Within a payload, callbacks run in order until hitting a component boundary.
	 * @returns {Iterable<() => void>}
	 */
	*collect_on_destroy() {
		for (const component of this.#traverse_components()) {
			yield* component.#collect_ondestroy();
		}
	}

	/**
	 * @deprecated this is needed for legacy component bindings
	 */
	copy() {
		const copy = new Payload(this.global, this.#parent, this.type);
		copy.#out = this.#out.map((item) => (item instanceof Payload ? item.copy() : item));
		copy.promises = this.promises;
		return copy;
	}

	/**
	 * @param {Payload} other
	 * @deprecated this is needed for legacy component bindings
	 */
	subsume(other) {
		if (this.global.mode !== other.global.mode) {
			throw new Error(
				"invariant: A payload cannot switch modes. If you're seeing this, there's a compiler bug. File an issue!"
			);
		}

		this.local = other.local;
		this.#out = other.#out.map((item) => {
			if (item instanceof Payload) {
				item.subsume(item);
			}
			return item;
		});
		this.promises = other.promises;
		this.type = other.type;
	}

	get length() {
		return this.#out.length;
	}

	/**
	 * @param {(content: AccumulatedContent) => AccumulatedContent | Promise<AccumulatedContent>} fn
	 * @param {Payload} child
	 * @param {PayloadItem[]} to_compact
	 * @param {PayloadType} type
	 */
	static #compact(fn, child, to_compact, type) {
		const content = Payload.#collect_content(to_compact, type);
		const transformed_content = fn(content);
		if (transformed_content instanceof Promise) {
			throw new Error(
				"invariant: Somehow you've encountered asynchronous work while rendering synchronously. If you're seeing this, there's a compiler bug. File an issue!"
			);
		} else {
			Payload.#push_accumulated_content(child, transformed_content);
		}
	}

	/**
	 * Performs a depth-first search of payloads, yielding the deepest components first, then additional components as we backtrack up the tree.
	 * @returns {Iterable<Payload>}
	 */
	*#traverse_components() {
		for (const child of this.#out) {
			if (typeof child !== 'string') {
				yield* child.#traverse_components();
			}
		}
		if (this.#is_component_body) {
			yield this;
		}
	}

	/**
	 * @returns {Iterable<() => void>}
	 */
	*#collect_ondestroy() {
		if (this.#on_destroy) {
			for (const fn of this.#on_destroy) {
				yield fn;
			}
		}
		for (const child of this.#out) {
			if (child instanceof Payload && !child.#is_component_body) {
				yield* child.#collect_ondestroy();
			}
		}
	}

	/**
	 * @param {(content: AccumulatedContent) => AccumulatedContent | Promise<AccumulatedContent>} fn
	 * @param {Payload} child
	 * @param {PayloadItem[]} to_compact
	 * @param {PayloadType} type
	 */
	static async #compact_async(fn, child, to_compact, type) {
		const content = await Payload.#collect_content_async(to_compact, type);
		const transformed_content = await fn(content);
		Payload.#push_accumulated_content(child, transformed_content);
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string, or a promise resolving to a string.
	 * @param {PayloadItem[]} items
	 * @param {PayloadType} current_type
	 * @param {AccumulatedContent} content
	 * @returns {AccumulatedContent}
	 */
	static #collect_content(items, current_type, content = { head: '', body: '' }) {
		for (const item of items) {
			if (typeof item === 'string') {
				content[current_type] += item;
			} else if (item instanceof Payload) {
				Payload.#collect_content(item.#out, item.type, content);
			}
		}
		return content;
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string.
	 * @param {PayloadItem[]} items
	 * @param {PayloadType} current_type
	 * @param {AccumulatedContent} content
	 * @returns {Promise<AccumulatedContent>}
	 */
	static async #collect_content_async(items, current_type, content = { head: '', body: '' }) {
		// no danger to sequentially awaiting stuff in here; all of the work is already kicked off
		for (const item of items) {
			if (typeof item === 'string') {
				content[current_type] += item;
			} else {
				if (item.promises.initial) {
					// this represents the async function that's modifying this payload.
					// we can't do anything until it's done and we know our `out` array is complete.
					await item.promises.initial;
				}
				for (const followup of item.promises.followup) {
					// this is sequential because `compact` could synchronously queue up additional followup work
					await followup;
				}
				await Payload.#collect_content_async(item.#out, item.type, content);
			}
		}
		return content;
	}

	/**
	 * @param {Payload} tree
	 * @param {AccumulatedContent} accumulated_content
	 */
	static #push_accumulated_content(tree, accumulated_content) {
		for (const [type, content] of Object.entries(accumulated_content)) {
			if (!content) continue;
			const child = new Payload(tree.global, tree, /** @type {PayloadType} */ (type));
			child.push(content);
			tree.#out.push(child);
		}
	}
}

export class SSRState {
	/** @readonly @type {'sync' | 'async'} */
	mode;

	/** @readonly @type {() => string} */
	uid;

	/** @readonly @type {Set<{ hash: string; code: string }>} */
	css = new Set();

	/** @type {{ path: number[], value: string }} */
	#title = { path: [], value: '' };

	/**
	 * @param {'sync' | 'async'} mode
	 * @param {string} [id_prefix]
	 */
	constructor(mode, id_prefix = '') {
		this.mode = mode;

		let uid = 1;
		this.uid = () => `${id_prefix}s${uid++}`;
	}

	get_title() {
		return this.#title.value;
	}

	/**
	 * Performs a depth-first (lexicographic) comparison using the path. Rejects sets
	 * from earlier than or equal to the current value.
	 * @param {string} value
	 * @param {number[]} path
	 */
	set_title(value, path) {
		const current = this.#title.path;

		let i = 0;
		let l = Math.min(path.length, current.length);

		// skip identical prefixes - [1, 2, 3, ...] === [1, 2, 3, ...]
		while (i < l && path[i] === current[i]) i += 1;

		if (path[i] === undefined) return;

		// replace title if
		// - incoming path is longer - [7, 8, 9] > [7, 8]
		// - incoming path is later  - [7, 8, 9] > [7, 8, 8]
		if (current[i] === undefined || path[i] > current[i]) {
			this.#title.path = path;
			this.#title.value = value;
		}
	}
}
