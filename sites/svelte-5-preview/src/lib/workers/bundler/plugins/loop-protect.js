import { parse } from 'acorn';
import { print } from 'esrap';
import { walk } from 'zimmerframe';

const TIMEOUT = 100;

const regex = /\b(for|while)\b/;

/**
 *
 * @param {string} code
 * @returns {import('estree').Statement}
 */
function parse_statement(code) {
	return /** @type {import('estree').Statement} */ (parse(code, { ecmaVersion: 'latest' }).body[0]);
}

const declaration = parse_statement(`
	const __start = Date.now();
`);

const check = parse_statement(`
	if (Date.now() > __start + ${TIMEOUT}) {
		throw new Error('Infinite loop detected');
	}
`);

/**
 *
 * @param {import('estree').Node[]} path
 * @returns {null | import('estree').FunctionExpression | import('estree').FunctionDeclaration | import('estree').ArrowFunctionExpression}
 */
export function get_current_function(path) {
	for (let i = path.length - 1; i >= 0; i--) {
		const node = path[i];
		if (
			node.type === 'FunctionDeclaration' ||
			node.type === 'FunctionExpression' ||
			node.type === 'ArrowFunctionExpression'
		) {
			return node;
		}
	}
	return null;
}

/**
 * @template {import('estree').DoWhileStatement | import('estree').ForStatement | import('estree').WhileStatement} Statement
 * @param {Statement} node
 * @param {import('zimmerframe').Context<import('estree').Node, null>} context
 * @returns {import('estree').Node | void}
 */
function loop_protect(node, context) {
	const current_function = get_current_function(context.path);

	if (current_function === null || (!current_function.async && !current_function.generator)) {
		const body = /** @type {import('estree').Statement} */ (context.visit(node.body));

		const statements = body.type === 'BlockStatement' ? [...body.body] : [body];

		/** @type {import('estree').BlockStatement} */
		const replacement = {
			type: 'BlockStatement',
			body: [
				declaration,
				{
					.../** @type {Statement} */ (context.next() ?? node),
					body: {
						type: 'BlockStatement',
						body: [...statements, check]
					}
				}
			]
		};

		return replacement;
	}

	context.next();
}

/** @type {import('@rollup/browser').Plugin} */
export default {
	name: 'loop-protect',
	transform: (code, id) => {
		// only applies to local files, not imports
		if (!id.startsWith('./')) return;

		// only applies to JS and Svelte files
		if (!id.endsWith('.js') && !id.endsWith('.svelte')) return;

		// fast path
		if (!regex.test(code)) return;

		const ast = parse(code, {
			ecmaVersion: 'latest',
			sourceType: 'module'
		});

		const transformed = walk(/** @type {import('estree').Node} */ (ast), null, {
			WhileStatement: loop_protect,
			DoWhileStatement: loop_protect,
			ForStatement: loop_protect
		});

		// nothing changed
		if (ast === transformed) return null;

		return print(transformed);
	}
};
