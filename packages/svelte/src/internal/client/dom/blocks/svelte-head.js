/** @import { TemplateNode } from '#client' */
import { hydrate_node, hydrating, set_hydrate_node, set_hydrating } from '../hydration.js';
import { create_text, get_first_child, get_next_sibling } from '../operations.js';
import { block } from '../../reactivity/effects.js';
import { COMMENT_NODE, HEAD_EFFECT } from '#client/constants';

/**
 * @param {string} hash
 * @param {(anchor: Node) => void} render_fn
 * @returns {void}
 */
export function head(hash, render_fn) {
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
			(head_anchor.nodeType !== COMMENT_NODE || /** @type {Comment} */ (head_anchor).data !== hash)
		) {
			head_anchor = get_next_sibling(head_anchor);
		}

		// If we can't find an opening hydration marker, skip hydration (this can happen
		// if a framework rendered body but not head content)
		if (head_anchor === null) {
			set_hydrating(false);
		} else {
			var start = /** @type {TemplateNode} */ (get_next_sibling(head_anchor));
			head_anchor.remove(); // in case this component is repeated

			set_hydrate_node(start);
		}
	}

	if (!hydrating) {
		anchor = document.head.appendChild(create_text());
	}

	try {
		// Track nodes added to head before render
		const head_children_before = Array.from(document.head.children);
		const head_child_count_before = head_children_before.length;
		
		block(() => render_fn(anchor), HEAD_EFFECT);
		
		// After rendering, check if non-head elements were added and move them to body
		const head_child_count_after = document.head.children.length;
		if (head_child_count_after > head_children_before.length) {
			// Elements were added to head, check if any are non-head elements
			const new_children = Array.from(document.head.children).slice(head_child_count_before);
			for (const child of new_children) {
				// Move non-head-specific elements to body
				if (child.nodeType === 1) { // ELEMENT_NODE
					const tag = child.tagName.toLowerCase();
					// Only keep head-specific elements (script, meta, link, style, title, base, noscript)
					// Move div, span, and other body elements to the body
					if (!['script', 'meta', 'link', 'style', 'title', 'base', 'noscript'].includes(tag)) {
						document.body.appendChild(child);
					}
				}
			}
		}
	} finally {
		if (was_hydrating) {
			set_hydrating(true);
			set_hydrate_node(/** @type {TemplateNode} */ (previous_hydrate_node));
		}
	}
}
