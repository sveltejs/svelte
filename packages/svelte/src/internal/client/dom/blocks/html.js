import { derived } from '../../reactivity/deriveds.js';
import { render_effect } from '../../reactivity/effects.js';
import { get } from '../../runtime.js';
import { hydrate_start, hydrating } from '../hydration.js';
import { remove_nodes } from '../operations.js';
import { create_fragment_from_html } from '../reconciler.js';

/**
 * @param {Element | Text | Comment} anchor
 * @param {() => string} get_value
 * @param {boolean} svg
 * @param {boolean} mathml
 * @returns {void}
 */
export function html(anchor, get_value, svg, mathml) {
	let value = derived(get_value);

	render_effect(() => {
		var [start, end] = html_to_dom(anchor, get(value), svg, mathml);

		return () => {
			remove_nodes(start, end);
		};
	});
}

/**
 * Creates the content for a `@html` tag from its string value,
 * inserts it before the target anchor and returns the new nodes.
 * @template V
 * @param {Element | Text | Comment} target
 * @param {V} value
 * @param {boolean} svg
 * @param {boolean} mathml
 * @returns {[import('#client').TemplateNode, import('#client').TemplateNode]}
 */
function html_to_dom(target, value, svg, mathml) {
	if (hydrating) {
		return [hydrate_start, hydrate_start];
	}

	var html = value + '';
	if (svg) html = `<svg>${html}</svg>`;
	else if (mathml) html = `<math>${html}</math>`;

	// Don't use create_fragment_with_script_from_html here because that would mean script tags are executed.
	// @html is basically `.innerHTML = ...` and that doesn't execute scripts either due to security reasons.
	/** @type {DocumentFragment | Element} */
	var node = create_fragment_from_html(html);

	if (svg || mathml) {
		node = /** @type {Element} */ (node.firstChild);
	}

	if (node.childNodes.length === 1) {
		var child = /** @type {Text | Element | Comment} */ (node.firstChild);
		target.before(child);
		return [child, child];
	}

	var first = /** @type {import('#client').TemplateNode} */ (node.firstChild);
	var last = /** @type {import('#client').TemplateNode} */ (node.lastChild);

	if (svg || mathml) {
		while (node.firstChild) {
			target.before(node.firstChild);
		}
	} else {
		target.before(node);
	}

	return [first, last];
}
