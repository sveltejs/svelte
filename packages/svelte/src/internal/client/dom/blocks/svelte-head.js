import { hydrate_anchor, hydrate_nodes, hydrating, set_hydrate_nodes } from '../hydration.js';
import { empty } from '../operations.js';
import { render_effect } from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';

/**
 * @param {(anchor: Node) => import('#client').Dom | void} render_fn
 * @returns {void}
 */
export function head(render_fn) {
	// The head function may be called after the first hydration pass and ssr comment nodes may still be present,
	// therefore we need to skip that when we detect that we're not in hydration mode.
	let previous_hydrate_nodes = null;
	let was_hydrating = hydrating;

	if (hydrating) {
		previous_hydrate_nodes = hydrate_nodes;

		let anchor = /** @type {import('#client').TemplateNode} */ (document.head.firstChild);
		while (anchor.nodeType !== 8 || /** @type {Comment} */ (anchor).data !== '[') {
			anchor = /** @type {import('#client').TemplateNode} */ (anchor.nextSibling);
		}

		anchor = /** @type {import('#client').TemplateNode} */ (hydrate_anchor(anchor));
	}

	var anchor = document.head.appendChild(empty());

	try {
		/** @type {import('#client').Dom | null} */
		var dom = null;

		const head_effect = render_effect(() => {
			if (dom !== null) {
				remove(dom);
				head_effect.dom = dom = null;
			}

			dom = render_fn(anchor) ?? null;
		});

		head_effect.ondestroy = () => {
			if (dom !== null) {
				remove(dom);
			}
		};
	} finally {
		if (was_hydrating) {
			set_hydrate_nodes(/** @type {import('#client').TemplateNode[]} */ (previous_hydrate_nodes));
		}
	}
}
