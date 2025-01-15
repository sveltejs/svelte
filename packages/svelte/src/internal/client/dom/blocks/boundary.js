/** @import { Effect, TemplateNode, } from '#client' */

import { BOUNDARY_EFFECT, EFFECT_TRANSPARENT } from '../../constants.js';
import {
	block,
	branch,
	destroy_effect,
	pause_effect,
	resume_effect
} from '../../reactivity/effects.js';
import {
	active_effect,
	active_reaction,
	component_context,
	handle_error,
	set_active_effect,
	set_active_reaction,
	set_component_context,
	reset_is_throwing_error
} from '../../runtime.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	next,
	remove_nodes,
	set_hydrate_node
} from '../hydration.js';
import { get_next_sibling } from '../operations.js';
import { queue_micro_task } from '../task.js';

const SUSPEND_INCREMENT = Symbol();
const SUSPEND_DECREMENT = Symbol();

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
 * @param {{
 * 	 onerror?: (error: unknown, reset: () => void) => void,
 *   failed?: (anchor: Node, error: () => unknown, reset: () => () => void) => void
 *   pending?: (anchor: Node) => void
 * }} props
 * @param {((anchor: Node) => void)} boundary_fn
 * @returns {void}
 */
export function boundary(node, props, boundary_fn) {
	var anchor = node;

	/** @type {Effect} */
	var boundary_effect;
	/** @type {Effect | null} */
	var suspended_effect = null;
	/** @type {DocumentFragment | null} */
	var suspended_fragment = null;
	var suspend_count = 0;

	block(() => {
		var boundary = /** @type {Effect} */ (active_effect);
		var hydrate_open = hydrate_node;
		var is_creating_fallback = false;

		const render_snippet = (/** @type { () => void } */ snippet_fn) => {
			with_boundary(boundary, () => {
				is_creating_fallback = true;

				try {
					boundary_effect = branch(() => {
						snippet_fn();
					});
				} catch (error) {
					handle_error(error, boundary, null, boundary.ctx);
				}

				reset_is_throwing_error();
				is_creating_fallback = false;
			});
		};

		// @ts-ignore We re-use the effect's fn property to avoid allocation of an additional field
		boundary.fn = (/** @type {unknown} */ input) => {
			let pending = props.pending;

			if (input === SUSPEND_INCREMENT) {
				if (!pending) {
					// TODO in this case we need to find the parent boundary
					return false;
				}

				if (suspend_count++ === 0) {
					queue_micro_task(() => {
						if (suspended_effect) {
							return;
						}

						var effect = boundary_effect;
						suspended_effect = boundary_effect;

						pause_effect(
							suspended_effect,
							() => {
								/** @type {TemplateNode | null} */
								var node = effect.nodes_start;
								var end = effect.nodes_end;
								suspended_fragment = document.createDocumentFragment();

								while (node !== null) {
									/** @type {TemplateNode | null} */
									var sibling =
										node === end ? null : /** @type {TemplateNode} */ (get_next_sibling(node));

									node.remove();
									suspended_fragment.append(node);
									node = sibling;
								}
							},
							false
						);

						render_snippet(() => {
							pending(anchor);
						});
					});
				}

				return true;
			}

			if (input === SUSPEND_DECREMENT) {
				if (!pending) {
					// TODO in this case we need to find the parent boundary
					return false;
				}

				if (--suspend_count === 0) {
					queue_micro_task(() => {
						if (!suspended_effect) {
							return;
						}
						if (boundary_effect) {
							destroy_effect(boundary_effect);
						}
						boundary_effect = suspended_effect;
						suspended_effect = null;
						anchor.before(/** @type {DocumentFragment} */ (suspended_fragment));
						resume_effect(boundary_effect);
					});
				}

				return true;
			}

			var error = input;
			var onerror = props.onerror;
			let failed = props.failed;

			// If we have nothing to capture the error, or if we hit an error while
			// rendering the fallback, re-throw for another boundary to handle
			if ((!onerror && !failed) || is_creating_fallback) {
				throw error;
			}

			var reset = () => {
				pause_effect(boundary_effect);

				with_boundary(boundary, () => {
					is_creating_fallback = false;
					boundary_effect = branch(() => boundary_fn(anchor));
					reset_is_throwing_error();
				});
			};

			onerror?.(error, reset);

			if (boundary_effect) {
				destroy_effect(boundary_effect);
			} else if (hydrating) {
				set_hydrate_node(hydrate_open);
				next();
				set_hydrate_node(remove_nodes());
			}

			if (failed) {
				queue_micro_task(() => {
					render_snippet(() => {
						failed(
							anchor,
							() => error,
							() => reset
						);
					});
				});
			}
		};

		if (hydrating) {
			hydrate_next();
		}

		boundary_effect = branch(() => boundary_fn(anchor));
		reset_is_throwing_error();
	}, EFFECT_TRANSPARENT | BOUNDARY_EFFECT);

	if (hydrating) {
		anchor = hydrate_node;
	}
}

/**
 * @param {Effect | null} effect
 * @param {typeof SUSPEND_INCREMENT | typeof SUSPEND_DECREMENT} trigger
 */
function trigger_suspense(effect, trigger) {
	var current = effect;

	while (current !== null) {
		if ((current.f & BOUNDARY_EFFECT) !== 0) {
			// @ts-ignore
			if (current.fn(trigger)) {
				return;
			}
		}
		current = current.parent;
	}
}

export function create_suspense() {
	var current = active_effect;

	const suspend = () => {
		trigger_suspense(current, SUSPEND_INCREMENT);
	};

	const unsuspend = () => {
		trigger_suspense(current, SUSPEND_DECREMENT);
	};

	return [suspend, unsuspend];
}

/**
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<{ read: () => T }>}
 */
export async function preserve_context(promise) {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;

	let boundary = active_effect;
	while (boundary !== null) {
		if ((boundary.f & BOUNDARY_EFFECT) !== 0) {
			break;
		}

		boundary = boundary.parent;
	}

	if (boundary === null) {
		throw new Error('cannot suspend outside a boundary');
	}

	// @ts-ignore
	boundary.fn(SUSPEND_INCREMENT);

	const value = await promise;

	return {
		read() {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_component_context);

			// @ts-ignore
			boundary.fn(SUSPEND_DECREMENT);

			return value;
		}
	};
}
