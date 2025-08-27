/** @typedef {'head' | 'body'} PayloadType */
/** @typedef {{ [key in PayloadType]: string }} AccumulatedContent */
/** @typedef {{ start: number, end: number, fn: (content: AccumulatedContent) => AccumulatedContent | Promise<AccumulatedContent> }} Compaction */

/**
 * Payloads are basically a tree of `string | Payload`s, where each `Payload` in the tree represents
 * work that may or may not have completed. A payload can be {@link collect}ed to aggregate the
 * content from itself and all of its children, but this will throw if any of the children are
 * performing asynchronous work. A payload can also be collected asynchronously with
 * {@link collect_async}, which will wait for all children to complete before collecting their
 * contents.
 *
 * The `string` values within a payload are always associated with the {@link type} of that payload. To switch types,
 * call {@link child} with a different `type` argument.
 */
export class Payload {
	/**
	 * @type {PayloadType}
	 */
	type;

	/** @type {Payload | undefined} */
	parent;

	/**
	 * The contents of the payload.
	 * @type {(string | Payload)[]}
	 */
	out = [];

	/**
	 * A promise that resolves when this payload's blocking asynchronous work is done.
	 * If this promise is not resolved, it is not safe to collect the payload from `out`.
	 * @type {Promise<void> | undefined}
	 */
	promise;

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
	 * @type {{ select_value: string | undefined }}
	 */
	local;

	/**
	 * @param {TreeState} [global]
	 * @param {{ select_value: string | undefined }} [local]
	 * @param {Payload | undefined} [parent]
	 * @param {PayloadType} [type]
	 */
	constructor(global = new TreeState(), local = { select_value: undefined }, parent, type) {
		this.global = global;
		this.local = { ...local };
		this.parent = parent;
		this.type = type ?? parent?.type ?? 'body';
	}

	/**
	 * Create a child payload. The child payload inherits the state from the parent,
	 * but has its own `out` array and `promise` property. The child payload is automatically
	 * inserted into the parent payload's `out` array.
	 * @param {(tree: Payload) => void | Promise<void>} render
	 * @param {PayloadType} [type]
	 * @returns {void}
	 */
	child(render, type) {
		const child = new Payload(this.global, this.local, this, type);
		this.out.push(child);
		const result = render(child);
		if (result instanceof Promise) {
			child.promise = result;
		}
	}

	/** @param {string} content */
	push(content) {
		this.out.push(content);
	}

	/**
	 * Compact everything between `start` and `end` into a single payload, then call `fn` with the result of that payload.
	 * The compacted payload will be sync if all of the children are sync and {@link fn} is sync, otherwise it will be async.
	 * @param {{ start: number, end?: number, fn: (content: AccumulatedContent) => AccumulatedContent | Promise<AccumulatedContent> }} args
	 */
	compact({ start, end = this.out.length, fn }) {
		const child = new Payload(this.global, this.local, this);
		const to_compact = this.out.splice(start, end - start, child);
		const promises = Payload.#collect_promises(to_compact, []);

		const push_result = () => {
			const res = fn(Payload.#collect_content(to_compact, this.type));
			if (res instanceof Promise) {
				const promise = res.then((resolved) => {
					Payload.#push_accumulated_content(child, resolved);
				});
				return promise;
			} else {
				Payload.#push_accumulated_content(child, res);
			}
		};

		if (promises.length > 0) {
			// we have to wait for the accumulated work associated with all pruned branches to complete,
			// then we can accumulate their content to compact it.
			child.promise = Promise.all(promises).then(push_result);
		} else {
			push_result();
		}
	}

	/**
	 * @returns {number[]}
	 */
	get_path() {
		return this.parent ? [...this.parent.get_path(), this.parent.out.indexOf(this)] : [];
	}

	/**
	 * Waits for all child payloads to finish their blocking asynchronous work, then returns the generated content.
	 * @returns {Promise<AccumulatedContent>}
	 */
	async collect_async() {
		// TODO: Should probably use `Promise.allSettled` here just so we can report detailed errors
		await Promise.all(Payload.#collect_promises(this.out, this.promise ? [this.promise] : []));
		return Payload.#collect_content(this.out, this.type);
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string. Throws if any of the children are
	 * performing asynchronous work.
	 * @returns {AccumulatedContent}
	 */
	collect() {
		const promises = Payload.#collect_promises(this.out, this.promise ? [this.promise] : []);
		if (promises.length > 0) {
			// TODO is there a good way to report where this is? Probably by using some sort of loc or stack trace in `child` creation.
			throw new Error('Encountered an asynchronous component while rendering synchronously');
		}

		return Payload.#collect_content(this.out, this.type);
	}

	copy() {
		const copy = new Payload(this.global, this.local, this.parent, this.type);
		copy.out = this.out.map((item) => (typeof item === 'string' ? item : item.copy()));
		copy.promise = this.promise;
		return copy;
	}

	/**
	 * @param {Payload} other
	 */
	subsume(other) {
		this.global.subsume(other.global);
		this.local = other.local;
		this.out = other.out.map((item) => {
			if (typeof item !== 'string') {
				item.subsume(item);
			}
			return item;
		});
		this.promise = other.promise;
		this.type = other.type;
	}

	/**
	 * @param {(string | Payload)[]} items
	 * @param {Promise<void>[]} promises
	 * @returns {Promise<void>[]}
	 */
	static #collect_promises(items, promises) {
		for (const item of items) {
			if (typeof item === 'string') continue;
			if (item.promise) {
				promises.push(item.promise);
			}
			Payload.#collect_promises(item.out, promises);
		}
		return promises;
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string.
	 * @param {(string | Payload)[]} items
	 * @param {PayloadType} current_type
	 * @param {AccumulatedContent} content
	 * @returns {AccumulatedContent}
	 */
	static #collect_content(items, current_type, content = { head: '', body: '' }) {
		for (const item of items) {
			if (typeof item === 'string') {
				content[current_type] += item;
			} else {
				Payload.#collect_content(item.out, item.type, content);
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
			tree.out.push(child);
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

	get css() {
		return this.#css;
	}

	get uid() {
		return this.#uid;
	}

	get head() {
		return this.#head;
	}

	/**
	 * @param {string} [id_prefix]
	 */
	constructor(id_prefix = '') {
		this.#uid = props_id_generator(id_prefix);
		this.#css = new Set();
		this.#head = new TreeHeadState(this.#uid);
	}

	copy() {
		const state = new TreeState();
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
