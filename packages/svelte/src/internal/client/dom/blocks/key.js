/** @import { Effect, TemplateNode } from '#client' */
import { UNINITIALIZED } from '../../../../constants.js';
import { derived } from '../../reactivity/deriveds.js';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { safe_not_equal } from '../../reactivity/equality.js';
import { get } from '../../runtime.js';
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

	/** We use a derived here to ensure stability of any depedencies due to the use of `pause_effect` */
	var derived_key = derived(get_key);

	block(() => {
		if (safe_not_equal(key, (key = get(derived_key)))) {
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
