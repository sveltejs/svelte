/** @import { BlockStatement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { BLOCK_OPEN_ELSE } from '../../../../../internal/server/hydration.js';
import * as b from '#compiler/builders';
import { block_close, block_open } from './shared/utils.js';

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 */
export function IfBlock(node, context) {
	const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));
	consequent.body.unshift(b.stmt(b.assignment('+=', b.id('$$payload.out'), block_open)));
	let if_statement = b.if(/** @type {Expression} */ (context.visit(node.test)), consequent);

	context.state.template.push(if_statement, block_close);

	let index = 1;
	let alt = node.alternate;
	while (alt && alt.nodes.length === 1 && alt.nodes[0].type === 'IfBlock' && alt.nodes[0].elseif) {
		const elseif = alt.nodes[0];
		const alternate = /** @type {BlockStatement} */ (context.visit(elseif.consequent));
		alternate.body.unshift(
			b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal(`<!--[${index++}-->`)))
		);
		if_statement = if_statement.alternate = b.if(
			/** @type {Expression} */ (context.visit(elseif.test)),
			alternate
		);
		alt = elseif.alternate;
	}

	if_statement.alternate = alt ? /** @type {BlockStatement} */ (context.visit(alt)) : b.block([]);
	if_statement.alternate.body.unshift(
		b.stmt(b.assignment('+=', b.id('$$payload.out'), b.literal(BLOCK_OPEN_ELSE)))
	);
}
