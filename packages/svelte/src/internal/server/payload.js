import { deferred } from '../shared/utils';

export class HeadPayload {
	/** @type {Set<{ hash: string; code: string }>} */
	css = new Set();
	/** @type {string[]} */
	out = [];
	uid = () => '';
	title = '';

	constructor(
		/** @type {Set<{ hash: string; code: string }>} */ css = new Set(),
		/** @type {string[]} */ out = [],
		title = '',
		uid = () => ''
	) {
		this.css = css;
		this.out = out;
		this.title = title;
		this.uid = uid;
	}
}

export class Payload {
	/** @type {Set<{ hash: string; code: string }>} */
	css;
	/** @type {(string | ChildPayload)[]} */
	out = [];
	/** @type {() => string} */
	uid;
	/** @type {string | undefined} */
	select_value = undefined;
	/** @type {HeadPayload} */
	head;
	/** @type {'sync' | 'async'} */
	mode;
	/** @type {Promise<string>[]} */
	tail = [];

	/**
	 * @param {{ id_prefix?: string, mode?: 'sync' | 'async', head?: HeadPayload, uid?: () => string, out?: (string | ChildPayload)[], css?: Set<{ hash: string; code: string }>, select_value?: any }} args
	 */
	constructor({
		id_prefix = '',
		mode = 'sync',
		head = new HeadPayload(),
		uid = props_id_generator(id_prefix),
		css = new Set()
	} = {}) {
		this.uid = uid;
		this.head = head;
		this.mode = mode;
		this.css = css;
	}

	/**
	 * Create a child scope. `front` represents the initial, synchronous code, and `back` represents all code from the first `await` onwards.
	 * Typically a child will be created for each component.
	 * @param {{ front: (args: { payload: Payload }) => void, back: (args: { payload: Payload }) => Promise<void> }} args
	 * @returns {void}
	 */
	child({ front, back }) {
		const child = new ChildPayload(this);
		front({ payload: child });
		// TODO: boundary stuff? Or does this go inside the `back` function?
		back({ payload: child }).then(() => child.deferred.resolve());
	}

	/**
	 * Waits for all child payloads to finish their blocking asynchronous work, then returns the generated HTML.
	 * @returns {Promise<string>}
	 */
	async collect_async() {
		// TODO throw in `sync` mode
		/** @type {Promise<void>[]} */
		const promises = [];

		/**
		 * @param {(string | ChildPayload)[]} items
		 */
		function collect_promises(items) {
			for (const item of items) {
				if (item instanceof ChildPayload) {
					promises.push(item.deferred.promise);
					collect_promises(item.out);
				}
			}
		}

		collect_promises(this.out);
		await Promise.all(promises);
		return this.collect();
	}

	/**
	 * Collect all of the code from the `out` array and return it as a string. If in `async` mode, wait on
	 * `finished` prior to collecting.
	 * @returns {string}
	 */
	collect() {
		// TODO throw in `async` mode
		let html = '';
		for (const item of this.out) {
			if (typeof item === 'string') {
				html += item;
			} else {
				html += item.collect();
			}
		}
		return html;
	}
}

class ChildPayload extends Payload {
	deferred = /** @type {ReturnType<typeof deferred<void>>} */ (deferred());

	/**
	 * @param {Payload} parent
	 */
	constructor(parent) {
		super({
			mode: parent.mode,
			head: parent.head,
			uid: parent.uid,
			css: parent.css
		});
		this.root = parent;
		parent.out.push(this);
	}
}

/**
 * Used in legacy mode to handle bindings
 * @param {Payload} to_copy
 * @returns {Payload}
 */
export function copy_payload({ out, css, head, uid }) {
	const payload = new Payload();

	payload.out = [...out];
	payload.css = new Set(css);
	payload.uid = uid;

	payload.head = new HeadPayload();
	payload.head.out = [...head.out];
	payload.head.css = new Set(head.css);
	payload.head.title = head.title;
	payload.head.uid = head.uid;

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
	p1.css = p2.css;
	p1.head = p2.head;
	p1.uid = p2.uid;
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
