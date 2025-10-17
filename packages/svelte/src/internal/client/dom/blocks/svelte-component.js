/** @import { TemplateNode, Dom } from '#client' */
import { EFFECT_TRANSPARENT } from '#client/constants';
import { block } from '../../reactivity/effects.js';
import { hydrate_next, hydrating } from '../hydration.js';
import { BranchManager } from './branches.js';

/**
 * @template P
 * @template {(props: P) => void} C
 * @param {TemplateNode} node
 * @param {() => C} get_component
 * @param {(anchor: TemplateNode, component: C) => Dom | void} render_fn
 * @returns {void}
 */
export function component(node, get_component, render_fn) {
	if (hydrating) {
		hydrate_next();
	}

	var branches = new BranchManager(node);

	block(() => {
		var component = get_component() ?? null;
		branches.ensure(component, component && ((target) => render_fn(target, component)));
	}, EFFECT_TRANSPARENT);
}
