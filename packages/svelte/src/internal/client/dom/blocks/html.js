/** @import { Effect, TemplateNode } from '#client' */
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
import { dev_current_component_function } from '../../context.js';
import { create_element, get_first_child, get_next_sibling } from '../operations.js';
import { active_effect } from '../../runtime.js';
import { COMMENT_NODE } from '#client/constants';

/**
 * @param {Element} element
 * @param {string | null} server_hash
 * @param {string | TrustedHTML} value
 */
function check_hash(element, server_hash, value) {
	if (!server_hash || server_hash === hash(String(value ?? ''))) return;

	let location;

	// @ts-expect-error
	const loc = element.__svelte_meta?.loc;
	if (loc) {
		location = `near ${loc.file}:${loc.line}:${loc.column}`;
	} else if (dev_current_component_function?.[FILENAME]) {
		location = `in ${dev_current_component_function[FILENAME]}`;
	}

	w.hydration_html_changed(sanitize_location(location));
}

/**
 * @param {Element | Text | Comment} node
 * @param {() => string | TrustedHTML} get_value
 * @param {boolean} [svg]
 * @param {boolean} [mathml]
 * @param {boolean} [skip_warning]
 * @returns {void}
 */
export function html(node, get_value, svg = false, mathml = false, skip_warning = false) {
	var anchor = node;

	/** @type {string | TrustedHTML} */
	var value = '';

	template_effect(() => {
		var effect = /** @type {Effect} */ (active_effect);

		if (value === (value = get_value() ?? '')) {
			if (hydrating) hydrate_next();
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
				check_hash(/** @type {Element} */ (next.parentNode), hash, value);
			}

			assign_nodes(hydrate_node, last);
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

		if (svg || mathml) {
			while (get_first_child(node)) {
				anchor.before(/** @type {TemplateNode} */ (get_first_child(node)));
			}
		} else {
			anchor.before(node);
		}
	});
}
