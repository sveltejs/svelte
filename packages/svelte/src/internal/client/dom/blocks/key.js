/** @import { Effect, TemplateNode } from '#client' */
import { UNINITIALIZED } from '../../../../constants.js';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { not_equal, safe_not_equal } from '../../reactivity/equality.js';
import { is_runes } from '../../context.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';

/**
 * @template V
 * @param {TemplateNode} node
 * @param {() => V} get_key
 * @param {(anchor: Node) => TemplateNode | void} render_fn
 * @returns {void}
 */
export function key_block(node, get_key, render_fn) {
	if (hydrating) {
		hydrate_next();
	}

	var anchor = node;

	/** @type {V | typeof UNINITIALIZED} */
	var key = UNINITIALIZED;

	/** @type {Effect} */
	var effect;

	var changed = is_runes() ? not_equal : safe_not_equal;

	block(() => {
		if (changed(key, (key = get_key()))) {
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
