import { isIdentifierStart, isIdentifierChar } from 'acorn';
import full_char_code_at from './full_char_code_at';

export const reserved = new Set([
	'arguments',
	'await',
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'enum',
	'eval',
	'export',
	'extends',
	'false',
	'finally',
	'for',
	'function',
	'if',
	'implements',
	'import',
	'in',
	'instanceof',
	'interface',
	'let',
	'new',
	'null',
	'package',
	'private',
	'protected',
	'public',
	'return',
	'static',
	'super',
	'switch',
	'this',
	'throw',
	'true',
	'try',
	'typeof',
	'var',
	'void',
	'while',
	'with',
	'yield'
]);

export function is_valid(str: string): boolean {
	let i = 0;

	while (i < str.length) {
		const code = full_char_code_at(str, i);
		if (!(i === 0 ? isIdentifierStart : isIdentifierChar)(code, true)) return false;

		i += code <= 0xffff ? 1 : 2;
	}

	return true;
}

export function sanitize(name: string) {
	return name
		.replace(/[^a-zA-Z0-9_]+/g, '_')
		.replace(/^_/, '')
		.replace(/_$/, '')
		.replace(/^[0-9]/, '_$&');
}
