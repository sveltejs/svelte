/** @import { Effect, TemplateNode } from '#client' */
import { HYDRATION_ERROR } from '../../../../constants.js';
import { block, branch, destroy_effect } from '../../reactivity/effects.js';
import { hydrate_next, hydrate_node, hydrating, set_hydrate_node } from '../hydration.js';
import { create_fragment_from_html } from '../reconciler.js';
import { assign_nodes } from '../template.js';
import * as w from '../../warnings.js';
import { hash } from '../../../../utils.js';
import { DEV } from 'esm-env';
import { dev_current_component_function } from '../../runtime.js';

/**
 * @param {Element} element
 * @param {string | null} server_hash
 * @param {string} value
 */
function check_hash(element, server_hash, value) {
	if (!server_hash || server_hash === hash(String(value ?? ''))) return;

	let location;

	// @ts-expect-error
	const loc = element.__svelte_meta?.loc;
	if (loc) {
		location = `near ${loc.file}:${loc.line}:${loc.column}`;
	} else if (dev_current_component_function?.filename) {
		location = `in ${dev_current_component_function.filename}`;
	}

	w.hydration_html_changed(
		location?.replace(/\//g, '/\u200b') // prevent devtools trying to make it a clickable link by inserting a zero-width space
	);
}

/**
 * @param {Element | Text | Comment} node
 * @param {() => string} get_value
 * @param {boolean} svg
 * @param {boolean} mathml
 * @returns {void}
 */
export function html(node, get_value, svg, mathml) {
	var anchor = node;

	var value = '';

	/** @type {Effect | null} */
	var effect;

	block(() => {
		if (value === (value = get_value())) return;

		if (effect) {
			destroy_effect(effect);
			effect = null;
		}

		if (value === '') return;

		effect = branch(() => {
			if (hydrating) {
				// We're deliberately not trying to repair mismatches between server and client,
				// as it's costly and error-prone (and it's an edge case to have a mismatch anyway)
				var hash = /** @type {Comment} */ (hydrate_node).data;
				var next = hydrate_next();
				var last = next;

				while (
					next !== null &&
					(next.nodeType !== 8 || /** @type {Comment} */ (next).data !== '')
				) {
					last = next;
					next = /** @type {TemplateNode} */ (next.nextSibling);
				}

				if (next === null) {
					w.hydration_mismatch();
					throw HYDRATION_ERROR;
				}

				if (DEV) {
					check_hash(/** @type {Element} */ (next.parentNode), hash, value);
				}

				assign_nodes(hydrate_node, last);
				anchor = set_hydrate_node(next);
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
				/** @type {TemplateNode} */ (node.firstChild),
				/** @type {TemplateNode} */ (node.lastChild)
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
