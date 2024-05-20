import { derived } from '../../reactivity/deriveds.js';
import { render_effect } from '../../reactivity/effects.js';
import { current_effect, get } from '../../runtime.js';
import { hydrate_nodes, hydrating } from '../hydration.js';
import { create_fragment_from_html, remove } from '../reconciler.js';

/**
 * @param {Element | Text | Comment} anchor
 * @param {() => string} get_value
 * @param {boolean} svg
 * @param {boolean} mathml
 * @returns {void}
 */
export function html(anchor, get_value, svg, mathml) {
	const parent_effect = /** @type {import('#client').Effect} */ (current_effect);
	let value = derived(get_value);

	render_effect(() => {
		var dom = html_to_dom(anchor, parent_effect, get(value), svg, mathml);

		if (dom) {
			return () => {
				remove(dom);
			};
		}
	});
}

/**
 * Creates the content for a `@html` tag from its string value,
 * inserts it before the target anchor and returns the new nodes.
 * @template V
 * @param {Element | Text | Comment} target
 * @param {import('#client').Effect | null} effect
 * @param {V} value
 * @param {boolean} svg
 * @param {boolean} mathml
 * @returns {Element | Comment | (Element | Comment | Text)[]}
 */
function html_to_dom(target, effect, value, svg, mathml) {
	if (hydrating) return hydrate_nodes;

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
		return child;
	}

	var nodes = /** @type {Array<Text | Element | Comment>} */ ([...node.childNodes]);

	if (svg || mathml) {
		while (node.firstChild) {
			target.before(node.firstChild);
		}
	} else {
		target.before(node);
	}

	return nodes;
}
