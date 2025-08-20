/**
 * A base class for payloads. Payloads are basically a tree of `string | Payload`s, where each
 * `Payload` in the tree represents work that may or may not have completed. A payload can be
 * {@link collect}ed to aggregate the content from itself and all of its children, but this will
 * throw if any of the children are performing asynchronous work. A payload can also be collected
 * asynchronously with {@link collect_async}, which will wait for all children to complete before
 * collecting their contents.
 *
 * @template {Record<PropertyKey, unknown>} TState
 */
class BasePayload {
	/**
	 * The contents of the payload.
	 * @type {(string | BasePayload<TState>)[]}
	 */
	out = [];

	/**
	 * A promise that resolves when this payload's blocking asynchronous work is done.
	 * If this promise is not resolved, it is not safe to collect the payload from `out`.
	 * @type {Promise<void> | undefined}
	 */
	promise;

	/**
	 * Internal state. This is the easiest way to represent the additional state each payload kind
	 * needs to add to itself while still giving the base payload the ability to copy itself.
	 * @protected
	 * @type {TState}
	 */
	_state;

	/**
	 * Create a new payload, copying the state from the parent payload.
	 * @param {TState} parent_state
	 */
	constructor(parent_state) {
		this._state = parent_state;
	}

	/**
	 * Create a child payload. The child payload inherits the state from the parent,
	 * but has its own `out` array and `promise` property. The child payload is automatically
	 * inserted into the parent payload's `out` array.
	 * @param {(args: { $$payload: BasePayload<TState> }) => void | Promise<void>} render
	 * @returns {void}
	 */
	child(render) {
		// @ts-expect-error dynamic constructor invocation for subclass instance creation
		const child = new this.constructor(this._state);
		this.out.push(child);
		const result = render({ $$payload: child });
		if (result instanceof Promise) {
			child.promise = result;
		}
	}

	/**
	 * Waits for all child payloads to finish their blocking asynchronous work, then returns the generated content.
	 * @returns {Promise<string>}
	 */
	async collect_async() {
		// TODO: Should probably use `Promise.allSettled` here just so we can report detailed errors
		await Promise.all(this.#collect_promises(this.out));
		return this.#collect_content();
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string.
	 * @returns {string}
	 */
	collect() {
		const promises = this.#collect_promises(this.out);
		if (promises.length > 0) {
			// TODO is there a good way to report where this is? Probably by using some sort of loc or stack trace in `child` creation
			throw new Error('Encountered an asynchronous component while rendering synchronously');
		}

		return this.#collect_content();
	}

	/**
	 * @param {(string | BasePayload<TState>)[]} items
	 * @param {Promise<void>[]} [promises]
	 * @returns {Promise<void>[]}
	 */
	#collect_promises(items, promises = this.promise ? [this.promise] : []) {
		for (const item of items) {
			if (item instanceof BasePayload) {
				if (item.promise) {
					promises.push(item.promise);
				}
				this.#collect_promises(item.out, promises);
			}
		}
		return promises;
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string.
	 * @returns {string}
	 */
	#collect_content() {
		// TODO throw in `async` mode
		let content = '';
		for (const item of this.out) {
			if (typeof item === 'string') {
				content += item;
			} else {
				content += item.#collect_content();
			}
		}
		return content;
	}
}

/**
 * @extends {BasePayload<{
 * 	css: Set<{ hash: string; code: string }>,
 * 	title: { value: string },
 * 	uid: () => string
 * }>}
 */
export class HeadPayload extends BasePayload {
	get css() {
		return this._state.css;
	}

	get uid() {
		return this._state.uid;
	}

	// title is boxed so that it gets globally shared between all parent/child heads
	get title() {
		return this._state.title.value;
	}
	set title(value) {
		this._state.title.value = value;
	}

	/**
	 * @param {{ css?: Set<{ hash: string; code: string }>, title?: { value: string }, uid?: () => string }} args
	 */
	constructor({ css = new Set(), title = { value: '' }, uid = () => '' } = {}) {
		super({
			css,
			title,
			uid
		});
	}
}

/**
 * @extends {BasePayload<{
 * 	css: Set<{ hash: string; code: string }>,
 * 	uid: () => string,
 * 	select_value: any,
 * 	head: HeadPayload,
 * }>}
 */
export class Payload extends BasePayload {
	get css() {
		return this._state.css;
	}

	get uid() {
		return this._state.uid;
	}

	get head() {
		return this._state.head;
	}

	get select_value() {
		return this._state.select_value;
	}
	set select_value(value) {
		this._state.select_value = value;
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
		super({
			uid,
			head,
			css,
			select_value: undefined
		});
	}
}

/**
 * Used in legacy mode to handle bindings
 * @param {Payload} to_copy
 * @returns {Payload}
 */
export function copy_payload({ out, css, head, uid }) {
	const payload = new Payload({
		css: new Set(css),
		uid,
		head: new HeadPayload({
			css: new Set(head.css),
			// @ts-expect-error
			title: head._state.title,
			uid: head.uid
		})
	});

	payload.out = [...out];
	payload.head.out = [...head.out];

	return payload;
}

/**
 * Assigns second payload to first
 * @param {Payload} p1
 * @param {Payload} p2
 * @returns {void}
 */
export function assign_payload(p1, p2) {
	p1.out = [...p2.out];
	// this is all legacy code so typescript can go cry in a corner -- I don't want to write setters for all of these because they really shouldn't be settable
	// @ts-expect-error
	p1._state.css = p2.css;
	// @ts-expect-error
	p1._state.head = p2.head;
	// @ts-expect-error
	p1._state.uid = p2.uid;
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
