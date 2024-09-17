import { DEV } from 'esm-env';
import { queue_micro_task } from './task.js';
import { register_style } from '../dev/css.js';

var roots = new WeakMap();

/**
 * @param {Node} anchor
 * @param {{ hash: string, code: string }} css
 * @param {boolean} [is_custom_element]
 */
export function append_styles(anchor, css, is_custom_element) {
	// in dev, always check the DOM, so that styles can be replaced with HMR
	if (!DEV && !is_custom_element) {
		var doc = /** @type {Document} */ (anchor.ownerDocument);

		if (!roots.has(doc)) roots.set(doc, new Set());
		const seen = roots.get(doc);

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

			if (DEV) {
				register_style(css.hash, style);
			}
		}
	});
}
