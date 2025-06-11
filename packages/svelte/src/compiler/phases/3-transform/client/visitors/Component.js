/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import { regex_is_valid_identifier } from '../../../patterns.js';
import { build_component } from './shared/component.js';

/**
 * @param {AST.Component} node
 * @param {ComponentContext} context
 */
export function Component(node, context) {
	const component = build_component(
		node,
		// if it's not dynamic we will just use the node name, if it is dynamic we will use the node name
		// only if it's a valid identifier, otherwise we will use a default name
		!node.metadata.dynamic || regex_is_valid_identifier.test(node.name) ? node.name : '$$component',
		context
	);
	context.state.init.push(component);
}
