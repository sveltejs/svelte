import * as acorn from 'acorn';
import dynamicImport from 'acorn-dynamic-import';

const Parser = acorn.Parser.extend(dynamicImport);

export const parse = (source: string) => Parser.parse(source, {
	sourceType: 'module',
	ecmaVersion: 9,
	preserveParens: true
});

export const parse_expression_at = (source: string, index: number) => Parser.parseExpressionAt(source, index, {
	ecmaVersion: 9,
	preserveParens: true
});