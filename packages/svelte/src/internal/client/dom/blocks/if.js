import { IF_BLOCK } from '../../constants.js';
import {
	current_hydration_fragment,
	hydrate_block_anchor,
	hydrating,
	set_current_hydration_fragment
} from '../hydration.js';
import { remove } from '../reconciler.js';
import { current_block } from '../../runtime.js';
import {
	destroy_effect,
	pause_effect,
	render_effect,
	resume_effect
} from '../../reactivity/effects.js';

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

	/** @type {import('#client').Effect | null} */
	let consequent_effect;

	/** @type {import('#client').Effect | null} */
	let alternate_effect;

	function create_consequent_effect() {
		return render_effect(
			() => {
				consequent_fn(anchor_node);
				if (mismatch && current_branch_effect === null) {
					set_current_hydration_fragment([]);
				}

				consequent_dom = block.d;

				return () => {
					// TODO make this unnecessary by linking the dom to the effect,
					// and removing automatically on teardown
					if (consequent_dom !== null) {
						remove(consequent_dom);
						consequent_dom = null;
					}
				};
			},
			block,
			true
		);
	}

	function create_alternate_effect() {
		return render_effect(
			() => {
				/** @type {((anchor: Node) => void)} */ (alternate_fn)(anchor_node);
				if (mismatch && current_branch_effect === null) {
					set_current_hydration_fragment([]);
				}

				alternate_dom = block.d;

				return () => {
					// TODO make this unnecessary by linking the dom to the effect,
					// and removing automatically on teardown
					if (alternate_dom !== null) {
						remove(alternate_dom);
						alternate_dom = null;
					}
				};
			},
			block,
			true
		);
	}

	const if_effect = render_effect(() => {
		const result = !!condition_fn();

		if (block.v !== result || !has_mounted) {
			block.v = result;

			if (has_mounted) {
				if (result) {
					if (consequent_effect) {
						resume_effect(consequent_effect);
					} else {
						consequent_effect = create_consequent_effect();
					}

					if (alternate_effect) {
						pause_effect(alternate_effect, () => {
							alternate_effect = null;
							if (alternate_dom) remove(alternate_dom);
						});
					}
				} else {
					if (alternate_effect) {
						resume_effect(alternate_effect);
					} else if (alternate_fn) {
						alternate_effect = create_alternate_effect();
					}

					if (consequent_effect) {
						pause_effect(consequent_effect, () => {
							consequent_effect = null;
							if (consequent_dom) remove(consequent_dom);
						});
					}
				}
			} else {
				if (hydrating) {
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

				if (result) {
					consequent_effect ??= create_consequent_effect();
				} else if (alternate_fn) {
					alternate_effect ??= create_alternate_effect();
				}
			}

			has_mounted = true;
		}
	}, block);

	if_effect.ondestroy = () => {
		// TODO make this unnecessary by linking the dom to the effect,
		// and removing automatically on teardown
		if (consequent_dom !== null) {
			remove(consequent_dom);
		}

		if (alternate_dom !== null) {
			remove(alternate_dom);
		}

		if (consequent_effect) {
			destroy_effect(consequent_effect);
		}
		if (alternate_effect) {
			destroy_effect(alternate_effect);
		}
	};

	block.e = if_effect;
}
