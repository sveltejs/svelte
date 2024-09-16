/** @import { Derived, Effect, TemplateNode } from '#client' */
import { EFFECT_TRANSPARENT } from '../../constants.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	remove_nodes,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { block, branch, pause_effect, resume_effect } from '../../reactivity/effects.js';
import { HYDRATION_START_ELSE } from '../../../../constants.js';
import { derived } from '../../reactivity/deriveds.js';
import { get } from '../../runtime.js';



/**
 * @param {TemplateNode} node
 * @param {(() => boolean)[]} test_fns
 * @param {((anchor: Node) => void)[]} consequent_fns
 * @param {((anchor: Node) => void) | null} alternate_fn
 * @returns {void}
 */
export function pick(node, test_fns, consequent_fns, alternate_fn = null) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	const max = consequent_fns.length;

	/** @type {{d:Derived<boolean>, e:Effect|null}[]} */
	var effects = test_fns.map( fn => ({ d: derived(fn), e: null }) );

	if (alternate_fn) {
		
		// @ts-ignore
		effects[-1] = { e: null }
	}

	/** @type {number | null} */
	var current_index = null;

	block(() => {
		const previous_index = current_index;
		if (current_index === (current_index = (effects.findIndex(e => get(e.d))))) return;

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;
		
		if (hydrating) {
			const data = current_index < 0 ? '[!' : (current_index === 0 ? '[' : ('[' + current_index) );
			if (data !== /** @type {Comment} */ (anchor).data) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#if browser}...{/if}`, for example
				anchor = remove_nodes();

				set_hydrate_node(anchor);
				set_hydrating(false);
				mismatch = true;
			}
		}

		let current_effect = effects[current_index]?.e;
		if (current_effect) {
			resume_effect(current_effect);
		} else {
			const fn = current_index < 0 ? alternate_fn : consequent_fns[current_index];
			if (fn) {
				let target_anchor = anchor;
				if (previous_index != null && current_index !== -1) {
					const alternate_effect = effects[-1]?.e;
					if (alternate_effect && alternate_effect.nodes_start) {
						target_anchor = alternate_effect.nodes_start;
					}
					for (let i=current_index+1; i<max; i++) {
						const effect = effects[i];
						if (effect.e && effect.e.nodes_start) {
							target_anchor = effect.e.nodes_start;
							break;
						}
					}
				}		
				current_effect = branch(() => fn(target_anchor));
				effects[current_index].e = current_effect;
			}
		}

		if (previous_index!=null) {
			const previous_effect = effects[previous_index]?.e;
			if (previous_effect) {
				pause_effect(previous_effect, () => {
					effects[previous_index].e = null;
				});
			}
		}
		if (mismatch) {
			// continue in hydration mode
			set_hydrating(true);
		}
	});

	if (hydrating) {
		anchor = hydrate_node;
	}
}


/**
 * @param {TemplateNode} node
 * @param {() => boolean} get_condition
 * @param {(anchor: Node) => void} consequent_fn
 * @param {null | ((anchor: Node) => void)} [alternate_fn]
 * @param {boolean} [elseif] True if this is an `{:else if ...}` block rather than an `{#if ...}`, as that affects which transitions are considered 'local'
 * @returns {void}
 */
export function if_block(node, get_condition, consequent_fn, alternate_fn = null, elseif = false) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {Effect | null} */
	var consequent_effect = null;

	/** @type {Effect | null} */
	var alternate_effect = null;

	/** @type {boolean | null} */
	var condition = null;

	var flags = elseif ? EFFECT_TRANSPARENT : 0;

	block(() => {
		if (condition === (condition = !!get_condition())) return;

		/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
		let mismatch = false;

		if (hydrating) {
			const is_else = /** @type {Comment} */ (anchor).data === HYDRATION_START_ELSE;

			if (condition === is_else) {
				// Hydration mismatch: remove everything inside the anchor and start fresh.
				// This could happen with `{#if browser}...{/if}`, for example
				anchor = remove_nodes();

				set_hydrate_node(anchor);
				set_hydrating(false);
				mismatch = true;
			}
		}

		if (condition) {
			if (consequent_effect) {
				resume_effect(consequent_effect);
			} else {
				consequent_effect = branch(() => consequent_fn(anchor));
			}

			if (alternate_effect) {
				pause_effect(alternate_effect, () => {
					alternate_effect = null;
				});
			}
		} else {
			if (alternate_effect) {
				resume_effect(alternate_effect);
			} else if (alternate_fn) {
				alternate_effect = branch(() => alternate_fn(anchor));
			}

			if (consequent_effect) {
				pause_effect(consequent_effect, () => {
					consequent_effect = null;
				});
			}
		}

		if (mismatch) {
			// continue in hydration mode
			set_hydrating(true);
		}
	}, flags);

	if (hydrating) {
		anchor = hydrate_node;
	}
}
