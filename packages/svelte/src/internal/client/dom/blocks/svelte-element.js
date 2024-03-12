import { namespace_svg } from '../../../../constants.js';
import { DYNAMIC_ELEMENT_BLOCK } from '../../constants.js';
import { current_hydration_fragment, hydrate_block_anchor, hydrating } from '../hydration.js';
import { empty } from '../operations.js';
import { destroy_effect, render_effect } from '../../reactivity/effects.js';
import { insert, remove } from '../reconciler.js';
import { current_block, execute_effect } from '../../runtime.js';
import { is_array } from '../../utils.js';

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
		p: /** @type {import('#client').Block} */ (current_block),
		// transition
		r: null,
		// type
		t: DYNAMIC_ELEMENT_BLOCK
	};

	hydrate_block_anchor(anchor_node);
	let has_mounted = false;

	/** @type {string} */
	let tag;

	/** @type {null | Element} */
	let element = null;

	const element_effect = render_effect(
		() => {
			tag = tag_fn();
			if (has_mounted) {
				execute_effect(render_effect_signal);
			}
			has_mounted = true;
		},
		block,
		false
	);

	// Managed effect
	const render_effect_signal = render_effect(
		() => {
			// We try our best infering the namespace in case it's not possible to determine statically,
			// but on the first render on the client (without hydration) the parent will be undefined,
			// since the anchor is not attached to its parent / the dom yet.
			const ns =
				is_svg || tag === 'svg'
					? namespace_svg
					: is_svg === false || anchor_node.parentElement?.tagName === 'foreignObject'
						? null
						: anchor_node.parentElement?.namespaceURI ?? null;

			const next_element = tag
				? hydrating
					? /** @type {Element} */ (current_hydration_fragment[0])
					: ns
						? document.createElementNS(ns, tag)
						: document.createElement(tag)
				: null;

			const prev_element = element;
			if (prev_element !== null) {
				block.d = null;
			}

			element = next_element;
			if (element !== null && render_fn !== undefined) {
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

			const has_prev_element = prev_element !== null;
			if (has_prev_element) {
				remove(prev_element);
			}
			if (element !== null) {
				insert(element, null, anchor_node);
				if (has_prev_element) {
					const parent_block = block.p;
					swap_block_dom(parent_block, prev_element, element);
				}
			}
		},
		block,
		true
	);

	element_effect.ondestroy = () => {
		if (element !== null) {
			remove(element);
			block.d = null;
			element = null;
		}
		destroy_effect(render_effect_signal);
	};

	block.e = element_effect;
}
