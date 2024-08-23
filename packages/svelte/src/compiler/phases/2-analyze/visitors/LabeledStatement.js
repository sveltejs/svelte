/** @import { Expression, LabeledStatement } from 'estree' */
/** @import { ReactiveStatement, SvelteNode } from '#compiler' */
/** @import { Context } from '../types' */
import * as e from '../../../errors.js';
import { extract_identifiers, object } from '../../../utils/ast.js';
import * as w from '../../../warnings.js';
import { is_state_source } from '../../3-transform/client/utils.js';

/**
 * @param {LabeledStatement} node
 * @param {Context} context
 */
export function LabeledStatement(node, context) {
	if (node.label.name === '$') {
		const parent = /** @type {SvelteNode} */ (context.path.at(-1));

		const is_reactive_statement =
			context.state.ast_type === 'instance' && parent.type === 'Program';

		if (is_reactive_statement) {
			if (context.state.analysis.runes) {
				e.legacy_reactive_statement_invalid(node);
			}

			// Find all dependencies of this `$: {...}` statement
			/** @type {ReactiveStatement} */
			const reactive_statement = {
				assignments: new Set(),
				dependencies: []
			};

			context.next({
				...context.state,
				reactive_statement,
				function_depth: context.state.scope.function_depth + 1
			});

			// Every referenced binding becomes a dependency, unless it's on
			// the left-hand side of an `=` assignment
			for (const [name, nodes] of context.state.scope.references) {
				const binding = context.state.scope.get(name);
				if (binding === null) continue;

				for (const { node, path } of nodes) {
					/** @type {Expression} */
					let left = node;

					let i = path.length - 1;
					let parent = /** @type {Expression} */ (path.at(i));
					while (parent.type === 'MemberExpression') {
						left = parent;
						parent = /** @type {Expression} */ (path.at(--i));
					}

					if (
						parent.type === 'AssignmentExpression' &&
						parent.operator === '=' &&
						parent.left === left
					) {
						continue;
					}

					reactive_statement.dependencies.push(binding);
					break;
				}
			}

			context.state.reactive_statements.set(node, reactive_statement);

			if (
				node.body.type === 'ExpressionStatement' &&
				node.body.expression.type === 'AssignmentExpression'
			) {
				let ids = extract_identifiers(node.body.expression.left);
				if (node.body.expression.left.type === 'MemberExpression') {
					const id = object(node.body.expression.left);
					if (id !== null) {
						ids = [id];
					}
				}

				for (const id of ids) {
					const binding = context.state.scope.get(id.name);
					if (binding?.kind === 'legacy_reactive') {
						// TODO does this include `let double; $: double = x * 2`?
						binding.legacy_dependencies = Array.from(reactive_statement.dependencies);
					}
				}
			}
		} else if (!context.state.analysis.runes) {
			w.reactive_declaration_invalid_placement(node);
		}
	}

	context.next();
}
