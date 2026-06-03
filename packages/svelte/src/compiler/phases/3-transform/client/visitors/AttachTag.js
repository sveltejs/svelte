/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { build_expression } from './shared/utils.js';

/**
 * @param {AST.AttachTag} node
 * @param {ComponentContext} context
 */
export function AttachTag(node, context) {
	const expression = build_expression(context, node.expression, node.metadata.expression);
	let statement = b.stmt(b.call('$.attach', context.state.node, b.thunk(expression)));

	if (node.metadata.expression.is_async()) {
		statement = b.stmt(
			b.call(
				'$.run_after_blockers',
				node.metadata.expression.blockers(),
				b.thunk(b.block([statement]))
			)
		);
	}

	context.state.init.push(statement);
	context.next();
}
