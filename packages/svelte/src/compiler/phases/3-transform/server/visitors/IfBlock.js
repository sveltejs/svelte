/** @import { BlockStatement, Expression, IfStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { BLOCK_OPEN_ELSE } from '../../../../../internal/server/hydration.js';
import * as b from '../../../../utils/builders.js';
import { block_close, block_open } from './shared/utils.js';

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 * @param {number} index
 */
function create_if(node, context, index) {
	const test = /** @type {Expression} */ (context.visit(node.test));
	const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));
	consequent.body.unshift(
		b.stmt(
			b.assignment(
				'+=',
				b.id('$$payload.out'),
				index === 0 ? block_open : b.literal(`<!--[${index}-->`)
			)
		)
	);
	return b.if(test, consequent);
}

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 */
export function IfBlock(node, context) {
	let index = 0;

	/** @type {IfStatement} */
	let current_if = create_if(node, context, index++);

	context.state.template.push(current_if, block_close);

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

	/** @type {string} */
	let else_key;
	if (alternate) {
		current_if.alternate = /** @type {BlockStatement} */ (context.visit(alternate));
		else_key = `<!--[${index}-->`;
	} else {
		current_if.alternate = b.block([]);
		else_key = BLOCK_OPEN_ELSE;
	}
	current_if.alternate.body.unshift(
		b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal(else_key)))
	);
}
