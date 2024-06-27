import { derived } from '../../reactivity/deriveds.js';
import { block, branch, destroy_effect, render_effect } from '../../reactivity/effects.js';
import { get } from '../../runtime.js';
import { is_array } from '../../utils.js';
import { hydrate_nodes, hydrate_start, hydrating } from '../hydration.js';
import { create_fragment_from_html, remove } from '../reconciler.js';
import { assign_nodes } from '../template.js';

/**
 * @param {Element | Text | Comment} anchor
 * @param {() => string} get_value
 * @param {boolean} svg
 * @param {boolean} mathml
 * @returns {void}
 */
export function html(anchor, get_value, svg, mathml) {
	var value = '';

	/** @type {import('#client').Effect | null} */
	var effect;

	block(anchor, 0, () => {
		if (value === (value = get_value())) return;

		if (effect) {
			destroy_effect(effect);
			effect = null;
		}

		if (value === '') return;

		effect = branch(() => {
			if (hydrating) {
				assign_nodes(
					hydrate_start.previousSibling ?? hydrate_start,
					hydrate_nodes[hydrate_nodes.length - 1]
				);
				return;
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

			assign_nodes(
				/** @type {import('#client').TemplateNode} */ (node.firstChild),
				/** @type {import('#client').TemplateNode} */ (node.lastChild)
			);

			if (svg || mathml) {
				while (node.firstChild) {
					anchor.before(node.firstChild);
				}
			} else {
				anchor.before(node);
			}
		});
	});
}

/**
 * Creates the content for a `@html` tag from its string value,
 * inserts it before the target anchor and returns the new nodes.
 * @template V
 * @param {Element | Text | Comment} anchor
 * @param {V} value
 * @param {boolean} svg
 * @param {boolean} mathml
 * @returns {Element | Comment | (Element | Comment | Text)[]}
 */
function html_to_dom(anchor, value, svg, mathml) {
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
		anchor.before(child);
		return child;
	}

	var nodes = /** @type {Array<Text | Element | Comment>} */ ([...node.childNodes]);

	if (svg || mathml) {
		while (node.firstChild) {
			anchor.before(node.firstChild);
		}
	} else {
		anchor.before(node);
	}

	return nodes;
}
