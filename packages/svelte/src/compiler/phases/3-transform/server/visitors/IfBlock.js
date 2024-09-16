/** @import { BlockStatement, Expression, IfStatement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { BLOCK_OPEN_ELSE } from '../../../../../internal/server/hydration.js';
import * as b from '../../../../utils/builders.js';
import { block_close, block_open } from './shared/utils.js';


/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 */
export function IfBlock(node, context) {


	/** @type {AST.IfBlock} */
	let if_block = node;

	/** @type {IfStatement | null} */
	let first_statement = null;
	/** @type {IfStatement | null} */
	let previous_statement = null;

	let index = 0;
	while (true) {
	
		const test = /** @type {Expression} */ (context.visit(if_block.test));
		const consequent = /** @type {BlockStatement} */ (context.visit(if_block.consequent));
		consequent.body.unshift(b.stmt(b.assignment('+=', b.id('$$payload.out'),
			index=== 0 ? block_open : b.literal(`<!--[${index}-->`))));
		index++;

		const statement = b.if(test, consequent);

		if (previous_statement !== null) {
			previous_statement.alternate = statement;
		} else if (first_statement === null) {
			first_statement = statement;
		}
		previous_statement = statement;

		const alternate = if_block.alternate;
		if (alternate && alternate.nodes.length === 1 && alternate.nodes[0].type === 'IfBlock' && alternate.nodes[0].elseif) {
			if_block = alternate.nodes[0];
		} else {
			statement.alternate = alternate
				? /** @type {BlockStatement} */ (context.visit(alternate))
				: b.block([]);
			const else_index = alternate ? `<!--[${index}-->` : BLOCK_OPEN_ELSE;
			statement.alternate.body.unshift(
				b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal(else_index)))
			);
			break;
		}
	} 

	if (first_statement === null) {
		throw new Error("missing if"); // should not occurs
	}
	
	context.state.template.push(first_statement, block_close);
}
