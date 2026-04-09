/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import * as b from '#compiler/builders';
import { validate_opening_tag } from './shared/utils.js';

/**
 * @param {AST.ConstTag} node
 * @param {Context} context
 */
export function ConstTag(node, context) {
	if (context.state.analysis.runes) {
		validate_opening_tag(node, context.state, '@');
	}

	const parent = context.path.at(-1);
	const grand_parent = context.path.at(-2);

	if (
		parent?.type !== 'Fragment' ||
		(grand_parent?.type !== 'IfBlock' &&
			grand_parent?.type !== 'SvelteFragment' &&
			grand_parent?.type !== 'Component' &&
			grand_parent?.type !== 'SvelteComponent' &&
			grand_parent?.type !== 'EachBlock' &&
			grand_parent?.type !== 'AwaitBlock' &&
			grand_parent?.type !== 'SnippetBlock' &&
			grand_parent?.type !== 'SvelteBoundary' &&
			grand_parent?.type !== 'KeyBlock' &&
			((grand_parent?.type !== 'RegularElement' && grand_parent?.type !== 'SvelteElement') ||
				!grand_parent.attributes.some((a) => a.type === 'Attribute' && a.name === 'slot')))
	) {
		e.const_tag_invalid_placement(node);
	}

	const declaration = node.declaration.declarations[0];

	context.visit(declaration.id);
	context.visit(declaration.init, {
		...context.state,
		expression: node.metadata.expression,
		// We're treating this like a $derived under the hood
		function_depth: context.state.function_depth + 1,
		derived_function_depth: context.state.function_depth + 1
	});

	const has_await = node.metadata.expression.has_await;
	const blockers = [...node.metadata.expression.dependencies]
		.map((dep) => dep.blocker)
		.filter((b) => b !== null && b.object !== context.state.async_consts?.id);

	if (has_await || context.state.async_consts || blockers.length > 0) {
		const run = (context.state.async_consts ??= {
			id: context.state.analysis.root.unique('promises'),
			declaration_count: 0
		});
		node.metadata.promises_id = run.id;

		const bindings = context.state.scope.get_bindings(declaration);

		// keep the counter in sync with the number of thunks pushed in ConstTag in transform
		// TODO 6.0 once non-async and non-runes mode is gone investigate making this more robust
		// via something like the approach in https://github.com/sveltejs/svelte/pull/18032
		const length = run.declaration_count++;
		const blocker = b.member(run.id, b.literal(length), true);
		for (const binding of bindings) {
			binding.blocker = blocker;
		}
	}
}
