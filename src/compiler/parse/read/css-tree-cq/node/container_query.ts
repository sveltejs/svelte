// @ts-nocheck
import {
	EOF,
	WhiteSpace,
	Comment,
	Delim,
	Function,
	Ident,
	LeftParenthesis,
	RightParenthesis,
	LeftCurlyBracket,
	Colon
} from 'css-tree/tokenizer';

const CONTAINER_QUERY_KEYWORDS = new Set(['none', 'and', 'not', 'or']);

export const name = 'ContainerQuery';
export const structure = {
	name: 'Identifier',
	children: [[
		'Identifier',
		'ContainerFeature',
		'ContainerFeatureRange',
		'ContainerFeatureStyle',
		'WhiteSpace'
	]]
};

/**
 * Looks ahead to determine if query feature is a range query. This involves locating at least one delimiter and no
 * colon tokens.
 *
 * @returns {boolean} Is potential range query.
 */
function lookahead_is_range() {
	let type;
	let offset = 0;

	let count = 0;
	let delim_found = false;
	let no_colon = true;

	// A range query has maximum 5 tokens when formatted as 'mf-range' /
	// '<mf-value> <mf-lt> <mf-name> <mf-lt> <mf-value>'. So only look ahead maximum of 6 non-whitespace tokens.
	do {
		type = this.lookupNonWSType(offset++);
		if (type !== WhiteSpace) {
			count++;
		}
		if (type === Delim) {
			delim_found = true;
		}
		if (type === Colon) {
			no_colon = false;
		}
		if (type === LeftCurlyBracket || type === RightParenthesis) {
			break;
		}
	} while (type !== EOF && count <= 6);

	return delim_found && no_colon;
}

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
			this.eatIdent(container_name);
		}
	}

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

				case Function:
					child = this.ContainerFeatureStyle();
					break;

				case LeftParenthesis:
					// Lookahead to determine if range feature.
					child = lookahead_is_range.call(this) ? this.ContainerFeatureRange() : this.ContainerFeature();
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

