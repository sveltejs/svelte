/** @import { BlockStatement, Expression, Pattern } from 'estree' */
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

	let then_block;
	let catch_block;

	if (node.then) {
		/** @type {Pattern[]} */
		const args = [b.id('$$anchor')];
		const block = /** @type {BlockStatement} */ (context.visit(node.then));

		if (node.value) {
			const argument = create_derived_block_argument(node.value, context);

			args.push(argument.id);

			if (argument.declarations !== null) {
				block.body.unshift(...argument.declarations);
			}
		}

		then_block = b.arrow(args, block);
	}

	if (node.catch) {
		/** @type {Pattern[]} */
		const args = [b.id('$$anchor')];
		const block = /** @type {BlockStatement} */ (context.visit(node.catch));

		if (node.error) {
			const argument = create_derived_block_argument(node.error, context);

			args.push(argument.id);

			if (argument.declarations !== null) {
				block.body.unshift(...argument.declarations);
			}
		}

		catch_block = b.arrow(args, block);
	}

	context.state.init.push(
		b.stmt(
			b.call(
				'$.await',
				context.state.node,
				b.thunk(/** @type {Expression} */ (context.visit(node.expression))),
				node.pending
					? b.arrow([b.id('$$anchor')], /** @type {BlockStatement} */ (context.visit(node.pending)))
					: b.literal(null),
				then_block,
				catch_block
			)
		)
	);
}
