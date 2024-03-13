import { IF_BLOCK } from '../../constants.js';
import {
	current_hydration_fragment,
	hydrate_block_anchor,
	hydrating,
	set_current_hydration_fragment
} from '../hydration.js';
import { remove } from '../reconciler.js';
import { current_block, execute_effect } from '../../runtime.js';
import { destroy_effect, render_effect } from '../../reactivity/effects.js';
import { trigger_transitions } from '../elements/transitions.js';

/** @returns {import('#client').IfBlock} */
function create_if_block() {
	return {
		// alternate transitions
		a: null,
		// alternate effect
		ae: null,
		// consequent transitions
		c: null,
		// consequent effect
		ce: null,
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('#client').Block} */ (current_block),
		// transition
		r: null,
		// type
		t: IF_BLOCK,
		// value
		v: false
	};
}

/**
 * @param {Comment} anchor_node
 * @param {() => boolean} condition_fn
 * @param {(anchor: Node) => void} consequent_fn
 * @param {null | ((anchor: Node) => void)} alternate_fn
 * @returns {void}
 */
export function if_block(anchor_node, condition_fn, consequent_fn, alternate_fn) {
	const block = create_if_block();

	hydrate_block_anchor(anchor_node);

	/** Whether or not there was a hydration mismatch. Needs to be a `let` or else it isn't treeshaken out */
	let mismatch = false;

	/** @type {null | import('#client').TemplateNode | Array<import('#client').TemplateNode>} */
	let consequent_dom = null;

	/** @type {null | import('#client').TemplateNode | Array<import('#client').TemplateNode>} */
	let alternate_dom = null;

	let has_mounted = false;

	/**
	 * @type {import('#client').Effect | null}
	 */
	let current_branch_effect = null;

	/** @type {import('#client').Effect} */
	let consequent_effect;

	/** @type {import('#client').Effect} */
	let alternate_effect;

	const if_effect = render_effect(() => {
		const result = !!condition_fn();

		if (block.v !== result || !has_mounted) {
			block.v = result;

			if (has_mounted) {
				const consequent_transitions = block.c;
				const alternate_transitions = block.a;

				if (result) {
					if (alternate_transitions === null || alternate_transitions.size === 0) {
						execute_effect(alternate_effect);
					} else {
						trigger_transitions(alternate_transitions, 'out');
					}

					if (consequent_transitions === null || consequent_transitions.size === 0) {
						execute_effect(consequent_effect);
					} else {
						trigger_transitions(consequent_transitions, 'in');
					}
				} else {
					if (consequent_transitions === null || consequent_transitions.size === 0) {
						execute_effect(consequent_effect);
					} else {
						trigger_transitions(consequent_transitions, 'out');
					}

					if (alternate_transitions === null || alternate_transitions.size === 0) {
						execute_effect(alternate_effect);
					} else {
						trigger_transitions(alternate_transitions, 'in');
					}
				}
			} else if (hydrating) {
				const comment_text = /** @type {Comment} */ (current_hydration_fragment?.[0])?.data;

				if (
					!comment_text ||
					(comment_text === 'ssr:if:true' && !result) ||
					(comment_text === 'ssr:if:false' && result)
				) {
					// Hydration mismatch: remove everything inside the anchor and start fresh.
					// This could happen using when `{#if browser} .. {/if}` in SvelteKit.
					remove(current_hydration_fragment);
					set_current_hydration_fragment(null);
					mismatch = true;
				} else {
					// Remove the ssr:if comment node or else it will confuse the subsequent hydration algorithm
					current_hydration_fragment.shift();
				}
			}

			has_mounted = true;
		}

		// create these here so they have the correct parent/child relationship
		consequent_effect ??= render_effect(
			(/** @type {any} */ _, /** @type {import('#client').Effect | null} */ consequent_effect) => {
				const result = block.v;

				if (!result && consequent_dom !== null) {
					remove(consequent_dom);
					consequent_dom = null;
				}

				if (result && current_branch_effect !== consequent_effect) {
					consequent_fn(anchor_node);
					if (mismatch && current_branch_effect === null) {
						// Set fragment so that Svelte continues to operate in hydration mode
						set_current_hydration_fragment([]);
					}
					current_branch_effect = consequent_effect;
					consequent_dom = block.d;
				}

				block.d = null;
			},
			block,
			true
		);
		block.ce = consequent_effect;

		alternate_effect ??= render_effect(
			(/** @type {any} */ _, /** @type {import('#client').Effect | null} */ alternate_effect) => {
				const result = block.v;

				if (result && alternate_dom !== null) {
					remove(alternate_dom);
					alternate_dom = null;
				}

				if (!result && current_branch_effect !== alternate_effect) {
					if (alternate_fn !== null) {
						alternate_fn(anchor_node);
					}

					if (mismatch && current_branch_effect === null) {
						// Set fragment so that Svelte continues to operate in hydration mode
						set_current_hydration_fragment([]);
					}

					current_branch_effect = alternate_effect;
					alternate_dom = block.d;
				}
				block.d = null;
			},
			block,
			true
		);
		block.ae = alternate_effect;
	}, block);

	if_effect.ondestroy = () => {
		if (consequent_dom !== null) {
			remove(consequent_dom);
		}

		if (alternate_dom !== null) {
			remove(alternate_dom);
		}

		destroy_effect(consequent_effect);
		destroy_effect(alternate_effect);
	};

	block.e = if_effect;
}
