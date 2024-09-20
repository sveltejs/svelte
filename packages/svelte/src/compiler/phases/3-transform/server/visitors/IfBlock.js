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
	let if_statement = create_if(node, context, index++);

	context.state.template.push(if_statement, block_close);

	let alt = node.alternate;
	while (alt && alt.nodes.length === 1 && alt.nodes[0].type === 'IfBlock' && alt.nodes[0].elseif) {
		const elseif = alt.nodes[0];
		if_statement = if_statement.alternate = create_if(elseif, context, index++);
		alt = elseif.alternate;
	}

	/** @type {string} */
	let else_key;
	if (alt) {
		if_statement.alternate = /** @type {BlockStatement} */ (context.visit(alt));
		else_key = `<!--[${index}-->`;
	} else {
		if_statement.alternate = b.block([]);
		else_key = BLOCK_OPEN_ELSE;
	}
	if_statement.alternate.body.unshift(
		b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal(else_key)))
	);
}
