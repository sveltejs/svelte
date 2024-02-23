import { render_effect } from '../../reactivity/computations.js';
import { reconcile_html, remove } from '../../reconciler.js';

/**
 * @param {Element | Text | Comment} anchor_node
 * @param {() => string} get_value
 * @param {boolean} svg
 * @returns {void}
 */
export function html(anchor_node, get_value, svg) {
	/** @type {string} */
	let value;

	/** @type {import('../../types.js').TemplateNode | import('../../types.js').TemplateNode[]} */
	let dom;

	render_effect(() => {
		if (value === (value = get_value())) return;

		if (dom) remove(dom);
		dom = reconcile_html(anchor_node, value, svg);
	});
}
