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
		// avoid shadowing the component variable by a variable used in $.component
		node.metadata.dynamic
			? '$$component_' + node.name.replaceAll(/[^a-zA-Z_$0-9]/g, '_')
			: node.name,
		context
	);
	context.state.init.push(component);
}
