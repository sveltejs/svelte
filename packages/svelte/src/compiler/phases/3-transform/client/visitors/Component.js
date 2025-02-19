/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_component } from './shared/component.js';

/**
 * @param {AST.Component} node
 * @param {ComponentContext} context
 */
export function Component(node, context) {
	if (node.metadata.dynamic) {
		let safe_props_ids = new Map();

		const safe_props_name = context.state.scope.generate('$$safe_props');

		// Handle dynamic references to what seems like static inline components
		const component = build_component(
			node,
			'$$component',
			{
				...context,
				state: {
					...context.state,
					safe_props_ids,
					safe_props_name
				}
			},
			b.id('$$anchor')
		);
		context.state.init.push(
			b.stmt(
				b.call(
					'$.component',
					context.state.node,
					// TODO use untrack here to not update when binding changes?
					// Would align with Svelte 4 behavior, but it's arguably nicer/expected to update this
					b.thunk(/** @type {Expression} */ (context.visit(b.member_id(node.name)))),
					b.arrow(
						[b.id('$$anchor'), b.id('$$component')],
						b.block([
							b.const(
								safe_props_name,
								b.call(
									'$.safe_props',
									b.object([...safe_props_ids].map(([name, id]) => b.get(name, [b.return(id)])))
								)
							),
							component
						])
					)
				)
			)
		);
		return;
	}

	const component = build_component(node, node.name, context);
	context.state.init.push(component);
}
