import { render_effect } from '../../reactivity/effects.js';
import { reconcile_html, remove } from '../reconciler.js';

/**
 * @param {Element | Text | Comment} dom
 * @param {() => string} get_value
 * @param {boolean} svg
 * @returns {void}
 */
export function html(dom, get_value, svg) {
	/** @type {import('#client').Dom} */
	let html_dom;

	/** @type {string} */
	let value;

	const effect = render_effect(() => {
		if (value !== (value = get_value())) {
			if (html_dom) remove(html_dom);
			html_dom = reconcile_html(dom, value, svg);
		}
	});

	effect.ondestroy = () => {
		if (html_dom) {
			remove(html_dom);
		}
	};
}
