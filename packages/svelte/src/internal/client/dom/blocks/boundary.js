/** @import { Effect, TemplateNode, } from '#client' */

import { BOUNDARY_EFFECT, EFFECT_PRESERVED, EFFECT_TRANSPARENT } from '#client/constants';
import { component_context, set_component_context } from '../../context.js';
import { block, branch, destroy_effect, pause_effect } from '../../reactivity/effects.js';
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
import { DEV } from 'esm-env';
import { from_async_derived, set_from_async_derived } from '../../reactivity/deriveds.js';
import { Fork } from '../../reactivity/forks.js';

/**
 * @typedef {{
 * 	 onerror?: (error: unknown, reset: () => void) => void;
 *   failed?: (anchor: Node, error: () => unknown, reset: () => () => void) => void;
 *   pending?: (anchor: Node) => void;
 * }} BoundaryProps
 */

var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;

/**
 * @param {TemplateNode} node
 * @param {BoundaryProps} props
 * @param {((anchor: Node) => void)} children
 * @returns {void}
 */
export function boundary(node, props, children) {
	new Boundary(node, props, children);
}

export class Boundary {
	inert = false;
	ran = false;

	/** @type {Boundary | null} */
	parent;

	/** @type {TemplateNode} */
	#anchor;

	/** @type {TemplateNode} */
	#hydrate_open;

	/** @type {BoundaryProps} */
	#props;

	/** @type {((anchor: Node) => void)} */
	#children;

	/** @type {Effect} */
	#effect;

	/** @type {Effect | null} */
	#main_effect = null;

	/** @type {Effect | null} */
	#pending_effect = null;

	/** @type {Effect | null} */
	#failed_effect = null;

	/** @type {DocumentFragment | null} */
	#offscreen_fragment = null;

	#pending_count = 0;
	#is_creating_fallback = false;

	/**
	 * @param {TemplateNode} node
	 * @param {BoundaryProps} props
	 * @param {((anchor: Node) => void)} children
	 */
	constructor(node, props, children) {
		this.#anchor = node;
		this.#props = props;
		this.#children = children;

		this.#hydrate_open = hydrate_node;

		this.parent = /** @type {Effect} */ (active_effect).b;

		this.#effect = block(() => {
			/** @type {Effect} */ (active_effect).b = this;

			if (hydrating) {
				hydrate_next();
			}

			const pending = this.#props.pending;

			if (hydrating && pending) {
				this.#pending_effect = branch(() => pending(this.#anchor));

				// future work: when we have some form of async SSR, we will
				// need to use hydration boundary comments to report whether
				// the pending or main block was rendered for a given
				// boundary, and hydrate accordingly
				queueMicrotask(() => {
					this.#main_effect = this.#run(() => {
						Fork.ensure();
						return branch(() => this.#children(this.#anchor));
					});

					if (this.#pending_count === 0) {
						pause_effect(/** @type {Effect} */ (this.#pending_effect), () => {
							this.#pending_effect = null;
						});
					}
				});
			} else {
				this.#main_effect = branch(() => children(this.#anchor));

				if (this.#pending_count > 0) {
					this.#show_pending_snippet();
				}
			}

			reset_is_throwing_error();
		}, flags);

		this.ran = true;

		if (hydrating) {
			this.#anchor = hydrate_node;
		}
	}

	has_pending_snippet() {
		return !!this.#props.pending;
	}

	/**
	 * @param {() => Effect | null} fn
	 */
	#run(fn) {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;

		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);

		try {
			return fn();
		} finally {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}

	#show_pending_snippet() {
		const pending = this.#props.pending;

		if (pending !== undefined) {
			// TODO can this be false?
			if (this.#main_effect !== null) {
				this.#offscreen_fragment = document.createDocumentFragment();
				move_effect(this.#main_effect, this.#offscreen_fragment);
			}

			if (this.#pending_effect === null) {
				this.#pending_effect = branch(() => pending(this.#anchor));
			}
		} else if (this.parent) {
			throw new Error('TODO show pending snippet on parent');
		} else {
			throw new Error('no pending snippet to show');
		}
	}

	commit() {
		if (this.#pending_effect) {
			pause_effect(this.#pending_effect, () => {
				this.#pending_effect = null;
			});
		}

		if (this.#offscreen_fragment) {
			this.#anchor.before(this.#offscreen_fragment);
			this.#offscreen_fragment = null;
		}
	}

	increment() {
		this.#pending_count++;
	}

	decrement() {
		if (--this.#pending_count === 0) {
			this.commit();

			if (this.#main_effect !== null) {
				// TODO do we also need to `resume_effect` here?
				// schedule_effect(this.#main_effect);
			}
		}
	}

	/** @param {unknown} error */
	error(error) {
		var onerror = this.#props.onerror;
		let failed = this.#props.failed;

		const reset = () => {
			this.#pending_count = 0;

			if (this.#failed_effect !== null) {
				pause_effect(this.#failed_effect, () => {
					this.#failed_effect = null;
				});
			}

			this.ran = false;

			this.#main_effect = this.#run(() => {
				this.#is_creating_fallback = false;

				try {
					return branch(() => this.#children(this.#anchor));
				} finally {
					reset_is_throwing_error();
				}
			});

			this.ran = true;

			if (this.#pending_count > 0) {
				this.#show_pending_snippet();
			}
		};

		// If we have nothing to capture the error, or if we hit an error while
		// rendering the fallback, re-throw for another boundary to handle
		if (this.#is_creating_fallback || (!onerror && !failed)) {
			throw error;
		}

		onerror?.(error, reset);

		if (this.#main_effect) {
			destroy_effect(this.#main_effect);
			this.#main_effect = null;
		}

		if (this.#pending_effect) {
			destroy_effect(this.#pending_effect);
			this.#pending_effect = null;
		}

		if (this.#failed_effect) {
			destroy_effect(this.#failed_effect);
			this.#failed_effect = null;
		}

		if (hydrating) {
			set_hydrate_node(this.#hydrate_open);
			next();
			set_hydrate_node(remove_nodes());
		}

		if (failed) {
			queue_boundary_micro_task(() => {
				this.#failed_effect = this.#run(() => {
					this.#is_creating_fallback = true;

					try {
						return branch(() => {
							failed(
								this.#anchor,
								() => error,
								() => reset
							);
						});
					} catch (error) {
						handle_error(error, this.#effect, null, this.#effect.ctx);
						return null;
					} finally {
						reset_is_throwing_error();
						this.#is_creating_fallback = false;
					}
				});
			});
		}
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

export function suspend() {
	let boundary = /** @type {Effect} */ (active_effect).b;

	while (boundary !== null) {
		// TODO pretty sure this is wrong
		if (boundary.has_pending_snippet()) {
			break;
		}

		boundary = boundary.parent;
	}

	if (boundary === null) {
		e.await_outside_boundary();
	}

	boundary.increment();

	return function unsuspend() {
		boundary.decrement();
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
