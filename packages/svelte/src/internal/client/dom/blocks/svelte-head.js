/** @import { TemplateNode } from '#client' */
import { hydrate_node, hydrating, set_hydrate_node, set_hydrating } from '../hydration.js';
import {
	create_text,
	get_first_child,
	get_next_sibling,
	remove_node,
	append_child,
	node_type,
	get_node_value
} from '../operations.js';
import { block } from '../../reactivity/effects.js';
import { COMMENT_NODE, EFFECT_PRESERVED, HEAD_EFFECT } from '#client/constants';

/**
 * @param {string} hash
 * @param {(anchor: Node) => void} render_fn
 * @returns {void}
 */
export function head(hash, render_fn) {
	// TODO RENDERER: throw in case we are using custom renderers as this rely on the head element
	// The head function may be called after the first hydration pass and ssr comment nodes may still be present,
	// therefore we need to skip that when we detect that we're not in hydration mode.
	let previous_hydrate_node = null;
	let was_hydrating = hydrating;

	/** @type {Comment | Text} */
	var anchor;

	if (hydrating) {
		previous_hydrate_node = hydrate_node;

		var head_anchor = get_first_child(document.head);

		// There might be multiple head blocks in our app, and they could have been
		// rendered in an arbitrary order — find one corresponding to this component
		while (
			head_anchor !== null &&
			(node_type(head_anchor) !== COMMENT_NODE || get_node_value(head_anchor) !== hash)
		) {
			head_anchor = get_next_sibling(head_anchor);
		}

		// If we can't find an opening hydration marker, skip hydration (this can happen
		// if a framework rendered body but not head content)
		if (head_anchor === null) {
			set_hydrating(false);
		} else {
			var start = /** @type {TemplateNode} */ (get_next_sibling(head_anchor));
			remove_node(/** @type {ChildNode} */ (head_anchor)); // in case this component is repeated

			set_hydrate_node(start);
		}
	}

	if (!hydrating) {
		anchor = /** @type {Comment | Text} */ (append_child(document.head, create_text()));
	}

	try {
		// normally a branch is the child of a block and would have the EFFECT_PRESERVED flag,
		// but since head blocks don't necessarily only have direct branch children we add it on the block itself
		block(() => render_fn(anchor), HEAD_EFFECT | EFFECT_PRESERVED);
	} finally {
		if (was_hydrating) {
			set_hydrating(true);
			set_hydrate_node(/** @type {TemplateNode} */ (previous_hydrate_node));
		}
	}
}
