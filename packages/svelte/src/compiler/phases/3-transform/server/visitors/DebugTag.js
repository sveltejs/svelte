/** @import { Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { create_child_block } from './shared/utils.js';

/**
 * @param {AST.DebugTag} node
 * @param {ComponentContext} context
 */
export function DebugTag(node, context) {
	const blockers = node.identifiers
		.map((identifier) => context.state.scope.get(identifier.name)?.blocker)
		.filter((blocker) => blocker != null);

	context.state.template.push(
		...create_child_block(
			[
				b.stmt(
					b.call(
						'console.log',
						b.object(
							node.identifiers.map((identifier) =>
								b.prop('init', identifier, /** @type {Expression} */ (context.visit(identifier)))
							)
						)
					)
				),
				b.debugger
			],
			b.array(blockers),
			false
		)
	);
}
