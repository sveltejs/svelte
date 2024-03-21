import { namespace_svg } from '../../../../constants.js';
import { current_hydration_fragment, hydrate_block_anchor, hydrating } from '../hydration.js';
import { empty } from '../operations.js';
import {
	destroy_effect,
	pause_effect,
	render_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';
import { current_block } from '../../runtime.js';
import { is_array } from '../../utils.js';
import { set_run_transitions } from '../../render.js';
import { current_each_item_block, set_current_each_item_block } from './each.js';

/**
 * @param {import('#client').Block} block
 * @param {Element} from
 * @param {Element} to
 * @returns {void}
 */
function swap_block_dom(block, from, to) {
	const dom = block.d;
	if (is_array(dom)) {
		for (let i = 0; i < dom.length; i++) {
			if (dom[i] === from) {
				dom[i] = to;
				break;
			}
		}
	} else if (dom === from) {
		block.d = to;
	}
}

/**
 * @param {Comment} anchor_node
 * @param {() => string} tag_fn
 * @param {boolean | null} is_svg `null` == not statically known
 * @param {undefined | ((element: Element, anchor: Node) => void)} render_fn
 * @returns {void}
 */
export function element(anchor_node, tag_fn, is_svg, render_fn) {
	/** @type {import('#client').DynamicElementBlock} */
	const block = {
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('#client').Block} */ (current_block)
	};

	hydrate_block_anchor(anchor_node);

	/** @type {string | null} */
	let tag;

	/** @type {string | null} */
	let current_tag;

	/** @type {null | Element} */
	let element = null;

	/** @type {import('#client').Effect | null} */
	let effect;

	let each_item_block = current_each_item_block;

	const wrapper = render_effect(() => {
		const next_tag = tag_fn() || null;
		if (next_tag === tag) return;

		var previous_each_item_block = current_each_item_block;
		set_current_each_item_block(each_item_block);

		// We try our best infering the namespace in case it's not possible to determine statically,
		// but on the first render on the client (without hydration) the parent will be undefined,
		// since the anchor is not attached to its parent / the dom yet.
		const ns =
			is_svg || next_tag === 'svg'
				? namespace_svg
				: is_svg === false || anchor_node.parentElement?.tagName === 'foreignObject'
					? null
					: anchor_node.parentElement?.namespaceURI ?? null;

		if (effect) {
			if (next_tag === null) {
				// start outro
				pause_effect(effect, () => {
					effect = null;
					current_tag = null;
					element?.remove(); // TODO this should be unnecessary
				});
			} else if (next_tag === current_tag) {
				// same tag as is currently rendered — abort outro
				resume_effect(effect);
			} else {
				// tag is changing — destroy immediately, render contents without intro transitions
				destroy_effect(effect);
				set_run_transitions(false);
			}
		}

		if (next_tag && next_tag !== current_tag) {
			effect = render_effect(
				() => {
					const prev_element = element;
					element = hydrating
						? /** @type {Element} */ (current_hydration_fragment[0])
						: ns
							? document.createElementNS(ns, next_tag)
							: document.createElement(next_tag);

					if (render_fn) {
						let anchor;
						if (hydrating) {
							// Use the existing ssr comment as the anchor so that the inner open and close
							// methods can pick up the existing nodes correctly
							anchor = /** @type {Comment} */ (element.firstChild);
						} else {
							anchor = empty();
							element.appendChild(anchor);
						}
						render_fn(element, anchor);
					}

					anchor_node.before(element);

					if (prev_element) {
						swap_block_dom(block.p, prev_element, element);
						prev_element.remove();
					}
				},
				block,
				true
			);
		}

		tag = next_tag;
		if (tag) current_tag = tag;
		set_run_transitions(true);

		set_current_each_item_block(previous_each_item_block);
	}, block);

	wrapper.ondestroy = () => {
		if (element !== null) {
			remove(element);
			block.d = null;
			element = null;
		}

		if (effect) {
			destroy_effect(effect);
		}
	};

	block.e = wrapper;
}
