/** @import { BlockStatement, Expression, IfStatement, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import * as b from '#compiler/builders';
import { block_close, block_open, block_open_else, create_child_block } from './shared/utils.js';

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 */
export function IfBlock(node, context) {
	const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));
	consequent.body.unshift(b.stmt(b.call(b.id('$$renderer.push'), block_open)));

	/** @type {IfStatement} */
	let if_statement = b.if(/** @type {Expression} */ (context.visit(node.test)), consequent);

	let index = 1;
	let current_if = if_statement;
	let alt = node.alternate;

	// Walk the else-if chain, flattening branches
	for (const elseif of node.metadata.flattened ?? []) {
		const branch = /** @type {BlockStatement} */ (context.visit(elseif.consequent));
		branch.body.unshift(b.stmt(b.call(b.id('$$renderer.push'), b.literal(`<!--[${index++}-->`))));

		current_if = current_if.alternate = b.if(
			/** @type {Expression} */ (context.visit(elseif.test)),
			branch
		);
		alt = elseif.alternate;
	}

	// Handle final else (or remaining async chain)
	const final_alternate = alt ? /** @type {BlockStatement} */ (context.visit(alt)) : b.block([]);

	final_alternate.body.unshift(b.stmt(b.call(b.id('$$renderer.push'), block_open_else)));
	current_if.alternate = final_alternate;

	context.state.template.push(
		...create_child_block(
			[if_statement],
			node.metadata.expression.blockers(),
			node.metadata.expression.has_await
		),
		block_close
	);
}
