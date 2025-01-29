/** @import { Effect, TemplateNode, } from '#client' */

import { BOUNDARY_EFFECT, EFFECT_TRANSPARENT } from '../../constants.js';
import { component_context, set_component_context } from '../../context.js';
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
	handle_error,
	set_active_effect,
	set_active_reaction,
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
import { queue_boundary_micro_task } from '../task.js';
import * as e from '../../../shared/errors.js';

const ASYNC_INCREMENT = Symbol();
const ASYNC_DECREMENT = Symbol();

/**
 * @param {Effect} boundary
 * @param {() => Effect | null} fn
 * @returns {Effect | null}
 */
function with_boundary(boundary, fn) {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_ctx = component_context;

	set_active_effect(boundary);
	set_active_reaction(boundary);
	set_component_context(boundary.ctx);

	try {
		return fn();
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
 * @param {((anchor: Node) => void)} children
 * @returns {void}
 */
export function boundary(node, props, children) {
	var anchor = node;

	block(() => {
		/** @type {Effect | null} */
		var main_effect = null;

		/** @type {Effect | null} */
		var pending_effect = null;

		/** @type {Effect | null} */
		var failed_effect = null;

		/** @type {DocumentFragment | null} */
		var offscreen_fragment = null;

		var async_count = 0;
		var boundary = /** @type {Effect} */ (active_effect);
		var hydrate_open = hydrate_node;
		var is_creating_fallback = false;

		/**
		 * @param {() => void} snippet_fn
		 * @returns {Effect | null}
		 */
		function render_snippet(snippet_fn) {
			return with_boundary(boundary, () => {
				is_creating_fallback = true;

				try {
					return branch(snippet_fn);
				} catch (error) {
					handle_error(error, boundary, null, boundary.ctx);
					return null;
				} finally {
					reset_is_throwing_error();
					is_creating_fallback = false;
				}
			});
		}

		function suspend() {
			if (offscreen_fragment || !main_effect) {
				return;
			}

			var effect = main_effect;

			pause_effect(
				effect,
				() => {
					var node = effect.nodes_start;
					var end = effect.nodes_end;

					offscreen_fragment = document.createDocumentFragment();

					while (node !== null) {
						/** @type {TemplateNode | null} */
						var next = node === end ? null : /** @type {TemplateNode} */ (get_next_sibling(node));

						offscreen_fragment.append(node);
						node = next;
					}
				},
				false
			);

			const pending = props.pending;

			if (pending) {
				pending_effect = render_snippet(() => pending(anchor));
			}
		}

		function unsuspend() {
			if (!offscreen_fragment) {
				return;
			}

			if (pending_effect !== null) {
				pause_effect(pending_effect);
			}

			anchor.before(/** @type {DocumentFragment} */ (offscreen_fragment));
			offscreen_fragment = null;

			if (main_effect !== null) {
				resume_effect(main_effect);
			}
		}

		function reset() {
			if (failed_effect !== null) {
				pause_effect(failed_effect);
			}

			main_effect = with_boundary(boundary, () => {
				is_creating_fallback = false;

				try {
					return branch(() => children(anchor));
				} finally {
					reset_is_throwing_error();
				}
			});
		}

		// @ts-ignore We re-use the effect's fn property to avoid allocation of an additional field
		boundary.fn = (/** @type {unknown} */ input) => {
			if (input === ASYNC_INCREMENT) {
				if (async_count++ === 0) {
					queue_boundary_micro_task(suspend);
				}

				return;
			}

			if (input === ASYNC_DECREMENT) {
				if (--async_count === 0) {
					queue_boundary_micro_task(unsuspend);
				}

				return;
			}

			var error = input;
			var onerror = props.onerror;
			let failed = props.failed;

			// If we have nothing to capture the error, or if we hit an error while
			// rendering the fallback, re-throw for another boundary to handle
			if (is_creating_fallback || (!onerror && !failed)) {
				throw error;
			}

			onerror?.(error, reset);

			if (main_effect) {
				destroy_effect(main_effect);
			}

			if (failed_effect) {
				destroy_effect(failed_effect);
			}

			if (hydrating) {
				set_hydrate_node(hydrate_open);
				next();
				set_hydrate_node(remove_nodes());
			}

			if (failed) {
				queue_boundary_micro_task(() => {
					failed_effect = render_snippet(() => {
						failed(
							anchor,
							() => error,
							() => reset
						);
					});
				});
			}
		};

		// @ts-ignore
		boundary.fn.is_pending = () => props.pending;

		if (hydrating) {
			hydrate_next();
		}

		const pending = props.pending;

		if (hydrating && pending) {
			pending_effect = branch(() => pending(anchor));

			// ...now what? we need to start rendering `boundary_fn` offscreen,
			// and either insert the resulting fragment (if nothing suspends)
			// or keep the pending effect alive until it unsuspends.
			// not exactly sure how to do that.

			// future work: when we have some form of async SSR, we will
			// need to use hydration boundary comments to report whether
			// the pending or main block was rendered for a given
			// boundary, and hydrate accordingly
			queueMicrotask(() => {
				destroy_effect(/** @type {Effect} */ (pending_effect));

				main_effect = with_boundary(boundary, () => {
					return branch(() => children(anchor));
				});
			});
		} else {
			main_effect = branch(() => children(anchor));
		}

		reset_is_throwing_error();
	}, EFFECT_TRANSPARENT | BOUNDARY_EFFECT);

	if (hydrating) {
		anchor = hydrate_node;
	}
}

export function capture() {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;

	return function restore() {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);

		// prevent the active effect from outstaying its welcome
		queue_boundary_micro_task(exit);
	};
}

/**
 * @param {Effect} boundary
 */
export function is_pending_boundary(boundary) {
	// @ts-ignore
	return boundary.fn.is_pending();
}

export function suspend() {
	var boundary = active_effect;

	while (boundary !== null) {
		if ((boundary.f & BOUNDARY_EFFECT) !== 0 && is_pending_boundary(boundary)) {
			break;
		}

		boundary = boundary.parent;
	}

	if (boundary === null) {
		e.await_outside_boundary();
	}

	// @ts-ignore
	boundary?.fn(ASYNC_INCREMENT);

	return function unsuspend() {
		// @ts-ignore
		boundary?.fn(ASYNC_DECREMENT);
	};
}

/**
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<() => T>}
 */
export async function save(promise) {
	var restore = capture();
	var value = await promise;

	return () => {
		restore();
		return value;
	};
}

function exit() {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
}
