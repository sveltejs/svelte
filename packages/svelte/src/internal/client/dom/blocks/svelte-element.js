import { namespace_svg } from '../../../../constants.js';
import { noop } from '../../../common.js';
import { BRANCH_EFFECT } from '../../constants.js';
import { current_hydration_fragment, hydrate_block_anchor, hydrating } from '../../hydration.js';
import { empty } from '../../operations.js';
import {
	destroy_effect,
	pause_effect,
	render_effect,
	resume_effect
} from '../../reactivity/computations.js';

/**
 * @param {Comment} anchor_node
 * @param {() => string} get_tag
 * @param {boolean | null} is_svg `null` == not statically known
 * @param {undefined | ((element: Element, anchor: Node) => void)} render_fn
 * @returns {void}
 */
export function element(anchor_node, get_tag, is_svg, render_fn) {
	hydrate_block_anchor(anchor_node);

	/** @type {string} */
	let tag;

	/** @type {import('#client').BlockEffect | null} */
	let block;

	/** @type {Element | null} */
	let element;

	/** @type {import('#client').EffectSignal} */
	let branch;

	branch = render_effect(() => {
		if (tag === (tag = get_tag())) return;

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

		// TODO handle hydration mismatch

		if (element) {
			if (next_element) {
				// while (element.firstChild) {
				// 	next_element.appendChild(element.firstChild);
				// }

				element.replaceWith(next_element);

				next_element.appendChild(anchor_node);

				if (render_fn) {
					if (block) {
						pause_effect(block, noop); // TODO we don't actually want to pause it, we want to just destroy it immediately
						destroy_effect(block);
					}

					block = render_effect(() => render_fn(next_element, anchor_node), true); // TODO disable transitions
				}
			} else if (block) {
				const old_element = element;
				pause_effect(block, () => {
					block = null;
					if (old_element === element) {
						old_element.remove();
					}
				});
			} else {
				element.remove();
			}
		} else if (next_element) {
			anchor_node.parentNode?.insertBefore(next_element, anchor_node);

			if (render_fn) {
				/** @type {Node} */
				let anchor;

				if (hydrating) {
					// Use the existing ssr comment as the anchor so that the inner open and close
					// methods can pick up the existing nodes correctly
					anchor = /** @type {Comment} */ (next_element.firstChild);
				} else {
					anchor = empty();
					next_element.appendChild(anchor);
				}

				if (block) {
					resume_effect(block);
				} else {
					block = render_effect(() => render_fn(next_element, anchor), true);
				}
			}
		}

		element = next_element;
		if (branch) branch.dom = element;
	});

	branch.f |= BRANCH_EFFECT;

	branch.dom = element;
}
