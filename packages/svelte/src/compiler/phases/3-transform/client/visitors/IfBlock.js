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

	const { has_await } = node.metadata.expression;
	const guard_snapshots = new Map();
	const expression = build_expression(context, node.test, node.metadata.expression, {
		...context.state,
		collect_guard_snapshots: guard_snapshots
	});
	const test = has_await ? b.call('$.get', b.id('$$condition')) : expression;

	let branch_state = context.state;

	if (guard_snapshots.size > 0) {
		const snapshots = new Map(context.state.guard_snapshots ?? undefined);
		const transform = { ...context.state.transform };

		for (const [name, snapshot] of guard_snapshots) {
			snapshots.set(name, snapshot);

			const base = transform[name] ?? context.state.transform[name];
			transform[name] = {
				...base,
				read() {
					return snapshot.id;
				},
				assign: base?.assign,
				mutate: base?.mutate,
				update: base?.update
			};
		}

		branch_state = {
			...context.state,
			collect_guard_snapshots: undefined,
			guard_snapshots: snapshots,
			transform
		};
	}

	const consequent = /** @type {BlockStatement} */ (
		branch_state === context.state
			? context.visit(node.consequent)
			: context.visit(node.consequent, branch_state)
	);
	const consequent_id = b.id(context.state.scope.generate('consequent'));

	statements.push(b.var(consequent_id, b.arrow([b.id('$$anchor')], consequent)));

	let alternate_id;

	if (node.alternate) {
		const alternate = /** @type {BlockStatement} */ (
			branch_state === context.state
				? context.visit(node.alternate)
				: context.visit(node.alternate, branch_state)
		);
		alternate_id = b.id(context.state.scope.generate('alternate'));
		statements.push(b.var(alternate_id, b.arrow([b.id('$$anchor')], alternate)));
	}

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
