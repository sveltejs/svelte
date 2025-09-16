/** @typedef {'head' | 'body'} PayloadType */
/** @typedef {{ [key in PayloadType]: string }} AccumulatedContent */
/** @typedef {{ start: number, end: number, fn: (content: AccumulatedContent) => AccumulatedContent | Promise<AccumulatedContent> }} Compaction */
/**
 * @template T
 * @typedef {T | Promise<T>} MaybePromise<T>
 */
/**
 * @typedef {string | Payload | Promise<string>} PayloadItem
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
	 * @type {TreeState}
	 * @readonly
	 */
	global;

	/**
	 * State that is local to the branch it is declared in.
	 * It will be shallow-copied to all children.
	 *
	 * TODO I think this needs to be async-compatible if we don't want waterfall-y options but I'm willing
	 * to live with it for now
	 * @type {{ select_value: string | undefined }}
	 */
	local;

	/**
	 * @param {TreeState} global
	 * @param {{ select_value: string | undefined }} [local]
	 * @param {Payload | undefined} [parent]
	 * @param {PayloadType} [type]
	 */
	constructor(global, local = { select_value: undefined }, parent, type) {
		this.global = global;
		this.local = { ...local };
		this.#parent = parent;
		this.type = type ?? parent?.type ?? 'body';
	}

	/**
	 * Create a child payload. The child payload inherits the state from the parent,
	 * but has its own content.
	 * @param {(tree: Payload) => MaybePromise<void>} render
	 * @param {PayloadType} [type]
	 * @returns {void}
	 */
	child(render, type) {
		const child = new Payload(this.global, this.local, this, type);
		this.#out.push(child);
		const result = render(child);
		if (result instanceof Promise) {
			if (this.global.mode === 'sync') {
				// TODO more-proper error
				throw new Error('Encountered an asynchronous component while rendering synchronously');
			}
			// just to avoid unhandled promise rejections -- we'll end up throwing in `then` if something fails
			result.catch(() => {});
			child.promises.initial = result;
		}
	}

	/**
	 * @param {string | (() => Promise<string>)} content
	 */
	push(content) {
		if (typeof content === 'function') {
			if (this.global.mode === 'sync') {
				// TODO more-proper error
				throw new Error('Encountered an asynchronous component while rendering synchronously');
			}
			this.#out.push(content());
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
		const child = new Payload(this.global, this.local, this);
		const to_compact = this.#out.splice(start, end - start, child);

		if (this.global.mode === 'sync') {
			Payload.#compact(fn, child, to_compact, this.type);
		} else {
			this.promises.followup.push(Payload.#compact_async(fn, child, to_compact, this.type));
		}
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

	copy() {
		const copy = new Payload(this.global, this.local, this.#parent, this.type);
		copy.#out = this.#out.map((item) => (item instanceof Payload ? item.copy() : item));
		copy.promises = this.promises;
		return copy;
	}

	/**
	 * @param {Payload} other
	 */
	subsume(other) {
		if (this.global.mode !== other.global.mode) {
			// TODO message - this should be impossible though
			throw new Error('invariant: a payload cannot switch modes');
		}

		this.global.subsume(other.global);
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
			throw new Error('invariant: should never reach this');
		} else {
			Payload.#push_accumulated_content(child, transformed_content);
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
			} else {
				throw new Error('invariant: should never reach this');
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
			if (item instanceof Payload) {
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
			} else {
				content[current_type] += await item;
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
			const child = new Payload(tree.global, tree.local, tree, /** @type {PayloadType} */ (type));
			child.push(content);
			tree.#out.push(child);
		}
	}
}

export class TreeState {
	/** @type {() => string} */
	#uid;

	/** @type {Set<{ hash: string; code: string }>} */
	#css;

	/** @type {TreeHeadState} */
	#head;

	/** @type {'sync' | 'async'} */
	#mode;

	get css() {
		return this.#css;
	}

	get uid() {
		return this.#uid;
	}

	get head() {
		return this.#head;
	}

	get mode() {
		return this.#mode;
	}

	/**
	 * @param {'sync' | 'async'} mode
	 * @param {string} [id_prefix]
	 */
	constructor(mode, id_prefix = '') {
		this.#uid = props_id_generator(id_prefix);
		this.#css = new Set();
		this.#head = new TreeHeadState(this.#uid);
		this.#mode = mode;
	}

	copy() {
		const state = new TreeState(this.#mode);
		state.#css = new Set(this.#css);
		state.#head = this.#head.copy();
		state.#uid = this.#uid;
		return state;
	}

	/**
	 * @param {TreeState} other
	 */
	subsume(other) {
		this.#css = other.#css;
		this.#uid = other.#uid;
		this.#head.subsume(other.#head);
		this.#mode = other.#mode;
	}
}

export class TreeHeadState {
	/** @type {Set<{ hash: string; code: string }>} */
	#css = new Set();

	/** @type {() => string} */
	#uid = () => '';

	/**
	 * @type {{ path: number[], value: string }}
	 */
	#title = { path: [], value: '' };

	get css() {
		return this.#css;
	}

	get uid() {
		return this.#uid;
	}

	get title() {
		return this.#title;
	}
	set title(value) {
		// perform a depth-first (lexicographic) comparison using the path. Reject sets
		// from earlier than or equal to the current value.
		const contender_path = value.path;
		const current_path = this.#title.path;

		const max_len = Math.max(contender_path.length, current_path.length);
		for (let i = 0; i < max_len; i++) {
			const contender_segment = contender_path[i];
			const current_segment = current_path[i];

			// contender shorter than current and all previous segments equal -> earlier
			if (contender_segment === undefined) return;
			// current shorter than contender and all previous segments equal -> contender is later
			if (current_segment === undefined || contender_segment > current_segment) {
				this.#title.path = value.path;
				this.#title.value = value.value;
				return;
			}
			if (contender_segment < current_segment) return;
			// else equal -> continue
		}
		// paths are equal -> keep current value (do nothing)
	}

	/**
	 * @param {() => string} uid
	 */
	constructor(uid) {
		this.#uid = uid;
		this.#css = new Set();
		this.#title = { path: [], value: '' };
	}

	copy() {
		const head_state = new TreeHeadState(this.#uid);
		head_state.#css = new Set(this.#css);
		head_state.#title = this.title;
		return head_state;
	}

	/**
	 * @param {TreeHeadState} other
	 */
	subsume(other) {
		this.#css = other.#css;
		this.#title = other.#title;
		this.#uid = other.#uid;
	}
}

/**
 * Creates an ID generator
 * @param {string} prefix
 * @returns {() => string}
 */
function props_id_generator(prefix) {
	let uid = 1;
	return () => `${prefix}s${uid++}`;
}
