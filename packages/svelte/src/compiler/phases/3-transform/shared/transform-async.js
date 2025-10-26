/** @import * as ESTree from 'estree' */
/** @import { AwaitedStatement } from '../../types' */
import * as b from '#compiler/builders';

// TODO find a way to DRY out this and the corresponding server visitor
/**
 * @param {ESTree.Program} program
 * @param {Map<ESTree.Node, AwaitedStatement>} awaited_statements
 * @param {ESTree.Expression} runner
 * @param {(node: ESTree.Node) => ESTree.Node} transform
 * @param {(node: ESTree.Statement | ESTree.ModuleDeclaration) => void} hoist
 */
export function transform_body(program, awaited_statements, runner, transform, hoist) {
	/** @type {ESTree.Statement[]} */
	const out = [];

	/** @type {AwaitedStatement[]} */
	const statements = [];

	/** @type {AwaitedStatement[]} */
	const deriveds = [];

	let awaited = false;

	/**
	 * @param {ESTree.Statement | ESTree.VariableDeclarator | ESTree.ClassDeclaration | ESTree.FunctionDeclaration} node
	 */
	const push = (node) => {
		const statement = awaited_statements.get(node);

		awaited ||= !!statement?.has_await;

		if (!awaited || !statement || node.type === 'FunctionDeclaration') {
			if (node.type === 'VariableDeclarator') {
				out.push(/** @type {ESTree.VariableDeclaration} */ (transform(b.var(node.id, node.init))));
			} else {
				out.push(/** @type {ESTree.Statement} */ (transform(node)));
			}

			return;
		}

		// TODO put deriveds into a separate array, and group them immediately
		// after their latest dependency. for now, to avoid having to figure
		// out the intricacies of dependency tracking, just let 'em waterfall
		// if (node.type === 'VariableDeclarator') {
		// 	const rune = get_rune(node.init, context.state.scope);

		// 	if (rune === '$derived' || rune === '$derived.by') {
		// 		deriveds.push(statement);
		// 		return;
		// 	}
		// }

		statements.push(statement);
	};

	for (let node of program.body) {
		if (node.type === 'ImportDeclaration') {
			// TODO we can get rid of the visitor
			hoist(node);
			continue;
		}

		if (node.type === 'ExportDefaultDeclaration' || node.type === 'ExportAllDeclaration') {
			// this can't happen, but it's useful for TypeScript to understand that
			continue;
		}

		if (node.type === 'ExportNamedDeclaration') {
			if (node.declaration) {
				// TODO ditto — no visitor needed
				node = node.declaration;
			} else {
				continue;
			}
		}

		if (node.type === 'VariableDeclaration') {
			if (
				!awaited &&
				node.declarations.every((declarator) => !awaited_statements.get(declarator)?.has_await)
			) {
				out.push(/** @type {ESTree.VariableDeclaration} */ (transform(node)));
			} else {
				for (const declarator of node.declarations) {
					push(declarator);
				}
			}
		} else {
			push(node);
		}
	}

	for (const derived of deriveds) {
		// find the earliest point we can insert this derived
		let index = -1;

		for (const binding of derived.reads) {
			index = Math.max(
				index,
				statements.findIndex((s) => s.declarations.includes(binding))
			);
		}

		if (index === -1 && !derived.has_await) {
			const node = /** @type {ESTree.VariableDeclarator} */ (derived.node);
			out.push(/** @type {ESTree.VariableDeclaration} */ (transform(b.var(node.id, node.init))));
		} else {
			// TODO combine deriveds with Promise.all where necessary
			statements.splice(index + 1, 0, derived);
		}
	}

	var promises = b.id('$$promises'); // TODO if we use this technique for fragments, need to deconflict

	if (statements.length > 0) {
		var declarations = statements.map((s) => s.declarations).flat();

		if (declarations.length > 0) {
			out.push(
				b.declaration(
					'var',
					declarations.map((d) => b.declarator(d.node))
				)
			);
		}

		const thunks = statements.map((s) => {
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

			if (s.node.type === 'FunctionDeclaration') {
				return b.thunk(
					b.assignment(
						'=',
						s.node.id,
						/** @type {ESTree.FunctionExpression} */ ({ ...s.node, type: 'FunctionExpression' })
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

		out.push(b.var(promises, b.call(runner, b.array(thunks))));

		for (let i = 0; i < statements.length; i += 1) {
			const s = statements[i];

			var blocker = b.member(promises, b.literal(i), true);

			for (const binding of s.declarations) {
				binding.blocker = blocker;
			}

			for (const binding of s.writes) {
				// if a statement writes to a binding, any reads of that
				// binding must wait for the statement
				binding.blocker = blocker;
			}
		}
	}

	return out;
}
