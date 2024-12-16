/** @import { TemplateNode } from '#client' */
import { HYDRATION_END, HYDRATION_START, HYDRATION_START_ELSE } from '../../../../constants.js';
import { block, remove_nodes, render_effect } from '../../reactivity/effects.js';
import { hydrate_node, hydrating, set_hydrate_node, set_hydrating } from '../hydration.js';
import { get_next_sibling } from '../operations.js';

const portals = new Map();

/**
 * @param {TemplateNode} node
 * @param {any} id
 * @returns {void}
 */
export function portal_outlet(node, id) {
	var anchor = node;

	render_effect(() => {
		portals.set(id, { anchor });

		return () => {
			portals.delete(id);
			// TODO what happens to rendered content, if there's still some? Remove? Error?
		};
	});

	if (hydrating) {
		let depth = 1;
		while (anchor !== null && depth > 0) {
			// TODO we have similar logic in other places, consolidate?
			anchor = /** @type {TemplateNode} */ (get_next_sibling(anchor));
			if (anchor?.nodeType === 8) {
				var comment = /** @type {Comment} */ (anchor).data;
				if (comment === HYDRATION_START || comment === HYDRATION_START_ELSE) depth += 1;
				else if (comment[0] === HYDRATION_END) depth -= 1;
			}
		}
		set_hydrate_node(anchor);
	}
}

/**
 * @param {any} target
 * @param {(anchor: TemplateNode) => void} content
 * @returns {void}
 */
export function portal(target, content) {
	const is_css_selector = typeof target === 'string';
	const portal = portals.get(target);

	let previous_hydrating = false;
	let previous_hydrate_node = null;
	// TODO right now the portal is rendered before the given anchor. Is that confusing for people and they'd rather have it as
	// the first child _inside_ the anchor if the anchor is an element?
	var anchor = is_css_selector ? document.querySelector(target) : portal?.anchor;

	if (!anchor)
		throw new Error(
			'TODO error code: No portal found for given target. Make sure portal target exists before referencing it'
		);

	if (hydrating) {
		previous_hydrating = true;
		if (is_css_selector) {
			// These are not SSR'd, so temporarily disable hydration to properly insert them
			set_hydrating(false);
		} else {
			previous_hydrate_node = hydrate_node;
			set_hydrate_node((anchor = /** @type {TemplateNode} */ (get_next_sibling(portal.anchor))));
		}
	}

	const effect = block(() => {
		content(anchor);
		return () => {
			// The parent block will traverse all nodes in the current context, and then state that
			// child effects (like this one) don't need to traverse the nodes anymore because they
			// were already removed by the parent. That's not true in this case because the nodes
			// are somewhere else, so remove them "manually" here.
			remove_nodes(effect);
		};
	});

	if (previous_hydrating) {
		if (is_css_selector) {
			set_hydrating(true);
		} else {
			portal.anchor = hydrate_node; // so that next head block starts from the correct node
			set_hydrate_node(/** @type {TemplateNode} */ (previous_hydrate_node));
		}
	}
}
