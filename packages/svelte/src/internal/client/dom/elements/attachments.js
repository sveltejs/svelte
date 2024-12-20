import { effect } from '../../reactivity/effects.js';

/**
 * @param {Element} node
 * @param {() => (node: Element) => void} get_fn
 */
export function attach(node, get_fn) {
	effect(() => {
		get_fn()(node);
	});
}
