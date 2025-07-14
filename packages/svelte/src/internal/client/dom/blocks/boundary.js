/** @import { Effect, Source, TemplateNode, } from '#client' */
import { BOUNDARY_EFFECT, EFFECT_PRESERVED, EFFECT_TRANSPARENT } from '#client/constants';
import { component_context, set_component_context } from '../../context.js';
import { invoke_error_boundary } from '../../error-handling.js';
import { block, branch, destroy_effect, pause_effect } from '../../reactivity/effects.js';
import {
	active_effect,
	active_reaction,
	get,
	set_active_effect,
	set_active_reaction
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
import * as e from '../../errors.js';
import { DEV } from 'esm-env';
import { Batch } from '../../reactivity/batch.js';
import { internal_set, source } from '../../reactivity/sources.js';
import { tag } from '../../dev/tracing.js';
import { createSubscriber } from '../../../../reactivity/create-subscriber.js';

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
	pending = false;

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
	 * A source containing the number of pending async deriveds/expressions.
	 * Only created if `$effect.pending()` is used inside the boundary,
	 * otherwise updating the source results in needless `Batch.ensure()`
	 * calls followed by no-op flushes
	 * @type {Source<number> | null}
	 */
	#effect_pending = null;

	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#pending_count);

		if (DEV) {
			tag(this.#effect_pending, '$effect.pending()');
		}

		return () => {
			this.#effect_pending = null;
		};
	});

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

		this.pending = !!this.#props.pending;

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
						Batch.ensure();
						return branch(() => this.#children(this.#anchor));
					});

					if (this.#pending_count > 0) {
						this.#show_pending_snippet();
					} else {
						pause_effect(/** @type {Effect} */ (this.#pending_effect), () => {
							this.#pending_effect = null;
						});

						this.pending = false;
					}
				});
			} else {
				try {
					this.#main_effect = branch(() => children(this.#anchor));
				} catch (error) {
					this.error(error);
				}

				if (this.#pending_count > 0) {
					this.#show_pending_snippet();
				} else {
					this.pending = false;
				}
			}
		}, flags);

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
		const pending = /** @type {(anchor: Node) => void} */ (this.#props.pending);

		if (this.#main_effect !== null) {
			this.#offscreen_fragment = document.createDocumentFragment();
			move_effect(this.#main_effect, this.#offscreen_fragment);
		}

		if (this.#pending_effect === null) {
			this.#pending_effect = branch(() => pending(this.#anchor));
		}
	}

	/** @param {1 | -1} d */
	#update_pending_count(d) {
		this.#pending_count += d;

		if (this.#pending_count === 0) {
			this.pending = false;

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
	}

	/** @param {1 | -1} d */
	update_pending_count(d) {
		if (this.has_pending_snippet()) {
			this.#update_pending_count(d);
		} else if (this.parent) {
			this.parent.#update_pending_count(d);
		}

		queueMicrotask(() => {
			if (this.#effect_pending) {
				internal_set(this.#effect_pending, this.#pending_count);
			}
		});
	}

	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get(/** @type {Source<number>} */ (this.#effect_pending));
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

			this.pending = true;

			this.#main_effect = this.#run(() => {
				this.#is_creating_fallback = false;
				return branch(() => this.#children(this.#anchor));
			});

			if (this.#pending_count > 0) {
				this.#show_pending_snippet();
			} else {
				this.pending = false;
			}
		};

		// If we have nothing to capture the error, or if we hit an error while
		// rendering the fallback, re-throw for another boundary to handle
		if (this.#is_creating_fallback || (!onerror && !failed)) {
			throw error;
		}

		var previous_reaction = active_reaction;

		try {
			set_active_reaction(null);
			onerror?.(error, reset);
		} finally {
			set_active_reaction(previous_reaction);
		}

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
			queue_micro_task(() => {
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
						invoke_error_boundary(error, /** @type {Effect} */ (this.#effect.parent));
						return null;
					} finally {
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

export function get_pending_boundary() {
	var boundary = /** @type {Effect} */ (active_effect).b;

	while (boundary !== null && !boundary.has_pending_snippet()) {
		boundary = boundary.parent;
	}

	if (boundary === null) {
		e.await_outside_boundary();
	}

	return boundary;
}

export function pending() {
	if (active_effect === null) {
		e.effect_pending_outside_reaction();
	}

	var boundary = active_effect.b;

	if (boundary === null) {
		return 0; // TODO eventually we will need this to be global
	}

	return boundary.get_effect_pending();
}
