import { isIdentifierStart, isIdentifierChar } from 'acorn';
import full_char_code_at from './full_char_code_at';

export const globals = new Set([
	'alert',
	'Array',
	'Boolean',
	'confirm',
	'console',
	'Date',
	'decodeURI',
	'decodeURIComponent',
	'document',
	'encodeURI',
	'encodeURIComponent',
	'Error',
	'EvalError',
	'history',
	'Infinity',
	'InternalError',
	'Intl',
	'isFinite',
	'isNaN',
	'JSON',
	'localStorage',
	'Map',
	'Math',
	'NaN',
	'navigator',
	'Number',
	'Object',
	'parseFloat',
	'parseInt',
	'process',
	'Promise',
	'prompt',
	'RangeError',
	'ReferenceError',
	'RegExp',
	'sessionStorage',
	'Set',
	'String',
	'SyntaxError',
	'TypeError',
	'undefined',
	'URIError',
	'window'
]);

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
	'yield',
]);

const void_element_names = /^(?:area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/;

export function is_void(name: string) {
	return void_element_names.test(name) || name.toLowerCase() === '!doctype';
}

function is_valid(str: string): boolean {
	let i = 0;

	while (i < str.length) {
		const code = full_char_code_at(str, i);
		if (!(i === 0 ? isIdentifierStart : isIdentifierChar)(code, true)) return false;

		i += code <= 0xffff ? 1 : 2;
	}

	return true;
}

export function quote_name_if_necessary(name: string) {
	if (!is_valid(name)) return `"${name}"`;
	return name;
}

export function quote_prop_if_necessary(name: string) {
	if (!is_valid(name)) return `["${name}"]`;
	return `.${name}`;
}

export function sanitize(name: string) {
	return name
		.replace(/[^a-zA-Z0-9_]+/g, '_')
		.replace(/^_/, '')
		.replace(/_$/, '')
		.replace(/^[0-9]/, '_$&');
}
