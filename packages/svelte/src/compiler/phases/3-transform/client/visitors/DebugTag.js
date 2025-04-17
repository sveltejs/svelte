/** @import { Expression} from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {AST.DebugTag} node
 * @param {ComponentContext} context
 */
export function DebugTag(node, context) {
	const object = b.object(
		node.identifiers.map((identifier) => {
			const visited = b.call('$.snapshot', /** @type {Expression} */ (context.visit(identifier)));

			return b.prop(
				'init',
				identifier,
				context.state.analysis.runes ? visited : b.call('$.untrack', b.thunk(visited))
			);
		})
	);

	const call = b.call('console.log', object);

	context.state.init.push(
		b.stmt(b.call('$.template_effect', b.thunk(b.block([b.stmt(call), b.debugger]))))
	);
}
