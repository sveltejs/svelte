import { namespace_svg } from '../../../../constants.js';
import { hydrate_anchor, hydrate_nodes, hydrating } from '../hydration.js';
import { empty } from '../operations.js';
import {
	block,
	branch,
	destroy_effect,
	pause_effect,
	render_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { is_array } from '../../utils.js';
import { set_should_intro } from '../../render.js';
import { current_each_item, set_current_each_item } from './each.js';
import { current_effect } from '../../runtime.js';
import { push_template_node } from '../template.js';

/**
 * @param {import('#client').Effect} effect
 * @param {Element} from
 * @param {Element} to
 * @returns {void}
 */
function swap_block_dom(effect, from, to) {
	const dom = effect.dom;

	if (is_array(dom)) {
		for (let i = 0; i < dom.length; i++) {
			if (dom[i] === from) {
				dom[i] = to;
				break;
			}
		}
	} else if (dom === from) {
		effect.dom = to;
	}
}

/**
 * @param {Comment} anchor
 * @param {() => string} get_tag
 * @param {boolean} is_svg
 * @param {undefined | ((element: Element, anchor: Node) => void)} render_fn,
 * @param {undefined | (() => string)} get_namespace
 * @returns {void}
 */
export function element(anchor, get_tag, is_svg, render_fn, get_namespace) {
	const parent_effect = /** @type {import('#client').Effect} */ (current_effect);

	render_effect(() => {
		/** @type {string | null} */
		let tag;

		/** @type {string | null} */
		let current_tag;

		/** @type {null | Element} */
		let element = null;

		/** @type {import('#client').Effect | null} */
		let effect;

		/**
		 * The keyed `{#each ...}` item block, if any, that this element is inside.
		 * We track this so we can set it when changing the element, allowing any
		 * `animate:` directive to bind itself to the correct block
		 */
		let each_item_block = current_each_item;

		block(() => {
			const next_tag = get_tag() || null;
			const ns = get_namespace
				? get_namespace()
				: is_svg || next_tag === 'svg'
					? namespace_svg
					: null;
			// Assumption: Noone changes the namespace but not the tag (what would that even mean?)
			if (next_tag === tag) return;

			// See explanation of `each_item_block` above
			var previous_each_item = current_each_item;
			set_current_each_item(each_item_block);

			if (effect) {
				if (next_tag === null) {
					// start outro
					pause_effect(effect, () => {
						effect = null;
						current_tag = null;
						element?.remove();
					});
				} else if (next_tag === current_tag) {
					// same tag as is currently rendered — abort outro
					resume_effect(effect);
				} else {
					// tag is changing — destroy immediately, render contents without intro transitions
					destroy_effect(effect);
					set_should_intro(false);
				}
			}

			if (next_tag && next_tag !== current_tag) {
				effect = branch(() => {
					const prev_element = element;
					element = hydrating
						? /** @type {Element} */ (hydrate_nodes[0])
						: ns
							? document.createElementNS(ns, next_tag)
							: document.createElement(next_tag);

					if (render_fn) {
						// If hydrating, use the existing ssr comment as the anchor so that the
						// inner open and close methods can pick up the existing nodes correctly
						var child_anchor = hydrating
							? element.firstChild && hydrate_anchor(/** @type {Comment} */ (element.firstChild))
							: element.appendChild(empty());

						if (child_anchor) {
							// `child_anchor` can be undefined if this is a void element with children,
							// i.e. `<svelte:element this={"hr"}>...</svelte:element>`. This is
							// user error, but we warn on it elsewhere (in dev) so here we just
							// silently ignore it
							render_fn(element, child_anchor);
						}
					}

					anchor.before(element);

					if (prev_element) {
						swap_block_dom(parent_effect, prev_element, element);
						prev_element.remove();
					} else if (!hydrating) {
						push_template_node(element, parent_effect);
					}
				});
			}

			tag = next_tag;
			if (tag) current_tag = tag;
			set_should_intro(true);

			set_current_each_item(previous_each_item);
		});

		return () => {
			element?.remove();
		};
	});
}
