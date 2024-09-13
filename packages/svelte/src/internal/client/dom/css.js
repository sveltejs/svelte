import { DEV } from 'esm-env';
import { queue_micro_task } from './task.js';

var root_seen = new WeakMap();

/**
 * @param {Node} anchor
 * @param {{ hash: string, code: string }} css
 */
export function append_styles(anchor, css) {
	// Use `queue_micro_task` to ensure `anchor` is in the DOM, otherwise getRootNode() will yield wrong results
	queue_micro_task(() => {
		var root = anchor.getRootNode();

		// in dev, always check the DOM, so that styles can be replaced with HMR
		if (!DEV) {
			let seen = root_seen.get(root);
			if (!seen) {
				seen = new Set();
				root_seen.set(root, seen);
			}
			
			if (seen.has(css)) return;
			seen.add(css);
		}

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
