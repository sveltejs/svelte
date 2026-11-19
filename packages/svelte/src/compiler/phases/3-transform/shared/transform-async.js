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
 * `$derived(await ...)` declarations that don't depend on the entries before them are created as early
 * as possible (see `hoisted_to`), so that they run in parallel, but are still awaited in their own entry:
 * ```js
 * let a = $derived(await foo());
 * let doubled = $derived(a * 2);
 * let b = $derived(await bar());
 * ```
 * becomes:
 * ```js
 * var a, doubled, b, b_promise;
 * var $$promises = $.run([
 *   async () => {
 *     var a_promise = $.async_derived(() => foo());
 *     b_promise = $.async_derived(() => bar(), void 0, void 0, 2);
 *     a = await a_promise;
 *   },
 *   () => doubled = $.derived(() => $.get(a) * 2),
 *   async () => b = await b_promise
 * ]);
 * ```
 * On the client, the hoisted `$.async_derived(...)` call is told which entry awaits it (`2`), so that it
 * behaves as if it had been created there (see `Runner#deliver`).
 *
 * @param {ComponentAnalysis['instance_body']} instance_body
 * @param {ESTree.Expression} runner
 * @param {(node: ESTree.Node) => ESTree.Node} transform
 * @param {Scope} scope
 * @param {boolean} [pass_step] whether to pass the index of the awaiting entry to hoisted `$.async_derived(...)` calls
 * @returns {Array<ESTree.Statement | ESTree.VariableDeclaration>}
 */
export function transform_body(instance_body, runner, transform, scope, pass_step = false) {
	// Any sync statements before the first await expression
	const statements = instance_body.sync.map(
		(node) => /** @type {ESTree.Statement | ESTree.VariableDeclaration} */ (transform(node))
	);

	/** @type {ESTree.Identifier[]} */
	const declarations = [...instance_body.declarations];

	/** @type {ESTree.Statement[][]} */
	const bodies = instance_body.async.map((entry) =>
		entry.nodes.flatMap((node) => transform_async_node(node, transform))
	);

	/**
	 * Creations of hoisted async deriveds, by the index of the entry at whose start they happen
	 * @type {Map<number, ESTree.Statement[]>}
	 */
	const hoisted = new Map();

	for (const [index, entry] of instance_body.async.entries()) {
		if (entry.hoisted_to === undefined) continue;

		const [first, ...rest] = bodies[index];
		const awaited = first && get_awaited(first);

		// should never happen, but if it does, awaiting in place is still correct, just not parallel
		if (!awaited) continue;

		const declarator = /** @type {ESTree.VariableDeclarator} */ (entry.nodes[0]);
		const id = b.id(scope.generate(get_promise_name(declarator)));
		declarations.push(id);

		let call = awaited.argument;

		if (pass_step && call.type === 'CallExpression') {
			// `$.async_derived(fn, label, location, step)`
			const args = [...call.arguments];
			while (args.length < 3) args.push(b.void0);
			call = { ...call, arguments: [...args, b.literal(index)] };
		}

		let creations = hoisted.get(entry.hoisted_to);
		if (!creations) hoisted.set(entry.hoisted_to, (creations = []));
		creations.push(b.stmt(b.assignment('=', id, call)));

		bodies[index] = [replace_awaited(first, id), ...rest];
	}

	for (const [index, creations] of hoisted) {
		const entry = instance_body.async[index];
		const [first, ...rest] = bodies[index];
		const awaited = entry.hoisted_to === undefined && first && get_awaited(first);

		if (awaited) {
			// this entry is an async derived itself, which precedes the hoisted ones
			// in source order — create it first, so that they're all created in order
			const declarator = /** @type {ESTree.VariableDeclarator} */ (entry.nodes[0]);
			const id = b.id(scope.generate(get_promise_name(declarator)));

			bodies[index] = [
				b.var(id, awaited.argument),
				...creations,
				replace_awaited(first, id),
				...rest
			];
		} else {
			bodies[index] = [...creations, ...bodies[index]];
		}
	}

	// Declarations for the await expressions (they will assign to them; need to be hoisted to be available in whole instance scope)
	if (declarations.length > 0) {
		statements.push(
			b.declaration(
				'var',
				declarations.map((id) => b.declarator(id))
			)
		);
	}

	// Thunks for the await expressions
	if (instance_body.async.length > 0) {
		const thunks = instance_body.async.map((entry, index) => {
			const entry_statements = bodies[index];

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
 * @param {ESTree.VariableDeclarator} declarator
 */
function get_promise_name(declarator) {
	return declarator.id.type === 'Identifier' ? `${declarator.id.name}_promise` : 'promise';
}

/**
 * Returns the `await` expression of the transformed async derived, which is
 * `x = await $.async_derived(...)`, or `var $$d = await $.async_derived(...)` for destructured declarations
 * @param {ESTree.Statement} statement
 */
function get_awaited(statement) {
	const expression =
		statement.type === 'ExpressionStatement' && statement.expression.type === 'AssignmentExpression'
			? statement.expression.right
			: statement.type === 'VariableDeclaration' && statement.declarations.length === 1
				? statement.declarations[0].init
				: null;

	return expression?.type === 'AwaitExpression' ? expression : null;
}

/**
 * Replaces the `await` expression of the transformed async derived with `await id`
 * @param {ESTree.Statement} statement
 * @param {ESTree.Identifier} id
 * @returns {ESTree.Statement}
 */
function replace_awaited(statement, id) {
	if (statement.type === 'ExpressionStatement') {
		const expression = /** @type {ESTree.AssignmentExpression} */ (statement.expression);
		return b.stmt(b.assignment('=', expression.left, b.await(id)));
	}

	const declaration = /** @type {ESTree.VariableDeclaration} */ (statement);
	return b.var(declaration.declarations[0].id, b.await(id));
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
