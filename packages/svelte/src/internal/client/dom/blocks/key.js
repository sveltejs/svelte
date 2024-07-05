/** @import { Effect, TemplateNode } from '#client' */
import { UNINITIALIZED } from '../../../../constants.js';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { safe_not_equal } from '../../reactivity/equality.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';

/**
 * @template V
 * @param {TemplateNode} anchor
 * @param {() => V} get_key
 * @param {(anchor: Node) => TemplateNode | void} render_fn
 * @returns {void}
 */
export function key_block(anchor, get_key, render_fn) {
	if (hydrating) {
		hydrate_next();
	}

	/** @type {V | typeof UNINITIALIZED} */
	let key = UNINITIALIZED;

	/** @type {Effect} */
	let effect;

	block(() => {
		if (safe_not_equal(key, (key = get_key()))) {
			if (effect) {
				pause_effect(effect);
			}

			effect = branch(() => render_fn(anchor));
		}
	});

	if (hydrating) {
		anchor = hydrate_node;
	}
}
