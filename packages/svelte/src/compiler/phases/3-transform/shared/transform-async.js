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

	// Declarations for the await expressions (they will asign to them; need to be hoisted to be available in whole instance scope)
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

				if (visited.declarations.length === 1) {
					return b.thunk(
						b.assignment('=', visited.declarations[0].id, visited.declarations[0].init ?? b.void0),
						s.has_await
					);
				}

				// if we have multiple declarations, it indicates destructuring
				return b.thunk(
					b.block([
						b.var(visited.declarations[0].id, visited.declarations[0].init),
						...visited.declarations
							.slice(1)
							.map((d) => b.stmt(b.assignment('=', d.id, d.init ?? b.void0)))
					]),
					s.has_await
				);
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
				const expression = /** @type {ESTree.Expression} */ (transform(s.node.expression));

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
