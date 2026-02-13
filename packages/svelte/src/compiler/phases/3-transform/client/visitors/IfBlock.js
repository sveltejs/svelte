/** @import { BlockStatement, Expression, IfStatement, Statement } from 'estree' */
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

	/** @type {Statement[]} */
	const statements = [];

	const has_await = node.metadata.expression.has_await;
	const has_blockers = node.metadata.expression.has_blockers();
	const expression = build_expression(context, node.test, node.metadata.expression);

	// Build the if/else-if/else chain
	let index = 0;
	/** @type {IfStatement | undefined} */
	let first_if;
	/** @type {IfStatement | undefined} */
	let last_if;
	/** @type {AST.IfBlock | undefined} */
	let last_alt;

	for (const branch of [node, ...(node.metadata.flattened ?? [])]) {
		const consequent = /** @type {BlockStatement} */ (context.visit(branch.consequent));
		const consequent_id = b.id(context.state.scope.generate('consequent'));
		statements.push(b.var(consequent_id, b.arrow([b.id('$$anchor')], consequent)));

		// Build the test expression for this branch
		/** @type {Expression} */
		let test;

		if (branch.metadata.expression.has_await) {
			// Top-level condition with await: already resolved by $.async wrapper
			test = b.call('$.get', b.id('$$condition'));
		} else {
			const expression = build_expression(context, branch.test, branch.metadata.expression);

			if (branch.metadata.expression.has_call) {
				const derived_id = b.id(context.state.scope.generate('d'));
				statements.push(b.var(derived_id, b.call('$.derived', b.arrow([], expression))));
				test = b.call('$.get', derived_id);
			} else {
				test = expression;
			}
		}

		const render_call = b.stmt(b.call('$$render', consequent_id, index > 0 && b.literal(index)));
		const new_if = b.if(test, render_call);

		if (last_if) {
			last_if.alternate = new_if;
		} else {
			first_if = new_if;
		}

		last_alt = branch;
		last_if = new_if;
		index++;
	}

	// Handle final alternate (else branch, remaining async chain, or nothing)
	if (last_if && last_alt?.alternate) {
		const alternate = /** @type {BlockStatement} */ (context.visit(last_alt.alternate));
		const alternate_id = b.id(context.state.scope.generate('alternate'));
		statements.push(b.var(alternate_id, b.arrow([b.id('$$anchor')], alternate)));

		last_if.alternate = b.stmt(b.call('$$render', alternate_id, b.literal(false)));
	}

	// Build $.if() arguments
	/** @type {Expression[]} */
	const args = [
		context.state.node,
		b.arrow([b.id('$$render')], first_if ? b.block([first_if]) : b.block([]))
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
		// should play when `x` or `y` change — both are considered 'local'.
		// This could also be a non-flattened elseif (because it has an async expression).
		// In both cases mark as elseif so the runtime uses EFFECT_TRANSPARENT for transitions.
		args.push(b.true);
	}

	statements.push(add_svelte_meta(b.call('$.if', ...args), node, 'if'));

	if (has_await || has_blockers) {
		context.state.init.push(
			b.stmt(
				b.call(
					'$.async',
					context.state.node,
					node.metadata.expression.blockers(),
					has_await ? b.array([b.thunk(expression, true)]) : b.void0,
					b.arrow(
						has_await ? [context.state.node, b.id('$$condition')] : [context.state.node],
						b.block(statements)
					)
				)
			)
		);
	} else {
		context.state.init.push(b.block(statements));
	}
}
