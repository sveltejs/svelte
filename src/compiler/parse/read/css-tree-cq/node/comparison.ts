// @ts-nocheck
import { Delim } from 'css-tree/tokenizer';

export const name = 'Comparison';
export const structure = {
	value: String
};

export function parse() {
	const start = this.tokenStart;

	const char1 = this.consume(Delim);

	// The first character in the comparison operator must match '<', '=', or '>'.
	if (char1 !== '<' && char1 !== '>' && char1 !== '=') {
		this.error('Malformed comparison operator');
	}

	let char2;

	if (this.tokenType === Delim) {
		char2 = this.consume(Delim);

		// The second character in the comparison operator must match '='.
		if (char2 !== '=') {
			this.error('Malformed comparison operator');
		}
	}

	// If the next token is also 'Delim' then it is malformed.
	if (this.tokenType === Delim) {
		this.error('Malformed comparison operator');
	}

	const value = char2 ? `${char1}${char2}` : char1;

	return {
		type: 'Comparison',
		loc: this.getLocation(start, this.tokenStart),
		value
	};
}

export function generate(node) {
	for (let index = 0; index < node.value.length; index++) {
		this.token(Delim, node.value.charAt(index));
	}
}
