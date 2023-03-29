// @ts-nocheck
import {
	WhiteSpace,
	Comment,
	Ident,
	LeftParenthesis
} from 'css-tree/tokenizer';

import { lookahead_is_range } from './lookahead_is_range';

export const name = 'MediaQuery';
export const structure = {
	children: [[
		'Identifier',
		'QueryFeature',
		'QueryFeatureRange',
		'WhiteSpace'
	]]
};

export function parse() {
	const children = this.createList();
	let child = null;

	this.skipSC();

	scan:
		while (!this.eof) {
			switch (this.tokenType) {
				case Comment:
				case WhiteSpace:
					this.next();
					continue;

				case Ident:
					child = this.Identifier();
					break;

				case LeftParenthesis:
					// Lookahead to determine if range feature.
					child = lookahead_is_range.call(this) ? this.QueryFeatureRange() : this.QueryFeature();
					break;

				default:
					break scan;
			}

			children.push(child);
		}

	if (child === null) {
		this.error('Identifier or parenthesis is expected');
	}

	return {
		type: 'MediaQuery',
		loc: this.getLocationFromList(children),
		children
	};
}

export function generate(node) {
	this.children(node);
}
