/** @import { BlockStatement, Expression, Pattern, Statement } from 'estree' */
/** @import { AwaitBlock } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '../../../../utils/builders.js';
import { create_derived_block_argument } from '../utils.js';

/**
 * @param {AwaitBlock} node
 * @param {ComponentContext} context
 */
export function AwaitBlock(node, context) {
	context.state.template.push('<!>');

	// Visit {#await <expression>} first to ensure that scopes are in the correct order
	const expression = b.thunk(/** @type {Expression} */ (context.visit(node.expression)));

	let then_block;
	let catch_block;

	if (node.then) {
		const argument = node.value && create_derived_block_argument(node.value, context);

		/** @type {Pattern[]} */
		const args = [b.id('$$anchor')];
		if (argument) args.push(argument.id);

		const declarations = argument?.declarations ?? [];
		const block = /** @type {BlockStatement} */ (context.visit(node.then));

		then_block = b.arrow(args, b.block([...declarations, ...block.body]));
	}

	if (node.catch) {
		const argument = node.error && create_derived_block_argument(node.error, context);

		/** @type {Pattern[]} */
		const args = [b.id('$$anchor')];
		if (argument) args.push(argument.id);

		const declarations = argument?.declarations ?? [];
		const block = /** @type {BlockStatement} */ (context.visit(node.catch));

		catch_block = b.arrow(args, b.block([...declarations, ...block.body]));
	}

	context.state.init.push(
		b.stmt(
			b.call(
				'$.await',
				context.state.node,
				expression,
				node.pending
					? b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.pending)))
					: b.literal(null),
				then_block,
				catch_block
			)
		)
	);
}
