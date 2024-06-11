import { namespace_svg } from '../../../../constants.js';
import { hydrating, set_hydrate_nodes } from '../hydration.js';
import { empty } from '../operations.js';
import {
	block,
	branch,
	destroy_effect,
	pause_effect,
	resume_effect
} from '../../reactivity/effects.js';
import { set_should_intro } from '../../render.js';
import { current_each_item, set_current_each_item } from './each.js';
import { current_component_context, current_effect } from '../../runtime.js';
import { DEV } from 'esm-env';
import { is_array } from '../../utils.js';
import { push_template_node } from '../template.js';
import { noop } from '../../../shared/utils.js';

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
 * @param {Comment | Element} node
 * @param {() => string} get_tag
 * @param {boolean} is_svg
 * @param {undefined | ((element: Element, anchor: Node | null) => void)} render_fn,
 * @param {undefined | (() => string)} get_namespace
 * @param {undefined | [number, number]} location
 * @returns {void}
 */
export function element(node, get_tag, is_svg, render_fn, get_namespace, location) {
	const filename = DEV && location && current_component_context?.function.filename;

	/** @type {string | null} */
	let tag;

	/** @type {string | null} */
	let current_tag;

	/** @type {null | Element} */
	let element = hydrating && node.nodeType === 1 ? /** @type {Element} */ (node) : null;

	let anchor = /** @type {Comment} */ (hydrating && element ? element.nextSibling : node);

	/** @type {import('#client').Effect | null} */
	let effect;

	const parent_effect = /** @type {import('#client').Effect} */ (current_effect);

	// Remove the the hydrated effect dom entry for our dynamic element
	if (hydrating && is_array(parent_effect.dom)) {
		var remove_index = parent_effect.dom.indexOf(
			/** @type {import('#client').TemplateNode} */ (element)
		);
		if (remove_index !== -1) {
			parent_effect.dom.splice(remove_index, 1);
		}
	}

	/**
	 * The keyed `{#each ...}` item block, if any, that this element is inside.
	 * We track this so we can set it when changing the element, allowing any
	 * `animate:` directive to bind itself to the correct block
	 */
	let each_item_block = current_each_item;

	block(() => {
		const element_effect = /** @type {import('#client').Effect} */ (current_effect);
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
					? /** @type {Element} */ (element)
					: ns
						? document.createElementNS(ns, next_tag)
						: document.createElement(next_tag);

				if (DEV && location) {
					// @ts-expect-error
					element.__svelte_meta = {
						loc: {
							file: filename,
							line: location[0],
							column: location[1]
						}
					};
				}

				if (prev_element && !hydrating) {
					swap_block_dom(element_effect, prev_element, element);
					prev_element.remove();
				} else {
					push_template_node(element, element_effect);
				}

				if (render_fn) {
					// If hydrating, use the existing ssr comment as the anchor so that the
					// inner open and close methods can pick up the existing nodes correctly
					var child_anchor = hydrating ? element.lastChild : element.appendChild(empty());

					if (hydrating && child_anchor) {
						set_hydrate_nodes(
							/** @type {import('#client').TemplateNode[]} */ ([...element.childNodes]).slice(0, -1)
						);
					}

					// `child_anchor` is undefined if this is a void element, but we still
					// need to call `render_fn` in order to run actions etc. If the element
					// contains children, it's a user error (which is warned on elsewhere)
					// and the DOM will be silently discarded
					render_fn(element, child_anchor);
				}

				anchor.before(element);

				// See below
				return noop;
			});
		}

		tag = next_tag;
		if (tag) current_tag = tag;
		set_should_intro(true);

		set_current_each_item(previous_each_item);

		// Inert effects are proactively detached from the effect tree. Returning a noop
		// teardown function is an easy way to ensure that this is not discarded
		return noop;
	});
}
