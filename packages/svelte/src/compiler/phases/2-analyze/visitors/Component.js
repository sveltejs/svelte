/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import { visit_component } from './shared/component.js';

/**
 * @param {AST.Component} node
 * @param {Context} context
 */
export function Component(node, context) {
	const binding = context.state.scope.get(
		node.name.includes('.') ? node.name.slice(0, node.name.indexOf('.')) : node.name
	);

	node.metadata.dynamic =
		context.state.analysis.runes && // Svelte 4 required you to use svelte:component to switch components
		binding !== null &&
		(binding.kind !== 'normal' || node.name.includes('.'));

	if (binding) {
		node.metadata.expression.has_state = node.metadata.dynamic;
		node.metadata.expression.dependencies.add(binding);
		node.metadata.expression.references.add(binding);
	}

	visit_component(node, context);
}
