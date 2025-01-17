import { effect } from '../../reactivity/effects.js';

/**
 * @param {Element} node
 * @param {() => Array<(node: Element) => void>} get_fn
 */
export function attach(node, get_fn) {
	effect(() => {
		const fns = get_fn();

		fns.forEach((fn) => {
			// we use `&&` rather than `?.` so that things like
			// `attachments={[DEV && something_dev_only()]}` work
			return fn && fn(node);
		});
	});
}
