import { Node } from 'acorn';
import * as code_red from 'code-red';

export const parse = (source: string): Node => code_red.parse(source, {
	sourceType: 'module',
	ecmaVersion: 11,
	locations: true
});

export const parse_expression_at = (source: string, index: number): Node => code_red.parseExpressionAt(source, index, {
	ecmaVersion: 11,
	locations: true
});