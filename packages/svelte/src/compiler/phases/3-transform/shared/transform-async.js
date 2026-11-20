/** @import * as ESTree from 'estree' */
/** @import { ComponentAnalysis } from '../../types' */
/** @import { Scope } from '../../scope' */
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
 * Consecutive `$derived(await ...)` declarations that are independent of each other are grouped
 * into a single thunk, in which all of them are created before the first one is awaited, so that they run in parallel:
 * ```js
 * let a = $derived(await foo());
 * let b = $derived(await bar());
 * ```
 * becomes:
 * ```js
 * var a, b;
 * var $$promises = $.run([
 *   async () => {
 *     var a_promise = $.async_derived(() => foo());
 *     var b_promise = $.async_derived(() => bar());
 *     a = await a_promise;
 *     b = await b_promise;
 *   }
 * ]);
 * ```
 *
 * @param {ComponentAnalysis['instance_body']} instance_body
 * @param {ESTree.Expression} runner
 * @param {(node: ESTree.Node) => ESTree.Node} transform
 * @param {Scope} scope
 * @returns {Array<ESTree.Statement | ESTree.VariableDeclaration>}
 */
export function transform_body(instance_body, runner, transform, scope) {
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
			const entry_statements = entry.parallel
				? transform_parallel_deriveds(
						/** @type {ESTree.VariableDeclarator[]} */ (entry.nodes),
						transform,
						scope
					)
				: entry.nodes.flatMap((node) => transform_async_node(node, transform));

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
 * Transforms a group of independent `$derived(await ...)` declarators such that all async deriveds are
 * created up front, and only then awaited one after the other (in source order)
 * @param {ESTree.VariableDeclarator[]} declarators
 * @param {(node: ESTree.Node) => ESTree.Node} transform
 * @param {Scope} scope
 * @returns {ESTree.Statement[]}
 */
function transform_parallel_deriveds(declarators, transform, scope) {
	/** @type {ESTree.Statement[]} */
	const create = [];

	/** @type {ESTree.Statement[]} */
	const assign = [];

	for (const declarator of declarators) {
		const [first, ...rest] = transform_async_node(declarator, transform);
		if (!first) continue;

		// `x = await $.async_derived(...)`, or `var $$d = await $.async_derived(...)` for destructured declarations
		const awaited =
			first.type === 'ExpressionStatement' && first.expression.type === 'AssignmentExpression'
				? first.expression.right
				: first.type === 'VariableDeclaration' && first.declarations.length === 1
					? first.declarations[0].init
					: null;

		if (awaited?.type !== 'AwaitExpression') {
			// should never happen, but if it does, awaiting in place is still correct, just not parallel
			assign.push(first, ...rest);
			continue;
		}

		const id = b.id(
			scope.generate(
				declarator.id.type === 'Identifier' ? `${declarator.id.name}_promise` : 'promise'
			)
		);

		create.push(b.var(id, awaited.argument));

		assign.push(
			first.type === 'ExpressionStatement'
				? b.stmt(
						b.assignment(
							'=',
							/** @type {ESTree.AssignmentExpression} */ (first.expression).left,
							b.await(id)
						)
					)
				: b.var(/** @type {ESTree.VariableDeclaration} */ (first).declarations[0].id, b.await(id)),
			...rest
		);
	}

	return [...create, ...assign];
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
