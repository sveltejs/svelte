/** @import { Expression} from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.DebugTag} node
 * @param {ComponentContext} context
 */
export function DebugTag(node, context) {
	const object = b.object(
		node.identifiers.map((identifier) =>
			b.prop('init', identifier, /** @type {Expression} */ (context.visit(identifier)))
		)
	);

	const call = b.call('console.log', object);

	context.state.init.push(
		b.stmt(b.call('$.template_effect', b.thunk(b.block([b.stmt(call), b.debugger]))))
	);
}
