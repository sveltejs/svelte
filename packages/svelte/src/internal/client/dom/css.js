import { DEV } from 'esm-env';
import { register_style } from '../dev/css.js';
import { effect } from '../reactivity/effects.js';
import { active_effect } from '../runtime.js';
import { create_element } from './operations.js';

/**
 * Resolves the node whose root should be used to append styles into. The `anchor`
 * is usually connected to the DOM by the time the effect runs, but in some cases
 * (e.g. a component rendered in a deferred/offscreen branch whose anchor node is
 * removed when the branch is committed) it can be disconnected. In that case
 * `getRootNode()` would return the detached node and styles would wrongly end up
 * in `document.head` instead of the enclosing shadow root, so we fall back to a
 * connected node from the surrounding effect tree.
 * @param {Node} anchor
 * @returns {Node}
 */
function get_style_root(anchor) {
	if (anchor.isConnected) return anchor;

	var effect = active_effect;

	while (effect !== null) {
		var start = effect.nodes?.start;

		if (start != null && start.isConnected) {
			return start;
		}

		effect = effect.parent;
	}

	return anchor;
}

/**
 * @param {Node} anchor
 * @param {{ hash: string, code: string }} css
 */
export function append_styles(anchor, css) {
	// Use an effect to ensure `anchor` is in the DOM, otherwise getRootNode() will yield wrong results
	effect(() => {
		var root = get_style_root(anchor).getRootNode();

		var target = /** @type {ShadowRoot} */ (root).host
			? /** @type {ShadowRoot} */ (root)
			: /** @type {Document} */ (root).head ?? /** @type {Document} */ (root.ownerDocument).head;

		// Always querying the DOM is roughly the same perf as additionally checking for presence in a map first assuming
		// that you'll get cache hits half of the time, so we just always query the dom for simplicity and code savings.
		if (!target.querySelector('#' + css.hash)) {
			const style = create_element('style');
			style.id = css.hash;
			style.textContent = css.code;

			target.appendChild(style);

			if (DEV) {
				register_style(css.hash, style);
			}
		}
	});
}
