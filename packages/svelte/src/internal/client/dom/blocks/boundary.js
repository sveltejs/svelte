/** @import { Effect, TemplateNode, } from '#client' */

import {
	BOUNDARY_EFFECT,
	EFFECT_PRESERVED,
	EFFECT_RAN,
	EFFECT_TRANSPARENT,
	RENDER_EFFECT
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
	check_dirtiness,
	update_effect
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

/** @type {Boundary | null} */
export let active_boundary = null;

/** @param {Boundary | null} boundary */
export function set_active_boundary(boundary) {
	active_boundary = boundary;
}

/**
 * @typedef {{
 * 	 onerror?: (error: unknown, reset: () => void) => void;
 *   failed?: (anchor: Node, error: () => unknown, reset: () => () => void) => void;
 *   pending?: (anchor: Node) => void;
 *   showPendingAfter?: number;
 *   showPendingFor?: number;
 * }} BoundaryProps
 */

export class Boundary {
	suspended = false;

	/** @type {Boundary | null} */
	parent;

	/** @type {TemplateNode} */
	#anchor;

	/** @type {BoundaryProps} */
	#props;

	/** @type {Effect} */
	#effect;

	/** @type {Set<() => void>} */
	#callbacks = new Set();

	/** @type {Effect[]} */
	#render_effects = [];

	/** @type {Effect[]} */
	#effects = [];

	/** @type {Effect | null} */
	#main_effect = null;

	/** @type {Effect | null} */
	#pending_effect = null;

	/** @type {Effect | null} */
	#failed_effect = null;

	/** @type {DocumentFragment | null} */
	#offscreen_fragment = null;

	#pending_count = 0;
	#keep_pending_snippet = false; // TODO get rid of this
	#is_creating_fallback = false;

	/**
	 * @param {TemplateNode} node
	 * @param {BoundaryProps} props
	 * @param {((anchor: Node) => void)} children
	 */
	constructor(node, props, children) {
		this.#anchor = node;
		this.#props = props;
		this.parent = active_boundary;

		active_boundary = this;

		this.#effect = block(() => {
			var boundary_effect = /** @type {Effect} */ (active_effect);
			boundary_effect.b = this;

			var hydrate_open = hydrate_node;

			const reset = () => {
				this.#pending_count = 0;
				this.suspended = false;

				if (this.#failed_effect !== null) {
					pause_effect(this.#failed_effect, () => {
						this.#failed_effect = null;
					});
				}

				this.#main_effect = this.#run(() => {
					this.#is_creating_fallback = false;

					try {
						return branch(() => children(this.#anchor));
					} finally {
						reset_is_throwing_error();
					}
				});

				if (this.#pending_count > 0) {
					this.suspended = true;
					this.#show_pending_snippet(true);
				}
			};

			// @ts-ignore We re-use the effect's fn property to avoid allocation of an additional field
			boundary_effect.fn = (/** @type {unknown} */ input, /** @type {any} */ payload) => {
				var error = input;
				var onerror = this.#props.onerror;
				let failed = this.#props.failed;

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
					set_hydrate_node(hydrate_open);
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
								handle_error(error, boundary_effect, null, boundary_effect.ctx);
								return null;
							} finally {
								reset_is_throwing_error();
								this.#is_creating_fallback = false;
							}
						});
					});
				}
			};

			// @ts-ignore
			boundary_effect.fn.is_pending = () => this.#props.pending;

			if (hydrating) {
				hydrate_next();
			}

			const pending = this.#props.pending;

			if (hydrating && pending) {
				this.#pending_effect = branch(() => pending(this.#anchor));

				// ...now what? we need to start rendering `boundary_fn` offscreen,
				// and either insert the resulting fragment (if nothing suspends)
				// or keep the pending effect alive until it unsuspends.
				// not exactly sure how to do that.

				// future work: when we have some form of async SSR, we will
				// need to use hydration boundary comments to report whether
				// the pending or main block was rendered for a given
				// boundary, and hydrate accordingly
				queueMicrotask(() => {
					destroy_effect(/** @type {Effect} */ (this.#pending_effect));

					this.#main_effect = this.#run(() => {
						return branch(() => children(this.#anchor));
					});
				});
			} else {
				this.#main_effect = branch(() => children(this.#anchor));

				if (this.#pending_count > 0) {
					this.suspended = true;
					this.#show_pending_snippet(true);
				}
			}

			reset_is_throwing_error();
		}, flags);

		this.ran = true;

		// @ts-expect-error
		this.#effect.fn.boundary = this;

		if (hydrating) {
			this.#anchor = hydrate_node;
		}

		active_boundary = this.parent;
	}

	has_pending_snippet() {
		return !!this.#props.pending;
	}

	/**
	 * @param {() => Effect | null} fn
	 */
	#run(fn) {
		var previous_boundary = active_boundary;
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;

		active_boundary = this;
		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);

		try {
			return fn();
		} finally {
			active_boundary = previous_boundary;
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}

	/**
	 * @param {boolean} initial
	 */
	#show_pending_snippet(initial) {
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

			// TODO do we want to differentiate between initial render and updates here?
			if (!initial) {
				this.#keep_pending_snippet = true;

				var end = raf.now() + (this.#props.showPendingFor ?? 300);

				loop((now) => {
					if (now >= end) {
						this.#keep_pending_snippet = false;
						this.commit();
						return false;
					}

					return true;
				});
			}
		} else if (this.parent) {
			throw new Error('TODO show pending snippet on parent');
		} else {
			throw new Error('no pending snippet to show');
		}
	}

	/** @param {() => void} fn */
	add_callback(fn) {
		this.#callbacks.add(fn);
	}

	/** @param {Effect} effect */
	add_effect(effect) {
		((effect.f & RENDER_EFFECT) !== 0 ? this.#render_effects : this.#effects).push(effect);
	}

	commit() {
		if (this.#keep_pending_snippet || this.#pending_count > 0) {
			return;
		}

		this.suspended = false;

		for (const e of this.#render_effects) {
			try {
				if (check_dirtiness(e)) {
					update_effect(e);
				}
			} catch (error) {
				handle_error(error, e, null, e.ctx);
			}
		}

		for (const fn of this.#callbacks) fn();
		this.#callbacks.clear();

		if (this.#pending_effect) {
			pause_effect(this.#pending_effect, () => {
				this.#pending_effect = null;
			});
		}

		if (this.#offscreen_fragment) {
			this.#anchor.before(this.#offscreen_fragment);
			this.#offscreen_fragment = null;
		}

		for (const e of this.#effects) {
			try {
				if (check_dirtiness(e)) {
					update_effect(e);
				}
			} catch (error) {
				handle_error(error, e, null, e.ctx);
			}
		}
	}

	increment() {
		// post-init, show the pending snippet after a timeout
		if (!this.suspended && this.ran) {
			var start = raf.now();
			var end = start + (this.#props.showPendingAfter ?? 500);

			loop((now) => {
				if (this.#pending_count === 0) return false;
				if (now < end) return true;

				this.#show_pending_snippet(false);
			});
		}

		this.suspended = true;
		this.#pending_count++;
	}

	decrement() {
		if (--this.#pending_count === 0 && !this.#keep_pending_snippet) {
			this.commit();

			if (this.#main_effect !== null) {
				// TODO do we also need to `resume_effect` here?
				schedule_effect(this.#main_effect);
			}
		}
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
	new Boundary(node, props, children);
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
