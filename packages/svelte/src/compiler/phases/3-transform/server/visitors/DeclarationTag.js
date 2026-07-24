/** @import { Expression, Identifier, Pattern, Statement, ExpressionStatement, VariableDeclaration } from 'estree' */
/** @import { AST } from '#compiler' */
/** @import { ComponentContext } from '../types.js' */
import { extract_identifiers, has_await_expression } from '../../../../utils/ast.js';
import * as b from '#compiler/builders';

/**
 * @param {AST.DeclarationTag} node
 * @param {ComponentContext} context
 */
export function DeclarationTag(node, context) {
	const declaration = /** @type {Statement} */ (context.visit(node.declaration));

	if (
		node.metadata.promises_id &&
		node.declaration.type === 'VariableDeclaration' &&
		declaration.type === 'VariableDeclaration'
	) {
		const { ids, assignments } = build_async_declaration_parts(declaration);
		add_async_declaration(context, node.metadata, ids, assignments, declaration.kind);
	} else {
		context.state.init.push(declaration);
	}
}

/**
 * @param {VariableDeclaration} declaration
 */
export function build_async_declaration_parts(declaration) {
	const ids = new Map();
	for (const declarator of declaration.declarations) {
		for (const id of extract_identifiers(declarator.id)) {
			ids.set(id.name, id);
		}
	}

	const assignments = declaration.declarations
		.filter((declarator) => declarator.init !== null)
		.map((declarator) =>
			b.stmt(
				b.assignment(
					'=',
					/** @type {Pattern} */ (declarator.id),
					/** @type {Expression} */ (declarator.init)
				)
			)
		);

	return { ids: [...ids.values()], assignments };
}

/**
 * @param {ComponentContext} context
 * @param {AST.ConstTag['metadata'] | AST.DeclarationTag['metadata']} metadata
 * @param {Identifier[]} ids
 * @param {ExpressionStatement[]} assignments
 * @param {VariableDeclaration['kind']} [kind]
 */
export function add_async_declaration(context, metadata, ids, assignments, kind = 'let') {
	const run = (context.state.async_consts ??= {
		id: /** @type {Identifier} */ (metadata.promises_id),
		thunks: []
	});

	for (const id of ids) {
		context.state.init.push(kind === 'var' ? b.var(id.name) : b.let(id.name));
	}

	const blockers = [...metadata.expression.dependencies]
		.map((dep) => dep.blocker)
		.filter((b) => b !== null && b.object !== context.state.async_consts?.id);

	if (blockers.length === 1) {
		run.thunks.push(b.thunk(/** @type {Expression} */ (blockers[0])));
	} else if (blockers.length > 0) {
		run.thunks.push(b.thunk(b.call('Promise.all', b.array(blockers))));
	}

	// keep the number of thunks pushed in sync with analysis phase
	const has_await =
		metadata.expression.has_await ||
		assignments.some((assignment) => has_await_expression(assignment));
	const body = assignments.length === 1 ? assignments[0].expression : b.block(assignments);
	run.thunks.push(b.thunk(body, has_await));
}
