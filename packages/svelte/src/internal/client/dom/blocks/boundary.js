/** @import { Effect, TemplateNode, } from '#client' */

import {
	BOUNDARY_EFFECT,
	BOUNDARY_SUSPENDED,
	DERIVED,
	DIRTY,
	EFFECT_PRESERVED,
	EFFECT_RAN,
	EFFECT_TRANSPARENT
} from '../../constants.js';
import { component_context, set_component_context } from '../../context.js';
import { block, branch, destroy_effect, pause_effect } from '../../reactivity/effects.js';
import {
	active_effect,
	active_reaction,
	handle_error,
	set_active_effect,
	set_active_reaction,
	reset_is_throwing_error,
	schedule_effect,
	increment_write_version,
	get
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
import { DEV } from 'esm-env';
import { from_async_derived, set_from_async_derived } from '../../reactivity/deriveds.js';
import { raf } from '../../timing.js';
import { loop } from '../../loop.js';
import { internal_set, mark_reactions, source } from '../../reactivity/sources.js';

const ASYNC_INCREMENT = Symbol();
const ASYNC_DECREMENT = Symbol();
const ADD_CALLBACK = Symbol();

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

var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;

/**
 * @param {TemplateNode} node
 * @param {{
 * 	 onerror?: (error: unknown, reset: () => void) => void;
 *   failed?: (anchor: Node, error: () => unknown, reset: () => () => void) => void;
 *   pending?: (anchor: Node) => void;
 *   showPendingAfter?: number;
 *   showPendingFor?: number;
 * }} props
 * @param {((anchor: Node) => void)} children
 * @returns {void}
 */
export function boundary(node, props, children) {
	var anchor = node;

	var parent_boundary = find_boundary(active_effect);

	var is_pending = source(false);

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

		/** @type {Set<() => void>} */
		var callbacks = new Set();

		var keep_pending_snippet = false;

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

		function reset() {
			async_count = 0;

			if ((boundary.f & BOUNDARY_SUSPENDED) !== 0) {
				boundary.f ^= BOUNDARY_SUSPENDED;
			}

			if (failed_effect !== null) {
				pause_effect(failed_effect, () => {
					failed_effect = null;
				});
			}

			main_effect = with_boundary(boundary, () => {
				is_creating_fallback = false;

				try {
					return branch(() => children(anchor));
				} finally {
					reset_is_throwing_error();
				}
			});

			if (async_count > 0) {
				boundary.f |= BOUNDARY_SUSPENDED;
				show_pending_snippet(true);
			}
		}

		function unsuspend() {
			if (keep_pending_snippet || async_count > 0) {
				return;
			}

			if ((boundary.f & BOUNDARY_SUSPENDED) !== 0) {
				boundary.f ^= BOUNDARY_SUSPENDED;
			}

			// @ts-ignore
			var forks = boundary.fn.forks;

			for (var [signal, entry] of forks) {
				if (signal.v !== entry.v) {
					if ((signal.f & DERIVED) === 0) {
						mark_reactions(signal, DIRTY, undefined, true);
						signal.wv = increment_write_version();
					}
				}
			}
			forks.clear();
			internal_set(is_pending, false);

			for (const fn of callbacks) fn();
			callbacks.clear();

			if (pending_effect) {
				pause_effect(pending_effect, () => {
					pending_effect = null;
				});
			}

			if (offscreen_fragment) {
				anchor.before(offscreen_fragment);
				offscreen_fragment = null;
			}
		}

		/**
		 * @param {boolean} initial
		 */
		function show_pending_snippet(initial) {
			const pending = props.pending;

			if (pending !== undefined) {
				// TODO can this be false?
				if (main_effect !== null) {
					offscreen_fragment = document.createDocumentFragment();
					move_effect(main_effect, offscreen_fragment);
				}

				if (pending_effect === null) {
					pending_effect = branch(() => pending(anchor));
				}

				// TODO do we want to differentiate between initial render and updates here?
				if (!initial) {
					keep_pending_snippet = true;

					var end = raf.now() + (props.showPendingFor ?? 300);

					loop((now) => {
						if (now >= end) {
							keep_pending_snippet = false;
							unsuspend();
							return false;
						}

						return true;
					});
				}
			} else if (parent_boundary) {
				throw new Error('TODO show pending snippet on parent');
			} else {
				throw new Error('no pending snippet to show');
			}
		}

		// @ts-ignore We re-use the effect's fn property to avoid allocation of an additional field
		boundary.fn = (/** @type {unknown} */ input, /** @type {any} */ payload) => {
			if (input === ASYNC_INCREMENT) {
				// post-init, show the pending snippet after a timeout
				if ((boundary.f & BOUNDARY_SUSPENDED) === 0 && (boundary.f & EFFECT_RAN) !== 0) {
					var start = raf.now();
					var end = start + (props.showPendingAfter ?? 500);

					loop((now) => {
						if (async_count === 0) return false;
						if (now < end) return true;

						show_pending_snippet(false);
					});
				}

				boundary.f |= BOUNDARY_SUSPENDED;
				async_count++;

				internal_set(is_pending, true);

				return;
			}

			if (input === ASYNC_DECREMENT) {
				if (--async_count === 0 && !keep_pending_snippet) {
					unsuspend();

					if (main_effect !== null) {
						// TODO do we also need to `resume_effect` here?
						schedule_effect(main_effect);
					}
				}

				return;
			}

			if (input === ADD_CALLBACK) {
				callbacks.add(payload);
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
				main_effect = null;
			}

			if (pending_effect) {
				destroy_effect(pending_effect);
				pending_effect = null;
			}

			if (failed_effect) {
				destroy_effect(failed_effect);
				failed_effect = null;
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
		boundary.fn.forks = new Map();

		// @ts-ignore
		boundary.fn.props = props;

		// @ts-ignore
		boundary.fn.is_pending = is_pending;

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
			reset();
		}

		reset_is_throwing_error();
	}, flags);

	if (hydrating) {
		anchor = hydrate_node;
	}
}

