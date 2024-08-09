import { DEV } from 'esm-env';
import { effect } from '../reactivity/effects.js';

var css_counter = new Map();

/**
 * @param {Node} anchor
 * @param {{ hash: string, code: string }} css
 */
export function append_styles(anchor, css) {
	const maybe_append_styles = () => {
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
	};

	// Use an effect to ensure `anchor` is in the DOM, otherwise getRootNode() will yield wrong results
	effect(() => {
		// In dev, always check the DOM, so that styles can be replaced with HMR
		if (DEV) {
			maybe_append_styles();
			return;
		}
		// Otherwise, for prod we can use the css object as a key and count the usage to skip the lookup
		var count = css_counter.get(css) ?? 0;

		css_counter.set(css, count + 1);

		if (count > 0) return;

		maybe_append_styles();

		return () => {
			var count = css_counter.get(css) - 1;
			css_counter.set(css, count);
			if (count === 0) css_counter.delete(css);
		};
	});
}
