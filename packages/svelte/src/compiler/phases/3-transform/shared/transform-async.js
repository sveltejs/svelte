/** @import * as ESTree from 'estree' */
/** @import { ComponentAnalysis } from '../../types' */
import * as b from '#compiler/builders';

/**
 * Transforms the body of the instance script in such a way that await expressions are made non-blocking as much as possible.
 *
 * Example Transformation:
 * ```js
 * let x = 1;
 * let data = await fetch('/api');
 * let y = data.value;
 * ```
 * becomes:
 * ```js
 * let x = 1;
 * var data, y;
 * var $$promises = $.run([
 *   () => data = await fetch('/api'),
 *   () => y = data.value
 * ]);
 * ```
 * where `$$promises` is an array of promises that are resolved in the order they are declared,
 * and which expressions in the template can await on like `await $$promises[0]` which means they
 * wouldn't have to wait for e.g. `$$promises[1]` to resolve.
 *
 * @param {ComponentAnalysis['instance_body']} instance_body
 * @param {ESTree.Expression} runner
 * @param {(node: ESTree.Node) => ESTree.Node} transform
 * @returns {Array<ESTree.Statement | ESTree.VariableDeclaration>}
 */
export function transform_body(instance_body, runner, transform) {
	// Any sync statements before the first await expression
	const statements = instance_body.sync.map(
		(node) => /** @type {ESTree.Statement | ESTree.VariableDeclaration} */ (transform(node))
	);

	// Declarations for the await expressions (they will assign to them; need to be hoisted to be available in whole instance scope)
	if (instance_body.declarations.length > 0) {
		statements.push(
			b.declaration(
				'var',
				instance_body.declarations.map((id) => b.declarator(id))
			)
		);
	}

	// Thunks for the await expressions
	if (instance_body.async.length > 0) {
		const thunks = instance_body.async.map((s) => {
			if (s.node.type === 'VariableDeclarator') {
				const visited = /** @type {ESTree.VariableDeclaration} */ (
					transform(b.var(s.node.id, s.node.init))
				);

				const statements = visited.declarations.map((node) => {
					if (
						node.id.type === 'Identifier' &&
						(node.id.name.startsWith('$$d') || node.id.name.startsWith('$$array'))
					) {
						// this is an intermediate declaration created in VariableDeclaration.js;
						// subsequent statements depend on it
						return b.var(node.id, node.init);
					}

					return b.stmt(b.assignment('=', node.id, node.init ?? b.void0));
				});

				if (statements.length === 1) {
					const statement = /** @type {ESTree.ExpressionStatement} */ (statements[0]);
					return b.thunk(statement.expression, s.has_await);
				}

				return b.thunk(b.block(statements), s.has_await);
			}

			if (s.node.type === 'ClassDeclaration') {
				return b.thunk(
					b.assignment(
						'=',
						s.node.id,
						/** @type {ESTree.ClassExpression} */ ({ ...s.node, type: 'ClassExpression' })
					),
					s.has_await
				);
			}

			if (s.node.type === 'ExpressionStatement') {
				// the expression may be a $inspect call, which will be transformed into an empty statement
				const expression = /** @type {ESTree.Expression | ESTree.EmptyStatement} */ (
					transform(s.node.expression)
				);

				if (expression.type === 'EmptyStatement') {
					return null;
				}

				return expression.type === 'AwaitExpression'
					? b.thunk(expression, true)
					: b.thunk(b.unary('void', expression), s.has_await);
			}

			return b.thunk(b.block([/** @type {ESTree.Statement} */ (transform(s.node))]), s.has_await);
		});

		// TODO get the `$$promises` ID from scope
		statements.push(b.var('$$promises', b.call(runner, b.array(thunks))));
	}

	return statements;
}
