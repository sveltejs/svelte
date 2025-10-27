/** @import * as ESTree from 'estree' */
/** @import { ComponentAnalysis } from '../../types' */
import * as b from '#compiler/builders';

// TODO find a way to DRY out this and the corresponding server visitor
/**
 * @param {ESTree.Program} program
 * @param {ComponentAnalysis['instance_body']} instance_body
 * @param {ESTree.Expression} runner
 * @param {(node: ESTree.Node) => ESTree.Node} transform
 */
export function transform_body(program, instance_body, runner, transform) {
	const statements = instance_body.sync.map(transform);

	if (instance_body.declarations.length > 0) {
		statements.push(
			b.declaration(
				'var',
				instance_body.declarations.map((id) => b.declarator(id))
			)
		);
	}

	if (instance_body.async.length > 0) {
		const thunks = instance_body.async.map((s) => {
			if (s.node.type === 'VariableDeclarator') {
				const visited = /** @type {ESTree.VariableDeclaration} */ (
					transform(b.var(s.node.id, s.node.init))
				);

				if (visited.declarations.length === 1) {
					return b.thunk(
						b.assignment('=', s.node.id, visited.declarations[0].init ?? b.void0),
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
