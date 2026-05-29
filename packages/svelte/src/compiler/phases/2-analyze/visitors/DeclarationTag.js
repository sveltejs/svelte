/** @import { AST } from '#compiler' */
/** @import { Context } from '../types' */
import * as b from '#compiler/builders';
import * as e from '../../../errors.js';
import { validate_opening_tag } from './shared/utils.js';

/**
 * @param {AST.DeclarationTag} node
 * @param {Context} context
 */
export function DeclarationTag(node, context) {
	validate_opening_tag(node, context.state, node.declaration.kind[0]);
	if (!context.state.analysis.runes && !context.state.analysis.maybe_runes) {
		e.declaration_tag_no_legacy_mode(node);
	}

	context.visit(node.declaration, {
		...context.state,
		in_declaration_tag: true,
		expression: node.metadata.expression
	});

	mark_async_declaration(context, node.metadata, node.declaration.declarations);
}

/**
 * @param {Context} context
 * @param {AST.ConstTag['metadata'] | AST.DeclarationTag['metadata']} metadata
 * @param {import('estree').VariableDeclarator[]} declarations
 */
export function mark_async_declaration(context, metadata, declarations) {
	const has_await = metadata.expression.has_await;
	const blockers = [...metadata.expression.dependencies]
		.map((dep) => dep.blocker)
		.filter((b) => b !== null && b.object !== context.state.async_consts?.id);

	if (has_await || context.state.async_consts || blockers.length > 0) {
		const run = (context.state.async_consts ??= {
			id: context.state.analysis.root.unique('promises'),
			declaration_count: 0
		});
		metadata.promises_id = run.id;

		const bindings = declarations.flatMap((declaration) =>
			context.state.scope.get_bindings(declaration)
		);

		// keep the counter in sync with the number of thunks pushed in transform
		// TODO 6.0 once non-async and non-runes mode is gone investigate making this more robust
		// via something like the approach in https://github.com/sveltejs/svelte/pull/18032
		const length = run.declaration_count + (blockers.length > 0 ? 1 : 0);
		run.declaration_count += blockers.length > 0 ? 2 : 1;
		const blocker = b.member(run.id, b.literal(length), true);
		for (const binding of bindings) {
			binding.blocker = blocker;
		}
	}
}
