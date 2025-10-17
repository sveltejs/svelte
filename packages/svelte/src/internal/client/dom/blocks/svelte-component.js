/** @import { TemplateNode, Dom, Effect } from '#client' */
/** @import { Batch } from '../../reactivity/batch.js'; */
import { EFFECT_TRANSPARENT } from '#client/constants';
import { block, branch, pause_effect } from '../../reactivity/effects.js';
import { current_batch } from '../../reactivity/batch.js';
import { hydrate_next, hydrate_node, hydrating } from '../hydration.js';
import { create_text, should_defer_append } from '../operations.js';
import { BranchManager } from './branches.js';
import { noop } from '../../../shared/utils.js';

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
