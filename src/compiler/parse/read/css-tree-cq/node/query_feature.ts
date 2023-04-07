// @ts-nocheck
import {
	Ident,
	Number,
	Dimension,
	Function,
	LeftParenthesis,
	RightParenthesis,
	Colon,
	Delim
} from 'css-tree/tokenizer';

export const name = 'QueryFeature';
export const structure = {
	name: String,
	value: ['Identifier', 'Number', 'Dimension', 'QueryCSSFunction', 'Ratio', null]
};

export function parse() {
	const start = this.tokenStart;
	let value = null;

	this.eat(LeftParenthesis);
	this.skipSC();

	const name = this.consume(Ident);
	this.skipSC();

	if (this.tokenType !== RightParenthesis) {
		this.eat(Colon);
		this.skipSC();

		switch (this.tokenType) {
			case Number:
				if (this.lookupNonWSType(1) === Delim) {
					value = this.Ratio();
				} else {
					value = this.Number();
				}
				break;

			case Dimension:
				value = this.Dimension();
				break;

			case Function:
				value = this.QueryCSSFunction();
				break;

			case Ident:
				value = this.Identifier();
				break;

			default:
				this.error('Number, dimension, ratio, function, or identifier is expected');
				break;
		}

		this.skipSC();
	}

	this.eat(RightParenthesis);

	return {
		type: 'QueryFeature',
		loc: this.getLocation(start, this.tokenStart),
		name,
		value
	};
}

export function generate(node) {
	this.token(LeftParenthesis, '(');
	this.token(Ident, node.name);

	if (node.value !== null) {
		this.token(Colon, ':');
		this.node(node.value);
	}

	this.token(RightParenthesis, ')');
}
