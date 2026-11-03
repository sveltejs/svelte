/** @import { Expression, LabeledStatement } from 'estree' */
/** @import { AST, ReactiveStatement } from '#compiler' */
/** @import { Context } from '../types' */
import { walk } from 'zimmerframe';
import * as e from '../../../errors.js';
import { extract_identifiers, object } from '../../../utils/ast.js';
import * as w from '../../../warnings.js';

/**
 * @param {LabeledStatement} node
 * @param {Context} context
 */
export function LabeledStatement(node, context) {
	if (node.label.name === '$') {
		const parent = /** @type {AST.SvelteNode} */ (context.path.at(-1));

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
			const assigned = assigned_in(node.body);
			for (const [name, nodes] of context.state.scope.references) {
				const binding = context.state.scope.get(name);
				if (binding === null) continue;

				for (const { node } of nodes) {
					if (assigned.has(node)) continue;

					reactive_statement.dependencies.push(binding);
					break;
				}
			}

			context.state.analysis.reactive_statements.set(node, reactive_statement);

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

/**
 * The identifiers on the left-hand side of the `=` assignments in a statement, the members of
 * the target included: `a[b].c = 1` assigns through `a` and `b`.
 * @param {import('estree').Node} node
 * @returns {Set<import('estree').Node>}
 */
function assigned_in(node) {
	/** @type {Set<import('estree').Node>} */
	const assigned = new Set();
	/** @param {import('estree').Node} target */
	const collect = (target) => {
		if (target.type === 'Identifier') assigned.add(target);
		else if (target.type === 'MemberExpression') {
			collect(target.object);
			collect(target.property);
		}
	};
	walk(node, null, {
		AssignmentExpression(node, { next }) {
			if (node.operator === '=') collect(node.left);
			next();
		}
	});
	return assigned;
}
