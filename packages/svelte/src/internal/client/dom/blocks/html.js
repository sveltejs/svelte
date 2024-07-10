/** @import { Effect, TemplateNode } from '#client' */
import { HYDRATION_ERROR } from '../../../../constants.js';
import { block, branch, destroy_effect } from '../../reactivity/effects.js';
import { hydrate_next, hydrate_node, hydrating, set_hydrate_node } from '../hydration.js';
import { create_fragment_from_html } from '../reconciler.js';
import { assign_nodes } from '../template.js';
import * as w from '../../warnings.js';
import { hash } from '../../../../utils.js';
import { DEV } from 'esm-env';

/**
 * @param {string | null} server_hash
 * @param {string} value
 */
function check_hash_in_dev_hydration(server_hash, value) {
	if (!DEV) return;
	if (!server_hash || server_hash === hash(value)) return;

	// limit the length of the value shown in the error as this might get lengthy
	w.hydration_html_changed(`${value.slice(0, 25)}${value.length > 25 ? '...' : ''}`);
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

		const hashed = hydrate_node ? /** @type {Comment} */ (hydrate_node).data : null;

		effect = branch(() => {
			if (hydrating) {
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

				check_hash_in_dev_hydration(hashed, value);

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
