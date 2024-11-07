/** @import { Effect, TemplateNode, } from '#client' */

import { BOUNDARY_EFFECT, EFFECT_TRANSPARENT } from '../../constants.js';
import { block, branch, destroy_effect, pause_effect } from '../../reactivity/effects.js';
import {
	active_effect,
	active_reaction,
	component_context,
	set_active_effect,
	set_active_reaction,
	set_component_context
} from '../../runtime.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	next,
	remove_nodes,
	set_hydrate_node
} from '../hydration.js';
import { queue_micro_task } from '../task.js';

/**
 * @param {Effect} boundary
 * @param {() => void} fn
 */
function with_boundary(boundary, fn) {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_ctx = component_context;
	set_active_effect(boundary);
	set_active_reaction(boundary);
	set_component_context(boundary.ctx);
	try {
		fn();
	} finally {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_ctx);
	}
}

/**
 * @param {TemplateNode} node
 * @param {((anchor: Node) => void)} boundary_fn
 * @param {{
 * 	 onerror?: (error: Error, reset: () => void) => void,
 *   failed?: (anchor: Node, error: () => Error, reset: () => () => void) => void
 * }} props
 * @returns {void}
 */
export function boundary(node, boundary_fn, props) {
	var anchor = node;

	/** @type {Effect | null} */
	var boundary_effect;

	block(() => {
		var boundary = /** @type {Effect} */ (active_effect);
		var hydrate_open = hydrate_node;

		// We re-use the effect's fn property to avoid allocation of an additional field
		boundary.fn = (/** @type { Error }} */ error) => {
			var onerror = props.onerror;
			let failed_snippet = props.failed;

			if (boundary_effect) {
				destroy_effect(boundary_effect);
			} else if (hydrating) {
				set_hydrate_node(hydrate_open);
				next();
				set_hydrate_node(remove_nodes());
			}

			// If we have nothing to capture the error then rethrow the error
			// for another boundary to handle
			if (!onerror && !failed_snippet) {
				throw error;
			}

			// Handle resetting the error boundary
			var reset = () => {
				if (boundary_effect) {
					pause_effect(boundary_effect);
				}
				with_boundary(boundary, () => {
					boundary_effect = null;
					boundary_effect = branch(() => boundary_fn(anchor));
				});
			};

			// Handle the `onerror` event handler
			if (onerror) {
				onerror(error, reset);
			}

			// Handle the `failed` snippet fallback
			if (failed_snippet) {
				// Ensure we create the boundary branch after the catch event cycle finishes
				queue_micro_task(() => {
					with_boundary(boundary, () => {
						boundary_effect = null;
						boundary_effect = branch(() =>
							failed_snippet(
								anchor,
								() => error,
								() => reset
							)
						);
					});
				});
			}
		};

		if (hydrating) {
			hydrate_next();
		}

		boundary_effect = branch(() => boundary_fn(anchor));
	}, EFFECT_TRANSPARENT | BOUNDARY_EFFECT);

	if (hydrating) {
		anchor = hydrate_node;
	}
}