/**
 *
 * @param {Effect} effect
 * @param {DocumentFragment} fragment
 */
function move_effect(effect, fragment) {
	var node = effect.nodes_start;
	var end = effect.nodes_end;

	while (node !== null) {
		/** @type {TemplateNode | null} */
		var next = node === end ? null : /** @type {TemplateNode} */ (get_next_sibling(node));

		fragment.append(node);
		node = next;
	}
}

export function capture(track = true) {
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;

	if (DEV && !track) {
		var was_from_async_derived = from_async_derived;
	}

	return function restore() {
		if (track) {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_component_context);
		} else if (DEV) {
			set_from_async_derived(was_from_async_derived);
		}

		// prevent the active effect from outstaying its welcome
		queue_boundary_micro_task(exit);
	};
}

/**
 * @param {Effect} boundary
 */
export function is_pending_boundary(boundary) {
	// @ts-ignore
	return boundary.fn.props.pending;
}

/**
 * @param {Effect | null} effect
 */
export function get_boundary(effect) {
	var boundary = effect;

	while (boundary !== null) {
		if ((boundary.f & BOUNDARY_EFFECT) !== 0 && is_pending_boundary(boundary)) {
			return boundary;
		}

		boundary = boundary.parent;
	}
	return null;
}

export function suspend() {
	var boundary = get_boundary(active_effect);

	if (boundary === null) {
		e.await_outside_boundary();
	}

	// @ts-ignore
	boundary?.fn(ASYNC_INCREMENT);

	return function unsuspend() {
		// @ts-ignore
		boundary?.fn?.(ASYNC_DECREMENT);
	};
}

/**
 * @template T
 * @param {Promise<T>} promise
 * @param {boolean} [track]
 * @returns {Promise<() => T>}
 */
export async function save(promise, track = true) {
	var restore = capture(track);
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

/**
 * @param {Effect | null} effect
 */
export function find_boundary(effect) {
	while (effect !== null && (effect.f & BOUNDARY_EFFECT) === 0) {
		effect = effect.parent;
	}

	return effect;
}

/**
 * @param {Effect | null} boundary
 * @param {Function} fn
 */
export function add_boundary_callback(boundary, fn) {
	if (boundary === null) {
		throw new Error('TODO');
	}

	// @ts-ignore
	boundary.fn(ADD_CALLBACK, fn);
}

/**
 * @returns {boolean}
 */
export function isPending() {
	var effect = active_effect;
	var boundary = get_boundary(effect);
	// @ts-ignore
	var is_pending = boundary.fn.is_pending;
	return get(is_pending);
}
