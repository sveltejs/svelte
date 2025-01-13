import { effect } from '../../reactivity/effects.js';

const key = `@attach-${/*@__PURE__*/ Math.random().toString(36).slice(2)}`;
const name = `Symbol(${key})`;

// TODO this feels a bit belt-and-braces to me, tbh — are we sure we need it?
/**
 * Creates a `Symbol` that Svelte recognises as an attachment key
 */
export function create_attachment_key() {
	return Symbol(key);
}

/**
 * Returns `true` if the symbol was created with `createAttachmentKey`
 * @param {string | symbol} key
 */
export function is_attachment_key(key) {
	return typeof key === 'symbol' && key.toString() === name;
}

/**
 * @param {Element} node
 * @param {() => (node: Element) => void} get_fn
 */
export function attach(node, get_fn) {
	effect(() => {
		return get_fn()(node);
	});
}
