// @ts-nocheck
import { RightParenthesis } from 'css-tree/tokenizer';

const QUERY_CSS_FUNCTIONS = new Set(['calc', 'clamp', 'min', 'max']);

export const name = 'QueryCSSFunction';
export const structure = {
	name: String,
	expression: String
};

export function parse() {
	const start = this.tokenStart;

	const name = this.consumeFunctionName();

	if (!QUERY_CSS_FUNCTIONS.has(name)) {
		this.error('Unknown query single value function; expected: "calc", "clamp", "max", min"');
	}

	const body = this.Raw(this.tokenIndex, null, false);

	this.eat(RightParenthesis);

	return {
		type: 'QueryCSSFunction',
		loc: this.getLocation(start, this.tokenStart),
		name,
		expression: body.value
	};
}

export function generate(node) {
	this.token(Function, `${node.name}(`);

	this.node(node.expression);

	this.token(RightParenthesis, ')');
}
