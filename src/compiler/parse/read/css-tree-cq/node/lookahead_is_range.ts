// @ts-nocheck
import {
	EOF,
	WhiteSpace,
	Delim,
	RightParenthesis,
	LeftCurlyBracket,
	Colon
} from 'css-tree/tokenizer';

/**
 * Looks ahead to determine if query feature is a range query. This involves locating at least one delimiter and no
 * colon tokens.
 *
 * @returns {boolean} Is potential range query.
 */
export function lookahead_is_range() {
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
