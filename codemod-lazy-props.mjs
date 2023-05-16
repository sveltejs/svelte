import { existsSync, fstat, readFileSync, readdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'acorn';
import { walk } from 'estree-walker';
import { inspect } from 'util';

import { p, print } from 'code-red';

const samples = resolve(`vitest/runtime/runtime/samples`);

for (const dir of readdirSync(samples)) {
	const cwd = resolve(samples, dir);
	const file = resolve(cwd, '_config.js');

	if (!existsSync(file)) continue;
	const contents = readFileSync(file, 'utf-8');
	const ast = parse(contents, {
		sourceType: 'module',
		ecmaVersion: 'latest',
		sourceFile: file,
		ranges: true
	});

	walk(ast, {
		enter(node) {
			if (
				node.type === 'ExportDefaultDeclaration' &&
				node.declaration.type === 'ObjectExpression'
			) {
				this.skip();

				const props = node.declaration.properties.find((prop) => prop.key.name === 'props');
				if (!props) return;
				const { range } = props;

				const [start, end] = range;

				const code =
					contents.slice(0, start) +
					print(p`get ${props.key}() { return ${props.value}}`).code +
					contents.slice(end);
                
                writeFileSync(file, code);
			}
		}
	});
}
