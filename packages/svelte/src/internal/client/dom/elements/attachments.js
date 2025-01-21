import { effect } from '../../reactivity/effects.js';

/**
 * @param {Element} node
 * @param {() => (node: Element) => void} get_fn
 */
export function attach(node, get_fn) {
	effect(() => {
		const attachment = get_fn();

		if (Array.isArray(attachment)) {
			for (const fn of attachment) {
				if (fn) {
					effect(() => fn(node));
				}
			}
		} else if (attachment) {
			return attachment(node);
		}
	});
}
