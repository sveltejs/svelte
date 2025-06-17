import { parse } from 'acorn';

const code = `
using bar = baz();
`;

const ast = parse(code, {
	sourceType: 'module',
	ecmaVersion: 'latest'
});

console.log(JSON.stringify(ast, null, '  '));
