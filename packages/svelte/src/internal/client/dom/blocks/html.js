/** @import { DevStackEntry, Effect, TemplateNode } from '#client' */
/** @import {} from 'trusted-types' */
import {
	FILENAME,
	HYDRATION_ERROR,
	NAMESPACE_SVG,
	NAMESPACE_MATHML
} from '../../../../constants.js';
import { remove_effect_dom, template_effect } from '../../reactivity/effects.js';
import { hydrate_next, hydrate_node, hydrating, set_hydrate_node } from '../hydration.js';

import { assign_nodes } from '../template.js';
import * as w from '../../warnings.js';
import { hash, sanitize_location } from '../../../../utils.js';
import { DEV } from 'esm-env';
import { component_context, dev_current_component_function, dev_stack } from '../../context.js';
import { create_element, get_first_child, get_next_sibling } from '../operations.js';
import { active_effect } from '../../runtime.js';
import { COMMENT_NODE, ELEMENT_NODE } from '#client/constants';

/**
 * @param {string | null} server_hash
 * @param {string | TrustedHTML} value
 * @param {[string, number, number] | undefined} loc
 */
function check_hash(server_hash, value, loc) {
	if (!server_hash || server_hash === hash(String(value ?? ''))) return;

	let location;

	if (loc) {
		location = `near ${loc[0]}:${loc[1]}:${loc[2]}`;
	} else if (dev_current_component_function?.[FILENAME]) {
		location = `in ${dev_current_component_function[FILENAME]}`;
	}

	w.hydration_html_changed(sanitize_location(location));
}

/**
 * Assigns the location of the `{@html ...}` tag to the top-level elements it created,
 * which also prevents the surrounding template from assigning its locations to them
 * @param {Effect} effect
 * @param {DevStackEntry | null} parent
 * @param {[string, number, number]} loc
 */
function assign_locations(effect, parent, loc) {
	if (effect.nodes === null) return;

	/** @type {TemplateNode | null} */
	var node = effect.nodes.start;

	while (node !== null) {
		if (node.nodeType === ELEMENT_NODE) {
			// @ts-expect-error
			node.__svelte_meta = {
				parent,
				loc: { file: loc[0], line: loc[1], column: loc[2] },
				component: component_context
			};
		}

		if (node === effect.nodes.end) break;
		node = get_next_sibling(node);
	}
}

/**
 * @param {Element | Text | Comment} node
 * @param {() => string | TrustedHTML} get_value
 * @param {boolean} [is_controlled]
 * @param {boolean} [svg]
 * @param {boolean} [mathml]
 * @param {boolean} [skip_warning]
 * @param {[string, number, number]} [location] the filename, line and column of the tag
 * @returns {void}
 */
export function html(
	node,
	get_value,
	is_controlled = false,
	svg = false,
	mathml = false,
	skip_warning = false,
	location
) {
	var anchor = node;
	var parent = DEV ? dev_stack : null;

	/** @type {string | TrustedHTML} */
	var value = '';

	if (is_controlled) {
		var parent_node = /** @type {Element} */ (node);

		if (hydrating) {
			anchor = set_hydrate_node(get_first_child(parent_node));
		}
	}

	template_effect(() => {
		var effect = /** @type {Effect} */ (active_effect);

		if (value === (value = get_value() ?? '')) {
			if (hydrating) hydrate_next();
			return;
		}

		if (is_controlled && !hydrating) {
			// When @html is the only child, use innerHTML directly.
			// This also handles contenteditable, where the user may delete the anchor comment.
			effect.nodes = null;
			parent_node.innerHTML = /** @type {string} */ (value);

			if (value !== '') {
				assign_nodes(
					/** @type {TemplateNode} */ (get_first_child(parent_node)),
					/** @type {TemplateNode} */ (parent_node.lastChild)
				);

				if (DEV && location) assign_locations(effect, parent, location);
			}

			return;
		}

		if (effect.nodes !== null) {
			remove_effect_dom(effect.nodes.start, /** @type {TemplateNode} */ (effect.nodes.end));
			effect.nodes = null;
		}

		if (value === '') return;

		if (hydrating) {
			// We're deliberately not trying to repair mismatches between server and client,
			// as it's costly and error-prone (and it's an edge case to have a mismatch anyway)
			var hash = /** @type {Comment} */ (hydrate_node).data;

			/** @type {TemplateNode | null} */
			var next = hydrate_next();
			var last = next;

			while (
				next !== null &&
				(next.nodeType !== COMMENT_NODE || /** @type {Comment} */ (next).data !== '')
			) {
				last = next;
				next = get_next_sibling(next);
			}

			if (next === null) {
				w.hydration_mismatch();
				throw HYDRATION_ERROR;
			}

			if (DEV && !skip_warning) {
				check_hash(hash, value, location);
			}

			assign_nodes(hydrate_node, last);
			if (DEV && location) assign_locations(effect, parent, location);
			anchor = set_hydrate_node(next);
			return;
		}

		// Don't use create_fragment_with_script_from_html here because that would mean script tags are executed.
		// @html is basically `.innerHTML = ...` and that doesn't execute scripts either due to security reasons.
		// Use a <template>, <svg>, or <math> wrapper depending on context. If value is a TrustedHTML object,
		// it will be assigned directly to innerHTML without coercion — this allows {@html policy.createHTML(...)} to work.
		var ns = svg ? NAMESPACE_SVG : mathml ? NAMESPACE_MATHML : undefined;
		var wrapper = /** @type {HTMLTemplateElement | SVGElement | MathMLElement} */ (
			create_element(svg ? 'svg' : mathml ? 'math' : 'template', ns)
		);
		wrapper.innerHTML = /** @type {any} */ (value);

		/** @type {DocumentFragment | Element} */
		var node = svg || mathml ? wrapper : /** @type {HTMLTemplateElement} */ (wrapper).content;

		assign_nodes(
			/** @type {TemplateNode} */ (get_first_child(node)),
			/** @type {TemplateNode} */ (node.lastChild)
		);

		if (DEV && location) assign_locations(effect, parent, location);

		if (svg || mathml) {
			while (get_first_child(node)) {
				anchor.before(/** @type {TemplateNode} */ (get_first_child(node)));
			}
		} else {
			anchor.before(node);
		}
	});
}
