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
		const thunks = instance_body.async.map((entry) => {
			/** @type {ESTree.Statement[]} */
			const entry_statements = [];

			for (const node of entry.nodes) {
				entry_statements.push(...transform_async_node(node, transform));
			}

			if (entry_statements.length === 0) {
				// Keep indices stable for async sequencing while avoiding array holes in run([...]).
				return b.thunk(b.void0, false);
			}

			if (entry_statements.length === 1 && entry_statements[0].type === 'ExpressionStatement') {
				return b.thunk(entry_statements[0].expression, entry.has_await);
			}

			return b.thunk(b.block(entry_statements), entry.has_await);
		});

		// TODO get the `$$promises` ID from scope
		statements.push(b.var('$$promises', b.call(runner, b.array(thunks))));
	}

	return statements;
}

/**
 * @param {ESTree.Statement | ESTree.VariableDeclarator} node
 * @param {(node: ESTree.Node) => ESTree.Node} transform
 * @returns {ESTree.Statement[]}
 */
function transform_async_node(node, transform) {
	if (node.type === 'VariableDeclarator') {
		const visited = /** @type {ESTree.VariableDeclaration | ESTree.EmptyStatement} */ (
			transform(b.var(node.id, node.init))
		);

		return visited.type === 'VariableDeclaration'
			? visited.declarations.map((node) => {
					if (
						node.id.type === 'Identifier' &&
						(node.id.name.startsWith('$$d') || node.id.name.startsWith('$$array'))
					) {
						// This intermediate declaration is created in VariableDeclaration.js;
						// subsequent statements may depend on it.
						return b.var(node.id, node.init);
					}

					return b.stmt(b.assignment('=', node.id, node.init ?? b.void0));
				})
			: [];
	}

	if (node.type === 'ClassDeclaration') {
		return [
			b.stmt(
				b.assignment(
					'=',
					node.id,
					/** @type {ESTree.ClassExpression} */ ({ ...node, type: 'ClassExpression' })
				)
			)
		];
	}

	if (node.type === 'ExpressionStatement') {
		// The expression may be a $inspect call, which will be transformed into an empty statement.
		const expression = /** @type {ESTree.Expression | ESTree.EmptyStatement} */ (
			transform(node.expression)
		);

		if (expression.type === 'EmptyStatement') {
			return [];
		}

		if (expression.type === 'AwaitExpression') {
			return [b.stmt(expression)];
		}

		return [b.stmt(b.unary('void', expression))];
	}

	const statement = /** @type {ESTree.Statement | ESTree.EmptyStatement} */ (transform(node));
	return statement.type === 'EmptyStatement' ? [] : [statement];
}
