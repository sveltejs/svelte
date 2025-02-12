/** @import { Effect, Source, TemplateNode, } from '#client' */

import {
	BOUNDARY_EFFECT,
	EFFECT_PRESERVED,
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

/**
 * @typedef {{
 * 	 onerror?: (error: unknown, reset: () => void) => void;
 *   failed?: (anchor: Node, error: () => unknown, reset: () => () => void) => void;
 *   pending?: (anchor: Node) => void;
 * }} BoundaryProps
 */

var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED | BOUNDARY_EFFECT;

/** @type {Fork | null} */
export var active_fork = null;

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
	effect;

	/** @type {Effect | null} */
	#main_effect = null;

	/** @type {Effect | null} */
	#pending_effect = null;

	/** @type {Effect | null} */
	#failed_effect = null;

	/** @type {DocumentFragment | null} */
	#offscreen_fragment = null;

	/** @type {Set<Fork>} */
	#forks = new Set();

	/** @type {Map<Source, any>} */
	values = new Map();

	#pending_count = 0;
	#is_creating_fallback = false;

	/**
	 * @param {TemplateNode} node
	 * @param {BoundaryProps} props
	 * @param {((anchor: Node) => void)} children
	 */
	constructor(node, props, children) {
		window.boundary = this;

		this.#anchor = node;
		this.#props = props;
		this.#children = children;

		this.#hydrate_open = hydrate_node;

		this.parent = /** @type {Effect} */ (active_effect).b;

		this.effect = block(() => {
			/** @type {Effect} */ (active_effect).b = this;

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
						return branch(() => this.#children(this.#anchor));
					});
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

		set_active_effect(this.effect);
		set_active_reaction(this.effect);
		set_component_context(this.effect.ctx);

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

	hide_pending_snippet() {
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
		if (active_fork) {
			active_fork.increment();
		} else {
			this.#pending_count++ === 0;
		}
	}

	decrement() {
		if (active_fork) {
			active_fork.decrement();
		} else if (--this.#pending_count === 0) {
			this.hide_pending_snippet();
		}
	}

	/** @param {unknown} error */
	error(error) {
		var onerror = this.#props.onerror;
		let failed = this.#props.failed;

		const reset = () => {
			this.#pending_count = 0;
			this.values.clear();

			if (this.#failed_effect !== null) {
				pause_effect(this.#failed_effect, () => {
					this.#failed_effect = null;
				});
			}

			this.#main_effect = this.#run(() => {
				this.#is_creating_fallback = false;

				try {
					return branch(() => this.#children(this.#anchor));
				} finally {
					reset_is_throwing_error();
				}
			});

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
						handle_error(error, this.effect, null, this.effect.ctx);
						return null;
					} finally {
						reset_is_throwing_error();
						this.#is_creating_fallback = false;
					}
				});
			});
		}
	}

	/**
	 * @param {Set<Source>} changeset
	 * @param {(fork: Fork) => void} fn
	 */
	fork(changeset, fn) {
		if (!active_fork || !this.#forks.has(active_fork)) {
			active_fork = new Fork(this, changeset);
			this.#forks.add(active_fork);
		}

		fn(active_fork);

		if (!active_fork.suspended) {
			active_fork.commit();
		}

		active_fork = null;
	}

	/**
	 * @param {Source} source
	 */
	get(source) {
		if (!this.values.has(source)) {
			this.values.set(source, source.v);
		}

		return this.values.get(source);
	}

	/**
	 * @param {Fork} fork
	 */
	commit_fork(fork) {
		for (const source of fork.changeset) {
			this.values.set(source, source.v);
		}

		this.delete_fork(fork);
	}

	/**
	 * @param {Fork} fork
	 */
	delete_fork(fork) {
		this.#forks.delete(fork);

		if (this.#forks.size === 0) {
			// TODO we need to clear this at some point otherwise
			// it's a huge memory leak that will make dominic mad
		}
	}
}

export class Fork {
	suspended = false;

	/** @type {Boundary} */
	#boundary;

	/** @type {Set<Source>} */
	changeset; // TODO make private

	/** @type {Set<() => void>} */
	#callbacks = new Set();

	/** @type {Effect[]} */
	#render_effects = [];

	/** @type {Effect[]} */
	#effects = [];

	#pending_count = 0;

	/**
	 *
	 * @param {Boundary} boundary
	 * @param {Set<Source>} changeset
	 */
	constructor(boundary, changeset) {
		this.#boundary = boundary;
		this.changeset = new Set(changeset);
	}

	/**
	 *
	 * @param {Source} source
	 */
	get(source) {
		if (this.changeset.has(source)) {
			return source.v;
		}

		return this.#boundary.get(source);
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
		if (this.#pending_count > 0) {
			return;
		}

		this.suspended = false;

		for (const e of this.#render_effects) {
			try {
				// if (check_dirtiness(e)) {
				update_effect(e);
				// }
			} catch (error) {
				handle_error(error, e, null, e.ctx);
			}
		}

		for (const fn of this.#callbacks) fn();
		this.#callbacks.clear();

		this.#boundary.hide_pending_snippet();

		for (const e of this.#effects) {
			try {
				// if (check_dirtiness(e)) {
				update_effect(e);
				// }
			} catch (error) {
				handle_error(error, e, null, e.ctx);
			}
		}

		this.#boundary.commit_fork(this);
	}

	increment() {
		if (this.#pending_count++ === 0) {
			this.suspended = true;
		}
	}

	decrement() {
		if (--this.#pending_count === 0) {
			this.suspended = false;
		}
	}

	discard() {
		this.#boundary.delete_fork(this);
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
	var previous_fork = active_fork;
	var previous_effect = active_effect;
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;

	if (DEV && !track) {
		var was_from_async_derived = from_async_derived;
	}

	return function restore() {
		if (track) {
			active_fork = previous_fork;
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

	let fork = active_fork;

	if (fork) {
		fork.increment();
	} else {
		boundary.increment();
	}

	return {
		discard() {
			if (fork) {
				fork.discard();
			} else {
				// TODO ???
			}
		},

		unsuspend() {
			if (fork) {
				fork.decrement();
			} else {
				boundary.decrement();
			}
		}
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
