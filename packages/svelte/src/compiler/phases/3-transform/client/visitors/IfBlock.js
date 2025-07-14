/** @import { BlockStatement, Expression } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types' */
import * as b from '#compiler/builders';
import { build_expression, add_svelte_meta } from './shared/utils.js';

/**
 * @param {AST.IfBlock} node
 * @param {ComponentContext} context
 */
export function IfBlock(node, context) {
	context.state.template.push_comment();
	const statements = [];

	const consequent = /** @type {BlockStatement} */ (context.visit(node.consequent));
	const consequent_id = b.id(context.state.scope.generate('consequent'));

	statements.push(b.var(consequent_id, b.arrow([b.id('$$anchor')], consequent)));

	let alternate_id;

	if (node.alternate) {
		const alternate = /** @type {BlockStatement} */ (context.visit(node.alternate));
		alternate_id = b.id(context.state.scope.generate('alternate'));
		statements.push(b.var(alternate_id, b.arrow([b.id('$$anchor')], alternate)));
	}

	const { has_await } = node.metadata.expression;
	const expression = build_expression(context, node.test, node.metadata.expression);
	const test = has_await ? b.call('$.get', b.id('$$condition')) : expression;

	/** @type {Expression[]} */
	const args = [
		context.state.node,
		b.arrow(
			[b.id('$$render')],
			b.block([
				b.if(
					test,
					b.stmt(b.call('$$render', consequent_id)),
					alternate_id && b.stmt(b.call('$$render', alternate_id, b.literal(false)))
				)
			])
		)
	];

	if (node.elseif) {
		// We treat this...
		//
		//   {#if x}
		//     ...
		//   {:else}
		//     {#if y}
		//       <div transition:foo>...</div>
		//     {/if}
		//   {/if}
		//
		// ...slightly differently to this...
		//
		//   {#if x}
		//     ...
		//   {:else if y}
		//     <div transition:foo>...</div>
		//   {/if}
		//
		// ...even though they're logically equivalent. In the first case, the
		// transition will only play when `y` changes, but in the second it
		// should play when `x` or `y` change — both are considered 'local'
		args.push(b.true);
	}

	statements.push(add_svelte_meta(b.call('$.if', ...args), node, 'if'));

	if (has_await) {
		context.state.init.push(
			b.stmt(
				b.call(
					'$.async',
					context.state.node,
					b.array([b.thunk(expression, true)]),
					b.arrow([context.state.node, b.id('$$condition')], b.block(statements))
				)
			)
		);
	} else {
		context.state.init.push(b.block(statements));
	}
}
