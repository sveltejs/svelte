import * as acorn from 'acorn';

const Parser = acorn.Parser;

export const parse = (source: string) => Parser.parse(source, {
	sourceType: 'module',
	// @ts-ignore TODO pending release of fixed types
	ecmaVersion: 11,
	locations: true
});

export const parse_expression_at = (source: string, index: number) => Parser.parseExpressionAt(source, index, {
	// @ts-ignore TODO pending release of fixed types
	ecmaVersion: 11,
	locations: true
});