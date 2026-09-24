import { DEV } from 'esm-env';
import { register_style } from '../dev/css.js';
import { effect } from '../reactivity/effects.js';
import { create_element } from './operations.js';
import { active_effect } from '../runtime.js';

/**
 * @param {Node} anchor
 * @param {{ hash: string, code: string }} css
 */
export function append_styles(anchor, css) {
	// Use an effect to ensure `anchor` is in the DOM, otherwise getRootNode() will yield wrong results
	effect(() => {
		// Bit of a hack: branches.js/each.js use offscreen fragments with temporary text nodes that will
		// never be connected to the real dom. Therfore walk up to the branch that has created the component
		// whose styles we want to append, and check its node instead. It will be connected by the time we get here.
		anchor = active_effect?.parent?.nodes?.start ?? anchor;
		var root = anchor.getRootNode();

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
