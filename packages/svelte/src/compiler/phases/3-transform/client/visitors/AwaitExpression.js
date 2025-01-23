/** @import { AwaitExpression, Expression } from 'estree' */
/** @import { Context } from '../types' */
import * as b from '../../../../utils/builders.js';
import { get_rune } from '../../../scope.js';

/**
 * @param {AwaitExpression} node
 * @param {Context} context
 */
export function AwaitExpression(node, context) {
	const suspend = context.state.analysis.suspenders.get(node);

	if (!suspend) {
		return context.next();
	}

	const inside_derived = context.path.some(
		(n) =>
			n.type === 'VariableDeclaration' &&
			n.declarations.some(
				(d) => d.init?.type === 'CallExpression' && get_rune(d.init, context.state.scope) === '$derived'
			)
	);

	const expression = b.call(
		b.await(
			b.call('$.save', node.argument && /** @type {Expression} */ (context.visit(node.argument)))
		)
	);

	return inside_derived
		? expression
		: b.await(b.call('$.script_suspend', b.arrow([], expression, true)));
}
