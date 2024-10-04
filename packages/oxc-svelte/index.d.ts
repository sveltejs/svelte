import type { BindingPattern, Expression, Program, Comment } from './ast';

export declare function parse_expression_at(
	source: string,
	index: number,
	typescript: boolean
): ParseReturn<Expression>;

export declare function parse_pattern_at(
	source: string,
	index: number,
	typescript: boolean,
	allowTypeAnnotation: boolean
): ParseReturn<BindingPattern>;

export declare function parse(source: string, typescript: boolean): ParseReturn<Program>;

export interface ParseReturn<TAst> {
	ast: TAst;
	errors: Array<string>;
	comments: Array<Comment>;
}
