import { DEV } from 'esm-env';
import { queue_micro_task } from './task.js';

var seen = new Set();

/**
 * @param {Node} anchor
 * @param {{ hash: string, code: string }} css
 * @param {boolean} [is_custom_element]
 */
export function append_styles(anchor, css, is_custom_element = false) {
	// in dev, always check the DOM, so that styles can be replaced with HMR
	if (!DEV && !is_custom_element) {
		if (seen.has(css)) return;
		seen.add(css);
	}

	// Use `queue_micro_task` to ensure `anchor` is in the DOM, otherwise getRootNode() will yield wrong results
	queue_micro_task(() => {
		var root = anchor.getRootNode();

		var target = /** @type {ShadowRoot} */ (root).host
			? /** @type {ShadowRoot} */ (root)
			: /** @type {Document} */ (root).head ?? /** @type {Document} */ (root.ownerDocument).head;

		if (!target.querySelector('#' + css.hash)) {
			const style = document.createElement('style');
			style.id = css.hash;
			style.textContent = css.code;

			target.appendChild(style);
		}
	});
}
