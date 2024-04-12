// @ts-nocheck
import { WhiteSpace, Comment, Function, Ident, LeftParenthesis } from 'css-tree/tokenizer';

import { lookahead_is_range } from './lookahead_is_range.js';

const CONTAINER_QUERY_KEYWORDS = new Set(['none', 'and', 'not', 'or']);

export const name = 'ContainerQuery';
export const structure = {
	name: 'Identifier',
	children: [
		['Identifier', 'QueryFeature', 'QueryFeatureRange', 'ContainerFeatureStyle', 'WhiteSpace']
	]
};

export function parse() {
	const start = this.tokenStart;
	const children = this.createList();
	let child = null;
	let name = null;

	// Parse potential container name.
	if (this.tokenType === Ident) {
		const container_name = this.substring(this.tokenStart, this.tokenEnd);

		// Container name doesn't match a query keyword, so assign it as container name.
		if (!CONTAINER_QUERY_KEYWORDS.has(container_name.toLowerCase())) {
			name = container_name;
			this.eat(Ident);
		}
	}

	this.skipSC();

	scan: while (!this.eof) {
		switch (this.tokenType) {
			case Comment:
			case WhiteSpace:
				this.next();
				continue;

			case Ident:
				child = this.Identifier();
				break;

			case Function:
				child = this.ContainerFeatureStyle();
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
		type: 'ContainerQuery',
		loc: this.getLocation(start, this.tokenStart - 1),
		name,
		children
	};
}

export function generate(node) {
	if (typeof node.name === 'string') {
		this.token(Ident, node.name);
	}

	this.children(node);
}
