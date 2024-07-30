/** @import { Component } from '#compiler' */
/** @import { Context } from '../types' */
import { visit_component } from './shared/component.js';

/**
 * @param {Component} node
 * @param {Context} context
 */
export function Component(node, context) {
	const binding = context.state.scope.get(
		node.name.includes('.') ? node.name.slice(0, node.name.indexOf('.')) : node.name
	);

	node.metadata.dynamic = binding !== null && binding.kind !== 'normal';

	visit_component(node, context);
}
