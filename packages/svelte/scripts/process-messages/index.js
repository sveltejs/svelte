// @ts-check
import fs from 'node:fs';
import * as acorn from 'acorn';
import { walk } from 'zimmerframe';
import * as esrap from 'esrap';

/** @type {Record<string, Record<string, { messages: string[], details: string | null }>>} */
const messages = {};
const seen = new Set();

for (const category of fs.readdirSync('messages')) {
	messages[category] = {};

	for (const file of fs.readdirSync(`messages/${category}`)) {
		if (!file.endsWith('.md')) continue;

		const markdown = fs
			.readFileSync(`messages/${category}/${file}`, 'utf-8')
			.replace(/\r\n/g, '\n');

		const sorted = [];

		for (const match of markdown.matchAll(/## ([\w]+)\n\n([^]+?)(?=$|\n\n## )/g)) {
			const [_, code, text] = match;

			if (seen.has(code)) {
				throw new Error(`Duplicate message code ${category}/${code}`);
			}

			sorted.push({ code, _ });

			const sections = text.trim().split('\n\n');
			let details = null;
			if (!sections[sections.length - 1].startsWith('> ')) {
				details = /** @type {string} */ (sections.pop());
			}

			if (sections.length === 0) {
				throw new Error('No message text');
			}

			seen.add(code);
			messages[category][code] = {
				messages: sections.map((section) => section.replace(/^> /gm, '')),
				details
			};
		}

		sorted.sort((a, b) => (a.code < b.code ? -1 : 1));
		fs.writeFileSync(
			`messages/${category}/${file}`,
			sorted.map((x) => x._.trim()).join('\n\n') + '\n'
		);
	}
}

function transform(name, dest) {
	const source = fs
		.readFileSync(new URL(`./templates/${name}.js`, import.meta.url), 'utf-8')
		.replace(/\r\n/g, '\n');

	const comments = [];

	let ast = acorn.parse(source, {
		ecmaVersion: 'latest',
		sourceType: 'module',
		onComment: (block, value, start, end) => {
			if (block && /\n/.test(value)) {
				let a = start;
				while (a > 0 && source[a - 1] !== '\n') a -= 1;

				let b = a;
				while (/[ \t]/.test(source[b])) b += 1;

				const indentation = source.slice(a, b);
				value = value.replace(new RegExp(`^${indentation}`, 'gm'), '');
			}

			comments.push({ type: block ? 'Block' : 'Line', value, start, end });
		}
	});

	ast = walk(ast, null, {
		_(node, { next }) {
			let comment;

			while (comments[0] && comments[0].start < node.start) {
				comment = comments.shift();
				// @ts-expect-error
				(node.leadingComments ||= []).push(comment);
			}

			next();

			if (comments[0]) {
				const slice = source.slice(node.end, comments[0].start);

				if (/^[,) \t]*$/.test(slice)) {
					// @ts-expect-error
					node.trailingComments = [comments.shift()];
				}
			}
		},
		// @ts-expect-error
		Identifier(node, context) {
			if (node.name === 'CODES') {
				return {
					type: 'ArrayExpression',
					elements: Object.keys(messages[name]).map((code) => ({
						type: 'Literal',
						value: code
					}))
				};
			}
		}
	});

	const category = messages[name];

	// find the `export function CODE` node
	const index = ast.body.findIndex((node) => {
		if (
			node.type === 'ExportNamedDeclaration' &&
			node.declaration &&
			node.declaration.type === 'FunctionDeclaration'
		) {
			return node.declaration.id.name === 'CODE';
		}
	});

	if (index === -1) throw new Error(`missing export function CODE in ${name}.js`);

	const template_node = ast.body[index];
	ast.body.splice(index, 1);

	for (const code in category) {
		const { messages } = category[code];
		const vars = [];

		const group = messages.map((text, i) => {
			for (const match of text.matchAll(/%(\w+)%/g)) {
				const name = match[1];
				if (!vars.includes(name)) {
					vars.push(match[1]);
				}
			}

			return {
				text,
				vars: vars.slice()
			};
		});

		/** @type {import('estree').Expression} */
		let message = { type: 'Literal', value: '' };
		let prev_vars;

		for (let i = 0; i < group.length; i += 1) {
			const { text, vars } = group[i];

			if (vars.length === 0) {
				message = {
					type: 'Literal',
					value: text
				};
				prev_vars = vars;
				continue;
			}

			const parts = text.split(/(%\w+%)/);

			/** @type {import('estree').Expression[]} */
			const expressions = [];

			/** @type {import('estree').TemplateElement[]} */
			const quasis = [];

			for (let i = 0; i < parts.length; i += 1) {
				const part = parts[i];
				if (i % 2 === 0) {
					const str = part.replace(/(`|\${)/g, '\\$1');
					quasis.push({
						type: 'TemplateElement',
						value: { raw: str, cooked: str },
						tail: i === parts.length - 1
					});
				} else {
					expressions.push({
						type: 'Identifier',
						name: part.slice(1, -1)
					});
				}
			}

			/** @type {import('estree').Expression} */
			const expression = {
				type: 'TemplateLiteral',
				expressions,
				quasis
			};

			if (prev_vars) {
				if (vars.length === prev_vars.length) {
					throw new Error('Message overloads must have new parameters');
				}

				message = {
					type: 'ConditionalExpression',
					test: {
						type: 'Identifier',
						name: vars[prev_vars.length]
					},
					consequent: expression,
					alternate: message
				};
			} else {
				message = expression;
			}

			prev_vars = vars;
		}

		const clone = walk(/** @type {import('estree').Node} */ (template_node), null, {
			// @ts-expect-error Block is a block comment, which is not recognised
			Block(node, context) {
				if (!node.value.includes('PARAMETER')) return;

				const value = node.value
					.split('\n')
					.map((line) => {
						if (line === ' * MESSAGE') {
							return messages[messages.length - 1]
								.split('\n')
								.map((line) => ` * ${line}`)
								.join('\n');
						}

						if (line.includes('PARAMETER')) {
							return vars
								.map((name, i) => {
									const optional = i >= group[0].vars.length;

									return optional
										? ` * @param {string | undefined | null} [${name}]`
										: ` * @param {string} ${name}`;
								})
								.join('\n');
						}

						return line;
					})
					.filter((x) => x !== '')
					.join('\n');

				if (value !== node.value) {
					return { ...node, value };
				}
			},
			FunctionDeclaration(node, context) {
				if (node.id.name !== 'CODE') return;

				const params = [];

				for (const param of node.params) {
					if (param.type === 'Identifier' && param.name === 'PARAMETER') {
						params.push(...vars.map((name) => ({ type: 'Identifier', name })));
					} else {
						params.push(param);
					}
				}

				return /** @type {import('estree').FunctionDeclaration} */ ({
					.../** @type {import('estree').FunctionDeclaration} */ (context.next()),
					params,
					id: {
						...node.id,
						name: code
					}
				});
			},
			Literal(node) {
				if (node.value === 'CODE') {
					return {
						type: 'Literal',
						value: code
					};
				}
			},
			Identifier(node) {
				if (node.name !== 'MESSAGE') return;
				return message;
			}
		});

		// @ts-expect-error
		ast.body.push(clone);
	}

	// @ts-expect-error
	const module = esrap.print(ast);

	fs.writeFileSync(
		dest,
		`/* This file is generated by scripts/process-messages/index.js. Do not edit! */\n\n` +
			module.code,
		'utf-8'
	);
}

transform('compile-errors', 'src/compiler/errors.js');
transform('compile-warnings', 'src/compiler/warnings.js');

transform('client-warnings', 'src/internal/client/warnings.js');
transform('client-errors', 'src/internal/client/errors.js');
transform('server-errors', 'src/internal/server/errors.js');
transform('shared-errors', 'src/internal/shared/errors.js');
transform('shared-warnings', 'src/internal/shared/warnings.js');
