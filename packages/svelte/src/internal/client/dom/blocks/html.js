import { derived } from '../../reactivity/deriveds.js';
import { render_effect } from '../../reactivity/effects.js';
import { get } from '../../runtime.js';
import { reconcile_html, remove } from '../reconciler.js';

/**
 * @param {Element | Text | Comment} anchor
 * @param {() => string} get_value
 * @param {boolean} svg
 * @returns {void}
 */
export function html(anchor, get_value, svg) {
	let value = derived(get_value);

	render_effect(() => {
		var dom = reconcile_html(anchor, get(value), svg);

		if (dom) {
			return () => remove(dom);
		}
	});
}
