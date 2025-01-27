/** @import { BlockStatement, Expression, Pattern, Statement } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentClientTransformState, ComponentContext } from '../types' */
import { extract_identifiers } from '../../../../utils/ast.js';
import * as b from '../../../../utils/builders.js';
import { create_derived } from '../utils.js';
import { get_value } from './shared/declarations.js';

/**
 * @param {AST.AwaitBlock} node
 * @param {ComponentContext} context
 */
export function AwaitBlock(node, context) {
	context.state.template.push('<!>');

	// Visit {#await <expression>} first to ensure that scopes are in the correct order
	const expression = b.thunk(/** @type {Expression} */ (context.visit(node.expression)));

	let then_block;
	let catch_block;

	if (node.then) {
		const then_context = {
			...context,
			state: { ...context.state, transform: { ...context.state.transform } }
		};
		const argument = node.value && create_derived_block_argument(node.value, then_context);

		/** @type {Pattern[]} */
		const args = [b.id('$$anchor')];
		if (argument) args.push(argument.id);

		const declarations = argument?.declarations ?? [];
		const block = /** @type {BlockStatement} */ (then_context.visit(node.then, then_context.state));

		then_block = b.arrow(args, b.block([...declarations, ...block.body]));
	}

	if (node.catch) {
		const catch_context = { ...context, state: { ...context.state } };
		const argument = node.error && create_derived_block_argument(node.error, catch_context);

		/** @type {Pattern[]} */
		const args = [b.id('$$anchor')];
		if (argument) args.push(argument.id);

		const declarations = argument?.declarations ?? [];
		const block = /** @type {BlockStatement} */ (
			catch_context.visit(node.catch, catch_context.state)
		);

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

/**
 * @param {Pattern} node
 * @param {import('zimmerframe').Context<AST.SvelteNode, ComponentClientTransformState>} context
 * @returns {{ id: Pattern, declarations: null | Statement[] }}
 */
function create_derived_block_argument(node, context) {
	if (node.type === 'Identifier') {
		context.state.transform[node.name] = { read: get_value };
		return { id: node, declarations: null };
	}

	const pattern = /** @type {Pattern} */ (context.visit(node));
	const identifiers = extract_identifiers(node);

	const id = b.id('$$source');
	const value = b.id('$$value');

	const block = b.block([
		b.var(pattern, b.call('$.get', id)),
		b.return(b.object(identifiers.map((identifier) => b.prop('init', identifier, identifier))))
	]);

	const declarations = [b.var(value, create_derived(context.state, b.thunk(block)))];

	for (const id of identifiers) {
		context.state.transform[id.name] = { read: get_value };

		declarations.push(
			b.var(id, create_derived(context.state, b.thunk(b.member(b.call('$.get', value), id))))
		);
	}

	return { id, declarations };
}
