import { DEV } from 'esm-env';
import { register_style } from '../dev/css.js';
import { effect } from '../reactivity/effects.js';
import {
	create_element,
	get_root_node,
	query_selector,
	append_child,
	set_text_content
} from './operations.js';

/**
 * @param {Node} anchor
 * @param {{ hash: string, code: string }} css
 */
export function append_styles(anchor, css) {
	// TODO RENDERER: disallow css inject with custom renderer?
	// Use `queue_micro_task` to ensure `anchor` is in the DOM, otherwise getRootNode() will yield wrong results
	effect(() => {
		var root = get_root_node(anchor);

		// TODO: DOM access
		var target = /** @type {ShadowRoot} */ (root).host
			? /** @type {ShadowRoot} */ (root)
			: // TODO: DOM access
				/** @type {Document} */ (root).head ?? /** @type {Document} */ (root.ownerDocument).head;

		// Always querying the DOM is roughly the same perf as additionally checking for presence in a map first assuming
		// that you'll get cache hits half of the time, so we just always query the dom for simplicity and code savings.
		if (!query_selector(/** @type {Element} */ (target), '#' + css.hash)) {
			const style = create_element('style');
			// TODO: DOM access
			style.id = css.hash;
			set_text_content(style, css.code);

			append_child(target, style);

			if (DEV) {
				register_style(css.hash, style);
			}
		}
	});
}
