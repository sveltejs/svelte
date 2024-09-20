/** @import { ArrowFunctionExpression, BlockStatement, Expression, IfStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 * @param {number} index
 */
function create_if(node, context, index) {
	const test = /** @type {Expression} */ (context.visit(node.test));
	const nb = b.literal(index);
	const fn = b.arrow(
		[b.id('$$anchor')],
		/** @type {BlockStatement} */ (context.visit(node.consequent))
	);

	return b.if(test, b.block([b.return(b.array([nb, fn]))]));
}

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 */
export function IfBlock(node, context) {
	context.state.template.push_quasi('<!>');

	let index = 0;

	/** @type {IfStatement} */
	let if_statement = create_if(node, context, index++);

	context.state.init.push(
		b.stmt(b.call('$.choose', context.state.node, b.arrow([], b.block([if_statement]))))
	);

	let alt = node.alternate;
	while (alt && alt.nodes.length === 1 && alt.nodes[0].type === 'IfBlock' && alt.nodes[0].elseif) {
		const elseif = alt.nodes[0];
		if_statement = if_statement.alternate = create_if(elseif, context, index++);
		alt = elseif.alternate;
	}
	if (alt) {
		if_statement.alternate = b.block([
			b.return(
				b.array([
					b.literal(index++),
					b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(alt)))
				])
			)
		]);
	}
}
