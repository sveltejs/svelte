/** @import { Effect, Source, TemplateNode, } from '#client' */
import {
	BOUNDARY_EFFECT,
	COMMENT_NODE,
	EFFECT_PRESERVED,
	EFFECT_TRANSPARENT
} from '#client/constants';
import { HYDRATION_START_ELSE } from '../../../../constants.js';
import { component_context, set_component_context } from '../../context.js';
import { handle_error, invoke_error_boundary } from '../../error-handling.js';
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
	skip_nodes,
	set_hydrate_node
} from '../hydration.js';
import { get_next_sibling } from '../operations.js';
import { queue_micro_task } from '../task.js';
import * as e from '../../errors.js';
import * as w from '../../warnings.js';
import { DEV } from 'esm-env';
import { Batch, effect_pending_updates } from '../../reactivity/batch.js';
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
	/** @type {Boundary | null} */
	parent;

	#pending = false;

	/** @type {TemplateNode} */
	#anchor;

	/** @type {TemplateNode | null} */
	#hydrate_open = hydrating ? hydrate_node : null;

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

	#local_pending_count = 0;
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

	#effect_pending_update = () => {
		if (this.#effect_pending) {
			internal_set(this.#effect_pending, this.#local_pending_count);
		}
	};

	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#local_pending_count);

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

		this.parent = /** @type {Effect} */ (active_effect).b;

		this.#pending = !!this.#props.pending;

		this.#effect = block(() => {
			/** @type {Effect} */ (active_effect).b = this;

			if (hydrating) {
				const comment = this.#hydrate_open;
				hydrate_next();

				const server_rendered_pending =
					/** @type {Comment} */ (comment).nodeType === COMMENT_NODE &&
					/** @type {Comment} */ (comment).data === HYDRATION_START_ELSE;

				if (server_rendered_pending) {
					this.#hydrate_pending_content();
				} else {
					this.#hydrate_resolved_content();
				}
			} else {
				try {
					this.#main_effect = branch(() => children(this.#anchor));
				} catch (error) {
					this.error(error);
				}

				if (this.#pending_count > 0) {
					this.#show_pending_snippet();
				} else {
					this.#pending = false;
				}
			}
		}, flags);

		if (hydrating) {
			this.#anchor = hydrate_node;
		}
	}

	#hydrate_resolved_content() {
		try {
			this.#main_effect = branch(() => this.#children(this.#anchor));
		} catch (error) {
			this.error(error);
		}

		// Since server rendered resolved content, we never show pending state
		// Even if client-side async operations are still running, the content is already displayed
		this.#pending = false;
	}

	#hydrate_pending_content() {
		const pending = this.#props.pending;
		if (!pending) {
			return;
		}
		this.#pending_effect = branch(() => pending(this.#anchor));

		Batch.enqueue(() => {
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

				this.#pending = false;
			}
		});
	}

	/**
	 * Returns `true` if the effect exists inside a boundary whose pending snippet is shown
	 * @returns {boolean}
	 */
	is_pending() {
		return this.#pending || (!!this.parent && this.parent.is_pending());
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
		} catch (e) {
			handle_error(e);
			return null;
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

	/**
	 * Updates the pending count associated with the currently visible pending snippet,
	 * if any, such that we can replace the snippet with content once work is done
	 * @param {1 | -1} d
	 */
	#update_pending_count(d) {
		if (!this.has_pending_snippet()) {
			if (this.parent) {
				this.parent.#update_pending_count(d);
			}

			// if there's no parent, we're in a scope with no pending snippet
			return;
		}

		this.#pending_count += d;

		if (this.#pending_count === 0) {
			this.#pending = false;

			if (this.#pending_effect) {
				pause_effect(this.#pending_effect, () => {
					this.#pending_effect = null;
				});
			}

			if (this.#offscreen_fragment) {
				this.#anchor.before(this.#offscreen_fragment);
				this.#offscreen_fragment = null;
			}

			// TODO this feels like a little bit of a kludge, but until we
			// overhaul the boundary/batch relationship it's probably
			// the most pragmatic solution available to us
			queue_micro_task(() => {
				Batch.ensure().flush();
			});
		}
	}

	/**
	 * Update the source that powers `$effect.pending()` inside this boundary,
	 * and controls when the current `pending` snippet (if any) is removed.
	 * Do not call from inside the class
	 * @param {1 | -1} d
	 */
	update_pending_count(d) {
		this.#update_pending_count(d);

		this.#local_pending_count += d;
		effect_pending_updates.add(this.#effect_pending_update);
	}

	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get(/** @type {Source<number>} */ (this.#effect_pending));
	}

	/** @param {unknown} error */
	error(error) {
		var onerror = this.#props.onerror;
		let failed = this.#props.failed;

		// If we have nothing to capture the error, or if we hit an error while
		// rendering the fallback, re-throw for another boundary to handle
		if (this.#is_creating_fallback || (!onerror && !failed)) {
			throw error;
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
			set_hydrate_node(/** @type {TemplateNode} */ (this.#hydrate_open));
			next();
			set_hydrate_node(skip_nodes());
		}

		var did_reset = false;
		var calling_on_error = false;

		const reset = () => {
			if (did_reset) {
				w.svelte_boundary_reset_noop();
				return;
			}

			did_reset = true;

			if (calling_on_error) {
				e.svelte_boundary_reset_onerror();
			}

			// If the failure happened while flushing effects, current_batch can be null
			Batch.ensure();

			this.#local_pending_count = 0;

			if (this.#failed_effect !== null) {
				pause_effect(this.#failed_effect, () => {
					this.#failed_effect = null;
				});
			}

			// we intentionally do not try to find the nearest pending boundary. If this boundary has one, we'll render it on reset
			// but it would be really weird to show the parent's boundary on a child reset.
			this.#pending = this.has_pending_snippet();

			this.#main_effect = this.#run(() => {
				this.#is_creating_fallback = false;
				return branch(() => this.#children(this.#anchor));
			});

			if (this.#pending_count > 0) {
				this.#show_pending_snippet();
			} else {
				this.#pending = false;
			}
		};

		var previous_reaction = active_reaction;

		try {
			set_active_reaction(null);
			calling_on_error = true;
			onerror?.(error, reset);
			calling_on_error = false;
		} catch (error) {
			invoke_error_boundary(error, this.#effect && this.#effect.parent);
		} finally {
			set_active_reaction(previous_reaction);
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

export function get_boundary() {
	return /** @type {Boundary} */ (/** @type {Effect} */ (active_effect).b);
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
