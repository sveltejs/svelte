/** @import { TemplateNode } from '#client' */
import { hydrate_node, hydrating, set_hydrate_node } from '../hydration.js';
import { empty } from '../operations.js';
import { block } from '../../reactivity/effects.js';
import { HEAD_EFFECT } from '../../constants.js';
import { HYDRATION_START } from '../../../../constants.js';

/**
 * @type {Node | undefined}
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
			head_anchor = /** @type {TemplateNode} */ (document.head.firstChild);
		}

		while (
			head_anchor.nodeType !== 8 ||
			/** @type {Comment} */ (head_anchor).data !== HYDRATION_START
		) {
			head_anchor = /** @type {TemplateNode} */ (head_anchor.nextSibling);
		}

		head_anchor = set_hydrate_node(/** @type {TemplateNode} */ (head_anchor.nextSibling));
	} else {
		anchor = document.head.appendChild(empty());
	}

	try {
		block(() => render_fn(anchor), HEAD_EFFECT);
	} finally {
		if (was_hydrating) {
			head_anchor = hydrate_node; // so that next head block starts from the correct node
			set_hydrate_node(/** @type {TemplateNode} */ (previous_hydrate_node));
		}
	}
}
