import { queue_micro_task } from './task.js';

var seen = new Set();

/**
 * @param {Node} anchor
 * @param {{ hash: string, code: string }} css
 */
export function append_styles(anchor, css) {
	if (seen.has(css.hash)) return;
	seen.add(css.hash);

	// Use `queue_micro_task` to ensure `anchor` is in the DOM, otherwise getRootNode() will yield wrong results
	queue_micro_task(() => {
		var root = anchor.getRootNode();

		var target = /** @type {ShadowRoot} */ (root).host
			? /** @type {ShadowRoot} */ (root)
			: /** @type {Document} */ (root).head;

		if (!target.querySelector('#' + css.hash)) {
			const style = document.createElement('style');
			style.id = css.hash;
			style.textContent = css.code;

			target.appendChild(style);
		}
	});
}
