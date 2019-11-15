import * as acorn from 'acorn';

const Parser = acorn.Parser;

export const parse = (source: string) => Parser.parse(source, {
	sourceType: 'module',
	ecmaVersion: 11,
	locations: true
});

export const parse_expression_at = (source: string, index: number) => Parser.parseExpressionAt(source, index, {
	ecmaVersion: 11,
	locations: true
});