/** @import { TemplateNode } from '#client' */
import { hydrate_node, hydrating, set_hydrate_node, set_hydrating } from '../hydration.js';
import { create_text, get_first_child, get_next_sibling } from '../operations.js';
import { block } from '../../reactivity/effects.js';
import { COMMENT_NODE, HEAD_EFFECT } from '#client/constants';
import { HYDRATION_END, HYDRATION_ERROR, HYDRATION_START } from '../../../../constants.js';
import { hydration_mismatch } from '../../warnings.js';

/**
 * @type {Node | null | undefined}
 */
let head_anchor;

export function reset_head_anchor() {
	head_anchor = undefined;
}

/**
 * @param {(anchor: Node) => void} render_fn
 * @returns {void}
 */
export function head(render_fn) {
	// The head function may be called after the first hydration pass and ssr comment nodes may still be present,
	// therefore we need to skip that when we detect that we're not in hydration mode.
	let previous_hydrate_node = null;
	let was_hydrating = hydrating;

	/** @type {Comment | Text} */
	var anchor;

	if (hydrating) {
		previous_hydrate_node = hydrate_node;

		// There might be multiple head blocks in our app, so we need to account for each one needing independent hydration.
		if (head_anchor === undefined) {
			head_anchor = get_first_child(document.head);
		}

		while (
			head_anchor !== null &&
			(head_anchor.nodeType !== COMMENT_NODE ||
				/** @type {Comment} */ (head_anchor).data !== HYDRATION_START)
		) {
			head_anchor = get_next_sibling(head_anchor);
		}

		// If we can't find an opening hydration marker, skip hydration (this can happen
		// if a framework rendered body but not head content)
		if (head_anchor === null) {
			set_hydrating(false);
		} else {
			head_anchor = set_hydrate_node(/** @type {TemplateNode} */ (get_next_sibling(head_anchor)));
		}
	}

	if (!hydrating) {
		anchor = document.head.appendChild(create_text());
	}

	try {
		block(() => render_fn(anchor), HEAD_EFFECT);
		check_end();
	} catch (error) {
		// Remount only this svelte:head
		if (was_hydrating && head_anchor != null) {
			hydration_mismatch();
			// Here head_anchor is the node next after HYDRATION_START
			/** @type {Node | null} */
			var node = head_anchor.previousSibling;
			// Remove nodes that failed to hydrate
			var depth = 0;
			while (node !== null) {
				var prev = /** @type {TemplateNode} */ (node);
				node = get_next_sibling(node);
				prev.remove();
				if (prev.nodeType === COMMENT_NODE) {
					var data = /** @type {Comment} */ (prev).data;
					if (data === HYDRATION_END) {
						depth -= 1;
						if (depth === 0) break;
					} else if (data === HYDRATION_START) {
						depth += 1;
					}
				}
			}
			// Setup hydration for the next svelte:head
			if (node === null) {
				head_anchor = null;
			} else {
				head_anchor = set_hydrate_node(/** @type {TemplateNode} */ (node));
			}

			set_hydrating(false);
			anchor = document.head.appendChild(create_text());
			block(() => render_fn(anchor), HEAD_EFFECT);
		} else {
			throw error;
		}
	} finally {
		if (was_hydrating) {
			set_hydrating(true);
			head_anchor = hydrate_node; // so that next head block starts from the correct node
			set_hydrate_node(/** @type {TemplateNode} */ (previous_hydrate_node));
		}
	}
}

// treeshaking of hydrate node fails when this is directly in the try-catch
function check_end() {
	if (hydrating && /** @type {Comment|null} */ (hydrate_node)?.data !== HYDRATION_END) {
		hydration_mismatch();
		throw HYDRATION_ERROR;
	}
}
