import {
	current_hydration_fragment,
	hydrating,
	set_current_hydration_fragment,
	update_hydration_fragment
} from '../hydration.js';
import { empty } from '../operations.js';
import { render_effect } from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';

/**
 * @param {(anchor: Node | null) => import('#client').Dom | void} render_fn
 * @returns {void}
 */
export function head(render_fn) {
	// The head function may be called after the first hydration pass and ssr comment nodes may still be present,
	// therefore we need to skip that when we detect that we're not in hydration mode.
	let previous_hydration_fragment = null;
	let was_hydrating = hydrating;

	if (hydrating) {
		previous_hydration_fragment = current_hydration_fragment;
		update_hydration_fragment(document.head.firstChild);
	}

	try {
		/** @type {import('#client').Dom | null} */
		var dom = null;

		const head_effect = render_effect(() => {
			if (dom !== null) {
				remove(dom);
				head_effect.dom = dom = null;
			}

			let anchor = null;
			if (!hydrating) {
				anchor = empty();
				document.head.appendChild(anchor);
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
			set_current_hydration_fragment(previous_hydration_fragment);
		}
	}
}
