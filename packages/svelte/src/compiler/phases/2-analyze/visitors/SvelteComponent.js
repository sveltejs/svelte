/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as w from '../../../warnings.js';
import { visit_component } from './shared/component.js';

/**
 * @param {AST.SvelteComponent} node
 * @param {Context} context
 */
export function SvelteComponent(node, context) {
	if (context.state.analysis.runes) {
		w.svelte_component_deprecated(node);
	}

	context.visit(node.expression);

	visit_component(node, context);
}
