// Optimization: Right now, the state from parents is copied into the children. _Technically_ we could save the state on the root
// and simply have the children inherit that state and re-expose it through getters. This could save memory but probably isn't worth it.

/**
 * A base class for payloads. Payloads are basically a tree of `string | Payload`s, where each
 * `Payload` in the tree represents work that may or may not have completed. A payload can be
 * {@link collect}ed to aggregate the content from itself and all of its children, but this will
 * throw if any of the children are performing asynchronous work. A payload can also be collected
 * asynchronously with {@link collect_async}, which will wait for all children to complete before
 * collecting their contents.
 *
 * @template {new (parent: Partial<InstanceType<TSubclass>>) => {}} TSubclass
 */
class BasePayload {
	/**
	 * This is the magical type that represents the instance type of a subclass of this type.
	 * How does it work? idk man but it does
	 * @typedef {this & InstanceType<TSubclass>} Instance
	 */

	/**
	 * The contents of the payload.
	 * @type {(string | Instance)[]}
	 */
	out = [];

	/**
	 * A promise that resolves when this payload's blocking asynchronous work is done.
	 * If this promise is not resolved, it is not safe to collect the payload from `out`.
	 * @type {Promise<void> | undefined}
	 */
	promise;

	/**
	 * Create a child payload. The child payload inherits the state from the parent,
	 * but has its own `out` array and `promise` property. The child payload is automatically
	 * inserted into the parent payload's `out` array.
	 * @param {(args: { $$payload: Instance }) => void | Promise<void>} render
	 * @returns {void}
	 */
	child(render) {
		const child = this.#create_child_instance();
		this.out.push(child);
		const result = render({ $$payload: child });
		if (result instanceof Promise) {
			child.promise = result;
		}
	}

	/**
	 * Compact everything between `start` and `end` into a single payload, then call `fn` with the result of that payload.
	 * The compacted payload will be sync if all of the children are sync and {@link fn} is sync, otherwise it will be async.
	 * @param {{ start: number, end?: number, fn: (value: string) => string | Promise<string> }} args
	 */
	compact({ start, end = this.out.length, fn }) {
		const child = this.#create_child_instance();
		const to_compact = this.out.splice(start, end - start, child);
		const promises = BasePayload.#collect_promises(to_compact, []);

		/** @param {string | Promise<string>} res */
		const push_result = (res) => {
			if (typeof res === 'string') {
				child.out.push(res);
			} else {
				child.promise = res.then((resolved) => {
					child.out.push(resolved);
				});
			}
		};

		if (promises.length > 0) {
			child.promise = Promise.all(promises)
				.then(() => fn(BasePayload.#collect_content(to_compact)))
				.then(push_result);
		} else {
			push_result(fn(BasePayload.#collect_content(to_compact)));
		}
	}

	/**
	 * Waits for all child payloads to finish their blocking asynchronous work, then returns the generated content.
	 * @returns {Promise<string>}
	 */
	async collect_async() {
		// TODO: Should probably use `Promise.allSettled` here just so we can report detailed errors
		await Promise.all(BasePayload.#collect_promises(this.out, this.promise ? [this.promise] : []));
		return BasePayload.#collect_content(this.out);
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string.
	 * @returns {string}
	 */
	collect() {
		const promises = BasePayload.#collect_promises(this.out, this.promise ? [this.promise] : []);
		if (promises.length > 0) {
			// TODO is there a good way to report where this is? Probably by using some sort of loc or stack trace in `child` creation
			throw new Error('Encountered an asynchronous component while rendering synchronously');
		}

		return BasePayload.#collect_content(this.out);
	}

	/**
	 * @param {(string | Instance)[]} items
	 * @param {Promise<void>[]} promises
	 * @returns {Promise<void>[]}
	 */
	static #collect_promises(items, promises) {
		for (const item of items) {
			if (typeof item !== 'string') {
				if (item.promise) {
					promises.push(item.promise);
				}
				BasePayload.#collect_promises(item.out, promises);
			}
		}
		return promises;
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string.
	 * @param {(string | Instance)[]} items
	 * @returns {string}
	 */
	static #collect_content(items) {
		// TODO throw in `async` mode
		let content = '';
		for (const item of items) {
			if (typeof item === 'string') {
				content += item;
			} else {
				content += BasePayload.#collect_content(item.out);
			}
		}
		return content;
	}

	/** @returns {Instance} */
	#create_child_instance() {
		// @ts-expect-error - This lets us create an instance of the subclass of this class. Type-danger is constrained by the fact that TSubclass must accept an instance of itself in its constructor.
		return new this.constructor(this);
	}
}

/**
 * @extends {BasePayload<typeof HeadPayload>}
 */
export class HeadPayload extends BasePayload {
	/** @type {Set<{ hash: string; code: string }>} */
	#css;

	/** @type {() => string} */
	#uid;

	/**
	 * This is a string or a promise so that the last write "wins" synchronously,
	 * as opposed to writes coming in whenever it happens to during async work.
	 * It's boxed so that the same value is shared across all children.
	 * @type {{ value: string | Promise<string>}}
	 */
	#title;

	get css() {
		return this.#css;
	}

	get uid() {
		return this.#uid;
	}

	get title() {
		return this.#title;
	}

	/**
	 * @param {{ css?: Set<{ hash: string; code: string }>, title?: { value: string | Promise<string> }, uid?: () => string }} args
	 */
	constructor({ css = new Set(), title = { value: '' }, uid = () => '' } = {}) {
		super();
		this.#css = css;
		this.#title = title;
		this.#uid = uid;
	}

	copy() {
		const head_payload = new HeadPayload({
			css: new Set(this.#css),
			title: this.title,
			uid: this.#uid
		});

		head_payload.promise = this.promise;
		head_payload.out = [...this.out];
		return head_payload;
	}

	/**
	 * @param {HeadPayload} other
	 */
	subsume(other) {
		// @ts-expect-error
		this.out = [...other.out];
		this.promise = other.promise;
		this.#css = other.#css;
		this.#title = other.#title;
		this.#uid = other.#uid;
	}
}

/**
 * @extends {BasePayload<typeof Payload>}
 */
export class Payload extends BasePayload {
	/** @type {() => string} */
	#uid;

	/** @type {Set<{ hash: string; code: string }>} */
	#css;

	/** @type {HeadPayload} */
	#head;

	/** @type {string} */
	select_value = '';

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
	 * @param {{ id_prefix?: string, head?: HeadPayload, uid?: () => string, css?: Set<{ hash: string; code: string }>, select_value?: any }} args
	 */
	constructor({
		id_prefix = '',
		head = new HeadPayload(),
		uid = props_id_generator(id_prefix),
		css = new Set()
	} = {}) {
		super();
		this.#uid = uid;
		this.#css = css;
		this.#head = head;
	}

	copy() {
		const payload = new Payload({
			css: new Set(this.#css),
			uid: this.#uid,
			head: this.#head.copy()
		});

		payload.promise = this.promise;
		payload.out = [...this.out];
		return payload;
	}

	/**
	 * @param {Payload} other
	 */
	subsume(other) {
		// @ts-expect-error
		this.out = [...other.out];
		this.promise = other.promise;
		this.#css = other.#css;
		this.#uid = other.#uid;
		this.#head.subsume(other.#head);
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
