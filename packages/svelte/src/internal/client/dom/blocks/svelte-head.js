import { hydrate_anchor, hydrate_nodes, hydrating, set_hydrate_nodes } from '../hydration.js';
import { empty } from '../operations.js';
import { block } from '../../reactivity/effects.js';
import { HYDRATION_END, HYDRATION_START } from '../../../../constants.js';
import { HEAD_EFFECT } from '../../constants.js';

/**
 * @type {Node | undefined}
 */
let head_anchor;

export function reset_head_anchor() {
	head_anchor = undefined;
}

/**
 * @param {(anchor: Node) => import('#client').Dom | void} render_fn
 * @returns {void}
 */
export function head(render_fn) {
	// The head function may be called after the first hydration pass and ssr comment nodes may still be present,
	// therefore we need to skip that when we detect that we're not in hydration mode.
	let previous_hydrate_nodes = null;
	let was_hydrating = hydrating;

	/** @type {Comment | Text} */
	var anchor;

	if (hydrating) {
		previous_hydrate_nodes = hydrate_nodes;

		// There might be multiple head blocks in our app, so we need to account for each one needing independent hydration.
		if (head_anchor === undefined) {
			head_anchor = /** @type {import('#client').TemplateNode} */ (document.head.firstChild);
		}

		while (
			head_anchor.nodeType !== 8 ||
			/** @type {Comment} */ (head_anchor).data !== HYDRATION_START
		) {
			head_anchor = /** @type {import('#client').TemplateNode} */ (head_anchor.nextSibling);
		}

		head_anchor = /** @type {import('#client').TemplateNode} */ (hydrate_anchor(head_anchor));
		head_anchor = /** @type {import('#client').TemplateNode} */ (head_anchor.nextSibling);
	} else {
		anchor = document.head.appendChild(empty());
	}

	try {
		block(() => render_fn(anchor), HEAD_EFFECT);
	} finally {
		if (was_hydrating) {
			set_hydrate_nodes(/** @type {import('#client').TemplateNode[]} */ (previous_hydrate_nodes));
		}
	}
}
