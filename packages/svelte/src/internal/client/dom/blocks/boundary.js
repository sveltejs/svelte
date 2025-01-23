/** @import { Effect, TemplateNode, } from '#client' */

import { BOUNDARY_EFFECT, DESTROYED, EFFECT_TRANSPARENT } from '../../constants.js';
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
import { queue_boundary_micro_task, queue_post_micro_task } from '../task.js';

const ASYNC_INCREMENT = Symbol();
const ASYNC_DECREMENT = Symbol();

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
	var async_effect = null;
	/** @type {DocumentFragment | null} */
	var async_fragment = null;
	var async_count = 0;

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

			if (input === ASYNC_INCREMENT) {
				if (!pending) {
					// TODO in this case we need to find the parent boundary
					return false;
				}

				if (async_count++ === 0) {
					queue_boundary_micro_task(() => {
						if (async_effect || !boundary_effect) {
							return;
						}

						var effect = boundary_effect;
						async_effect = boundary_effect;

						pause_effect(
							async_effect,
							() => {
								/** @type {TemplateNode | null} */
								var node = effect.nodes_start;
								var end = effect.nodes_end;
								async_fragment = document.createDocumentFragment();

								while (node !== null) {
									/** @type {TemplateNode | null} */
									var sibling =
										node === end ? null : /** @type {TemplateNode} */ (get_next_sibling(node));

									node.remove();
									async_fragment.append(node);
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

			if (input === ASYNC_DECREMENT) {
				if (!pending) {
					// TODO in this case we need to find the parent boundary
					return false;
				}

				if (--async_count === 0) {
					queue_boundary_micro_task(() => {
						if (!async_effect) {
							return;
						}
						if (boundary_effect) {
							destroy_effect(boundary_effect);
						}
						boundary_effect = async_effect;
						async_effect = null;
						anchor.before(/** @type {DocumentFragment} */ (async_fragment));
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
				queue_boundary_micro_task(() => {
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

		const pending = props.pending;

		if (hydrating && pending) {
			boundary_effect = branch(() => pending(anchor));

			// ...now what? we need to start rendering `boundary_fn` offscreen,
			// and either insert the resulting fragment (if nothing suspends)
			// or keep the pending effect alive until it unsuspends.
			// not exactly sure how to do that.

			// future work: when we have some form of async SSR, we will
			// need to use hydration boundary comments to report whether
			// the pending or main block was rendered for a given
			// boundary, and hydrate accordingly
			queueMicrotask(() => {
				if ((!boundary_effect || boundary_effect.f & DESTROYED) !== 0) return;

				destroy_effect(boundary_effect);
				with_boundary(boundary, () => {
					boundary_effect = branch(() => boundary_fn(anchor));
				});
			});
		} else {
			boundary_effect = branch(() => boundary_fn(anchor));
		}

		reset_is_throwing_error();
	}, EFFECT_TRANSPARENT | BOUNDARY_EFFECT);

	if (hydrating) {
		anchor = hydrate_node;
	}
}

/**
 * @param {Effect | null} effect
 * @param {typeof ASYNC_INCREMENT | typeof ASYNC_DECREMENT} trigger
 */
export function trigger_async_boundary(effect, trigger) {
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

// TODO separate this stuff out — suspending and context preservation should
// be distinct concepts

/**
 * @template T
 * @param {() => Promise<T> | Promise<T>} input
 * @returns {Promise<{ exit: () => T }>}
 */
export async function suspend(input) {
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
	boundary?.fn(ASYNC_INCREMENT);

	const promise = typeof input === 'function' ? input() : input;
	// Ensure we reset the context back so it doesn't leak
	set_active_effect(previous_effect);
	set_active_reaction(previous_reaction);
	set_component_context(previous_component_context);

	const value = await promise;

	return {
		exit() {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_component_context);

			// @ts-ignore
			boundary?.fn(ASYNC_DECREMENT);

			return value;
		}
	};
}

export function exit() {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
}
