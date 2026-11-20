export const regex_whitespaces = /\s+/;
export const regex_starts_with_newline = /^\r?\n/;
export const regex_starts_with_whitespace = /^\s/;
export const regex_starts_with_whitespaces = /^[ \t\r\n]+/;
export const regex_ends_with_whitespace = /\s$/;
export const regex_ends_with_whitespaces = /[ \t\r\n]+$/;
/**
 * The same whitespace in text as written (a text node's `raw`), where it can also be a character
 * reference like `&#32;`, so that trimming `raw` keeps it in step with the decoded `data`.
 * The lookaheads keep longer references like `&#325;` from matching.
 */
const whitespace_as_written =
	/[ \t\r\n]|&#(?:0*(?:9|10|13|32)(?!\d)|[xX]0*(?:9|[aAdD]|20)(?![\da-fA-F]));?|&Tab;|&NewLine;/
		.source;
export const regex_raw_starts_with_whitespaces = new RegExp(`^(?:${whitespace_as_written})+`);
export const regex_raw_ends_with_whitespaces = new RegExp(`(?:${whitespace_as_written})+$`);
/** Not \S because that also removes explicit whitespace defined through things like `&nbsp;` */
export const regex_not_whitespace = /[^ \t\r\n]/;
/** Not \s+ because that also includes explicit whitespace defined through things like `&nbsp;` */
export const regex_whitespaces_strict = /[ \t\n\r\f]+/g;

export const regex_only_whitespaces = /^[ \t\n\r\f]+$/;

export const regex_not_newline_characters = /[^\n]/g;

export const regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
// used in replace all to remove all invalid chars from a literal identifier
export const regex_invalid_identifier_chars = /(^[^a-zA-Z_$]|[^a-zA-Z0-9_$])/g;

export const regex_starts_with_vowel = /^[aeiou]/;
export const regex_heading_tags = /^h[1-6]$/;
export const regex_illegal_attribute_character = /(^[0-9-.])|[\^$@%&#?!|()[\]{}^*+~;]/;
export const regex_bidirectional_control_characters =
	/[\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069]+/g;
export const regex_js_prefix = /^\W*javascript:/i;
export const regex_redundant_img_alt = /\b(image|picture|photo)\b/i;
