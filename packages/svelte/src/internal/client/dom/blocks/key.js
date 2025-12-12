/** @import { TemplateNode } from '#client' */
import { is_runes } from '../../context.js';
import { block } from '../../reactivity/effects.js';
import { hydrate_next, hydrating } from '../hydration.js';
import { BranchManager } from './branches.js';

/**
 * @template V
 * @param {TemplateNode} node
 * @param {() => V} get_key
 * @param {(anchor: Node) => TemplateNode | void} render_fn
 * @returns {void}
 */
export function key(node, get_key, render_fn) {
	if (hydrating) {
		hydrate_next();
	}

	var branches = new BranchManager(node);

	var legacy = !is_runes();

	block(() => {
		var key = get_key();

		// key blocks in Svelte <5 had stupid semantics
		if (legacy && key !== null && typeof key === 'object') {
			key = /** @type {V} */ ({});
		}

		branches.ensure(key, render_fn);
	});
}
