import { parse } from 'acorn';
import { walk } from 'zimmerframe';

const require = `function require(id) {
	if (id in __repl_lookup) return __repl_lookup[id];
	throw new Error(\`Cannot require modules dynamically (\${id})\`);
}`;

/** @type {import('@rollup/browser').Plugin} */
export default {
	name: 'commonjs',

	transform: (code, id) => {
		if (!/\b(require|module|exports)\b/.test(code)) return;

		try {
			const ast = parse(code, {
				ecmaVersion: 'latest'
			});

			/** @type {string[]}  */
			const requires = [];

			walk(/** @type {import('estree').Node} */ (ast), null, {
				CallExpression: (node) => {
					if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
						if (node.arguments.length !== 1) return;
						const arg = node.arguments[0];
						if (arg.type !== 'Literal' || typeof arg.value !== 'string') return;

						requires.push(arg.value);
					}
				}
			});

			const imports = requires.map((id, i) => `import __repl_${i} from '${id}';`).join('\n');
			const lookup = `const __repl_lookup = { ${requires
				.map((id, i) => `'${id}': __repl_${i}`)
				.join(', ')} };`;

			const transformed = [
				imports,
				lookup,
				require,
				`const exports = {}; const module = { exports };`,
				code,
				`export default module.exports;`
			].join('\n\n');

			return {
				code: transformed,
				map: null
			};
		} catch (err) {
			return null;
		}
	}
};
