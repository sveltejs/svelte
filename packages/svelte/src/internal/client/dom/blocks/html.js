import { derived } from '../../reactivity/deriveds.js';
import { render_effect } from '../../reactivity/effects.js';
import { current_effect, get } from '../../runtime.js';
import { is_array } from '../../utils.js';
import { hydrate_nodes, hydrating } from '../hydration.js';
import { create_fragment_from_html, remove } from '../reconciler.js';
import { push_template_node } from '../template.js';

/**
 * @param {import('#client').Effect} effect
 * @param {(Element | Comment | Text)[]} to_remove
 * @returns {void}
 */
function remove_from_parent_effect(effect, to_remove) {
	const dom = effect.dom;

	if (is_array(dom)) {
		for (let i = dom.length - 1; i >= 0; i--) {
			if (to_remove.includes(dom[i])) {
				dom.splice(i, 1);
				break;
			}
		}
	} else if (dom !== null && to_remove.includes(dom)) {
		effect.dom = null;
	}
}

/**
 * @param {Element | Text | Comment} anchor
 * @param {() => string} get_value
 * @param {boolean} svg
 * @returns {void}
 */
export function html(anchor, get_value, svg) {
	const parent_effect = anchor.parentNode !== current_effect?.dom ? current_effect : null;
	let value = derived(get_value);

	render_effect(() => {
		var dom = html_to_dom(anchor, parent_effect, get(value), svg);

		if (dom) {
			return () => {
				if (parent_effect !== null) {
					remove_from_parent_effect(parent_effect, is_array(dom) ? dom : [dom]);
				}
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
 * @returns {Element | Comment | (Element | Comment | Text)[]}
 */
function html_to_dom(target, effect, value, svg) {
	if (hydrating) return hydrate_nodes;

	var html = value + '';
	if (svg) html = `<svg>${html}</svg>`;

	// Don't use create_fragment_with_script_from_html here because that would mean script tags are executed.
	// @html is basically `.innerHTML = ...` and that doesn't execute scripts either due to security reasons.
	/** @type {DocumentFragment | Element} */
	var node = create_fragment_from_html(html);

	if (svg) {
		node = /** @type {Element} */ (node.firstChild);
	}

	if (node.childNodes.length === 1) {
		var child = /** @type {Text | Element | Comment} */ (node.firstChild);
		target.before(child);
		if (effect !== null) {
			push_template_node(child, effect);
		}
		return child;
	}

	var nodes = /** @type {Array<Text | Element | Comment>} */ ([...node.childNodes]);

	if (svg) {
		while (node.firstChild) {
			target.before(node.firstChild);
		}
	} else {
		target.before(node);
	}

	if (effect !== null) {
		push_template_node(nodes, effect);
	}

	return nodes;
}
