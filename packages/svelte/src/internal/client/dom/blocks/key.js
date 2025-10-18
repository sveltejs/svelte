/** @import { TemplateNode } from '#client' */
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

	block(() => {
		branches.ensure(get_key(), render_fn);
	});
}
