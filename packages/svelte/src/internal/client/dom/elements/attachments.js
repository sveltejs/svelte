import { effect } from '../../reactivity/effects.js';

/**
 * @param {Element} node
 * @param {() => (node: Element) => void} get_fn
 */
export function attach(node, get_fn) {
	effect(() => {
		const fn = get_fn();

		// we use `&&` rather than `?.` so that things like
		// `{@attach DEV && something_dev_only()}` work
		return fn && fn(node);
	});
}
