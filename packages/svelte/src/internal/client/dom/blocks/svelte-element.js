/** @import { Effect, EffectNodes, TemplateNode } from '#client' */
import { FILENAME, NAMESPACE_SVG } from '../../../../constants.js';
import {
	hydrate_next,
	hydrate_node,
	hydrating,
	set_hydrate_node,
	set_hydrating
} from '../hydration.js';
import { create_text, get_first_child } from '../operations.js';
import { block, teardown } from '../../reactivity/effects.js';
import { set_should_intro } from '../../render.js';
import { active_effect } from '../../runtime.js';
import { component_context, dev_stack } from '../../context.js';
import { DEV } from 'esm-env';
import { EFFECT_TRANSPARENT, ELEMENT_NODE } from '#client/constants';
import { assign_nodes } from '../template.js';
import { is_raw_text_element } from '../../../../utils.js';
import { BranchManager } from './branches.js';
import { set_animation_effect_override } from '../elements/transitions.js';

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
	let was_hydrating = hydrating;

	if (hydrating) {
		hydrate_next();
	}

	var filename = DEV && location && component_context?.function[FILENAME];

	/** @type {null | Element} */
	var element = null;

	if (hydrating && hydrate_node.nodeType === ELEMENT_NODE) {
		element = /** @type {Element} */ (hydrate_node);
		hydrate_next();
	}

	var anchor = /** @type {TemplateNode} */ (hydrating ? hydrate_node : node);

	/**
	 * We track this so we can set it when changing the element, allowing any
	 * `animate:` directive to bind itself to the correct block
	 */
	var parent_effect = /** @type {Effect} */ (active_effect);

	var branches = new BranchManager(anchor, false);

	block(() => {
		const next_tag = get_tag() || null;
		var ns = get_namespace ? get_namespace() : is_svg || next_tag === 'svg' ? NAMESPACE_SVG : null;

		if (next_tag === null) {
			branches.ensure(null, null);
			set_should_intro(true);
			return;
		}

		branches.ensure(next_tag, (anchor) => {
			if (next_tag) {
				element = hydrating
					? /** @type {Element} */ (element)
					: ns
						? document.createElementNS(ns, next_tag)
						: document.createElement(next_tag);

				if (DEV && location) {
					// @ts-expect-error
					element.__svelte_meta = {
						parent: dev_stack,
						loc: {
							file: filename,
							line: location[0],
							column: location[1]
						}
					};
				}

				assign_nodes(element, element);

				if (render_fn) {
					if (hydrating && is_raw_text_element(next_tag)) {
						// prevent hydration glitches
						element.append(document.createComment(''));
					}

					// If hydrating, use the existing ssr comment as the anchor so that the
					// inner open and close methods can pick up the existing nodes correctly
					var child_anchor = hydrating
						? get_first_child(element)
						: element.appendChild(create_text());

					if (hydrating) {
						if (child_anchor === null) {
							set_hydrating(false);
						} else {
							set_hydrate_node(child_anchor);
						}
					}

					set_animation_effect_override(parent_effect);

					// `child_anchor` is undefined if this is a void element, but we still
					// need to call `render_fn` in order to run actions etc. If the element
					// contains children, it's a user error (which is warned on elsewhere)
					// and the DOM will be silently discarded
					render_fn(element, child_anchor);

					set_animation_effect_override(null);
				}

				// we do this after calling `render_fn` so that child effects don't override `nodes.end`
				/** @type {Effect & { nodes: EffectNodes }} */ (active_effect).nodes.end = element;

				anchor.before(element);
			}

			if (hydrating) {
				set_hydrate_node(anchor);
			}
		});

		// revert to the default state after the effect has been created
		set_should_intro(true);

		return () => {
			if (next_tag) {
				// if we're in this callback because we're re-running the effect,
				// disable intros (unless no element is currently displayed)
				set_should_intro(false);
			}
		};
	}, EFFECT_TRANSPARENT);

	teardown(() => {
		set_should_intro(true);
	});

	if (was_hydrating) {
		set_hydrating(true);
		set_hydrate_node(anchor);
	}
}
