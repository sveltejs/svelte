/** @import { Expression} from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';

/**
 * @param {AST.DebugTag} node
 * @param {ComponentContext} context
 */
export function DebugTag(node, context) {
	const blockers = node.identifiers
		.map((identifier) => context.state.scope.get(identifier.name)?.blocker)
		.filter((blocker) => blocker != null);

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

	const args = [b.thunk(b.block([b.stmt(b.call('console.log', object)), b.debugger]))];

	if (blockers.length > 0) {
		args.push(b.array([]), b.array([]), b.array(blockers));
	}

	context.state.init.push(b.stmt(b.call('$.template_effect', ...args)));
}
