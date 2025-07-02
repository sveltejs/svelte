/** @import { Effect, TemplateNode, } from '#client' */
import { BOUNDARY_EFFECT, EFFECT_PRESERVED, EFFECT_TRANSPARENT } from '#client/constants';
import { component_context, set_component_context } from '../../context.js';
import { invoke_error_boundary } from '../../error-handling.js';
import { block, branch, destroy_effect, pause_effect } from '../../reactivity/effects.js';
import {
	active_effect,
	active_reaction,
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
import { queue_micro_task } from '../task.js';

/**
 * @typedef {{
 * 	 onerror?: (error: unknown, reset: () => void) => void;
 *   failed?: (anchor: Node, error: () => unknown, reset: () => () => void) => void;
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
	#failed_effect = null;

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

		this.#effect = block(() => {
			/** @type {Effect} */ (active_effect).b = this;

			if (hydrating) {
				hydrate_next();
			}

			try {
				this.#main_effect = branch(() => children(this.#anchor));
			} catch (error) {
				this.error(error);
			}
		}, flags);

		if (hydrating) {
			this.#anchor = hydrate_node;
		}
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

	/** @param {unknown} error */
	error(error) {
		var onerror = this.#props.onerror;
		let failed = this.#props.failed;

		const reset = () => {
			if (this.#failed_effect !== null) {
				pause_effect(this.#failed_effect, () => {
					this.#failed_effect = null;
				});
			}

			this.#main_effect = this.#run(() => {
				this.#is_creating_fallback = false;
				return branch(() => this.#children(this.#anchor));
			});
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
