/** @import { Component } from '#compiler' */
/** @import { Context } from '../types' */
import { validate_component } from './shared/component.js';

/**
 * @param {Component} node
 * @param {Context} context
 */
export function Component(node, context) {
	validate_component(node, context);

	const binding = context.state.scope.get(
		node.name.includes('.') ? node.name.slice(0, node.name.indexOf('.')) : node.name
	);

	node.metadata.dynamic = binding !== null && binding.kind !== 'normal';
}
