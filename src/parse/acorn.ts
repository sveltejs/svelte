import * as acorn from 'acorn';
import dynamicImport from 'acorn-dynamic-import';

const Parser = acorn.Parser.extend(dynamicImport);

export const parse = (source: string, options: any) => Parser.parse(source, {
	sourceType: 'module',
	ecmaVersion: 9,
	preserveParens: true
});

export const parseExpressionAt = (source: string, index: number, options: any) => Parser.parseExpressionAt(source, index, {
	ecmaVersion: 9,
	preserveParens: true
});