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
	const main_if = create_if(node, context, index++);

	/** @type {IfStatement} */
	let current_if = main_if;

	let alternate = node.alternate;

	while (
		alternate &&
		alternate.nodes.length === 1 &&
		alternate.nodes[0].type === 'IfBlock' &&
		alternate.nodes[0].elseif
	) {
		const current_node = alternate.nodes[0];
		current_if = current_if.alternate = create_if(current_node, context, index++);
		alternate = current_node.alternate;
	}
	if (alternate) {
		current_if.alternate = b.block([
			b.return(
				b.array([
					b.literal(index++),
					b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(alternate)))
				])
			)
		]);
	}

	context.state.init.push(
		b.stmt(
			b.call('$.choose', context.state.node, b.arrow([], b.block([main_if])), b.literal(index))
		)
	);
}
