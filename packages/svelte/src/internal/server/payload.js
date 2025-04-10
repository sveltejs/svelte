export class Payload {
	/** @type {Set<{ hash: string; code: string }>} */
	css = new Set();
	out = '';
	uid = () => '';

	head = {
		/** @type {Set<{ hash: string; code: string }>} */
		css: new Set(),
		title: '',
		out: '',
		uid: () => ''
	};

	constructor(id_prefix = '') {
		this.uid = props_id_generator(id_prefix);
		this.head.uid = this.uid;
	}
}

/**
 * Used in legacy mode to handle bindings
 * @param {Payload} to_copy
 * @returns {Payload}
 */
export function copy_payload({ out, css, head, uid }) {
	const payload = new Payload();

	payload.out = out;
	payload.css = new Set(css);
	payload.uid = uid;

	payload.head = {
		title: head.title,
		out: head.out,
		css: new Set(head.css),
		uid: head.uid
	};

	return payload;
}

/**
 * Assigns second payload to first
 * @param {Payload} p1
 * @param {Payload} p2
 * @returns {void}
 */
export function assign_payload(p1, p2) {
	p1.out = p2.out;
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
