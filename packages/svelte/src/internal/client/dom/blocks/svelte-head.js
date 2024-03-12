import { HEAD_BLOCK } from '../../constants.js';
import {
	current_hydration_fragment,
	get_hydration_fragment,
	hydrating,
	set_current_hydration_fragment
} from '../hydration.js';
import { empty } from '../operations.js';
import { render_effect } from '../../reactivity/effects.js';
import { remove } from '../reconciler.js';
import { current_block } from '../../runtime.js';

/**
 * @param {(anchor: Node | null) => void} render_fn
 * @returns {void}
 */
export function head(render_fn) {
	/** @type {import('#client').HeadBlock} */
	const block = {
		// dom
		d: null,
		// effect
		e: null,
		// parent
		p: /** @type {import('#client').Block} */ (current_block),
		// transition
		r: null,
		// type
		t: HEAD_BLOCK
	};

	// The head function may be called after the first hydration pass and ssr comment nodes may still be present,
	// therefore we need to skip that when we detect that we're not in hydration mode.
	let hydration_fragment = null;
	let previous_hydration_fragment = null;

	let is_hydrating = hydrating;
	if (is_hydrating) {
		hydration_fragment = get_hydration_fragment(document.head.firstChild);
		previous_hydration_fragment = current_hydration_fragment;
		set_current_hydration_fragment(hydration_fragment);
	}

	try {
		const head_effect = render_effect(
			() => {
				const current = block.d;
				if (current !== null) {
					remove(current);
					block.d = null;
				}
				let anchor = null;
				if (!hydrating) {
					anchor = empty();
					document.head.appendChild(anchor);
				}
				render_fn(anchor);
			},
			block,
			false
		);

		head_effect.ondestroy = () => {
			const current = block.d;
			if (current !== null) {
				remove(current);
			}
		};

		block.e = head_effect;
	} finally {
		if (is_hydrating) {
			set_current_hydration_fragment(previous_hydration_fragment);
		}
	}
}
