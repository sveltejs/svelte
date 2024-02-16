import { error } from '../../../errors.js';

const REGEX_MATCHER = /^[~^$*|]?=/;
const REGEX_CLOSING_BRACKET = /[\s\]]/;
const REGEX_ATTRIBUTE_FLAGS = /^[a-zA-Z]+/; // only `i` and `s` are valid today, but make it future-proof
const REGEX_COMBINATOR_WHITESPACE = /^\s*(\+|~|>|\|\|)\s*/;
const REGEX_COMBINATOR = /^(\+|~|>|\|\|)/;
const REGEX_PERCENTAGE = /^\d+(\.\d+)?%/;
const REGEX_NTH_OF =
	/^(even|odd|\+?(\d+|\d*n(\s*[+-]\s*\d+)?)|-\d*n(\s*\+\s*\d+))((?=\s*[,)])|\s+of\s+)/;
const REGEX_WHITESPACE_OR_COLON = /[\s:]/;
const REGEX_LEADING_HYPHEN_OR_DIGIT = /-?\d/;
const REGEX_VALID_IDENTIFIER_CHAR = /[a-zA-Z0-9_-]/;
const REGEX_COMMENT_CLOSE = /\*\//;
const REGEX_HTML_COMMENT_CLOSE = /-->/;

/**
 * @param {import('../index.js').Parser} parser
 * @param {number} start
 * @param {Array<import('#compiler').Attribute | import('#compiler').SpreadAttribute | import('#compiler').Directive>} attributes
 * @returns {import('#compiler').Css.StyleSheet}
 */
export default function read_style(parser, start, attributes) {
	const content_start = parser.index;
	const children = read_body(parser, '</style');
	const content_end = parser.index;

	parser.read(/^<\/style\s*>/);

	return {
		type: 'StyleSheet',
		start,
		end: parser.index,
		attributes,
		children,
		content: {
			start: content_start,
			end: content_end,
			styles: parser.template.slice(content_start, content_end)
		}
	};
}

/**
 * @param {import('../index.js').Parser} parser
 * @param {string} close
 * @returns {any[]}
 */
function read_body(parser, close) {
	/** @type {Array<import('#compiler').Css.Rule | import('#compiler').Css.Atrule>} */
	const children = [];

	while (parser.index < parser.template.length) {
		allow_comment_or_whitespace(parser);

		if (parser.match(close)) {
			return children;
		}

		if (parser.match('@')) {
			children.push(read_at_rule(parser));
		} else {
			children.push(read_rule(parser));
		}
	}

	error(parser.template.length, 'expected-token', close);
}

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('#compiler').Css.Atrule}
 */
function read_at_rule(parser) {
	const start = parser.index;
	parser.eat('@', true);

	const name = read_identifier(parser);

	const prelude = read_value(parser);

	/** @type {import('#compiler').Css.Block | null} */
	let block = null;

	if (parser.match('{')) {
		// e.g. `@media (...) {...}`
		block = read_block(parser);
	} else {
		// e.g. `@import '...'`
		parser.eat(';', true);
	}

	return {
		type: 'Atrule',
		start,
		end: parser.index,
		name,
		prelude,
		block
	};
}

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('#compiler').Css.Rule}
 */
function read_rule(parser) {
	const start = parser.index;

	return {
		type: 'Rule',
		prelude: read_selector_list(parser),
		block: read_block(parser),
		start,
		end: parser.index,
		metadata: {
			parent_rule: null,
			has_local_selectors: false
		}
	};
}

/**
 * @param {import('../index.js').Parser} parser
 * @param {boolean} [inside_pseudo_class]
 * @returns {import('#compiler').Css.SelectorList}
 */
function read_selector_list(parser, inside_pseudo_class = false) {
	/** @type {import('#compiler').Css.ComplexSelector[]} */
	const children = [];

	allow_comment_or_whitespace(parser);

	const start = parser.index;

	while (parser.index < parser.template.length) {
		children.push(read_selector(parser, inside_pseudo_class));

		const end = parser.index;

		parser.allow_whitespace();

		if (inside_pseudo_class ? parser.match(')') : parser.match('{')) {
			return {
				type: 'SelectorList',
				start,
				end,
				children
			};
		} else {
			parser.eat(',', true);
			allow_comment_or_whitespace(parser);
		}
	}

	error(parser.template.length, 'unexpected-eof');
}

/**
 * @param {import('../index.js').Parser} parser
 * @param {boolean} [inside_pseudo_class]
 * @returns {import('#compiler').Css.ComplexSelector}
 */
function read_selector(parser, inside_pseudo_class = false) {
	const list_start = parser.index;

	/** @type {import('#compiler').Css.RelativeSelector[]} */
	const children = [];

	/**
	 * @param {import('#compiler').Css.Combinator | null} combinator
	 * @param {number} start
	 * @returns {import('#compiler').Css.RelativeSelector}
	 */
	function create_selector(combinator, start) {
		return {
			type: 'RelativeSelector',
			combinator,
			selectors: [],
			start,
			end: -1,
			metadata: {
				is_global: false,
				is_host: false,
				is_root: false,
				scoped: false
			}
		};
	}

	/** @type {import('#compiler').Css.RelativeSelector} */
	let relative_selector = create_selector(null, parser.index);

	while (parser.index < parser.template.length) {
		let start = parser.index;

		if (parser.eat('&')) {
			relative_selector.selectors.push({
				type: 'NestingSelector',
				name: '&',
				start,
				end: parser.index
			});
		} else if (parser.eat('*')) {
			let name = '*';

			if (parser.eat('|')) {
				// * is the namespace (which we ignore)
				name = read_identifier(parser);
			}

			relative_selector.selectors.push({
				type: 'TypeSelector',
				name,
				start,
				end: parser.index
			});
		} else if (parser.eat('#')) {
			relative_selector.selectors.push({
				type: 'IdSelector',
				name: read_identifier(parser),
				start,
				end: parser.index
			});
		} else if (parser.eat('.')) {
			relative_selector.selectors.push({
				type: 'ClassSelector',
				name: read_identifier(parser),
				start,
				end: parser.index
			});
		} else if (parser.eat('::')) {
			relative_selector.selectors.push({
				type: 'PseudoElementSelector',
				name: read_identifier(parser),
				start,
				end: parser.index
			});
			// We read the inner selectors of a pseudo element to ensure it parses correctly,
			// but we don't do anything with the result.
			if (parser.eat('(')) {
				read_selector_list(parser, true);
				parser.eat(')', true);
			}
		} else if (parser.eat(':')) {
			const name = read_identifier(parser);

			/** @type {null | import('#compiler').Css.SelectorList} */
			let args = null;

			if (parser.eat('(')) {
				args = read_selector_list(parser, true);
				parser.eat(')', true);
			} else if (name === 'global') {
				error(parser.index, 'invalid-css-global-selector');
			}

			relative_selector.selectors.push({
				type: 'PseudoClassSelector',
				name,
				args,
				start,
				end: parser.index
			});
		} else if (parser.eat('[')) {
			parser.allow_whitespace();
			const name = read_identifier(parser);
			parser.allow_whitespace();

			/** @type {string | null} */
			let value = null;

			const matcher = parser.read(REGEX_MATCHER);

			if (matcher) {
				parser.allow_whitespace();
				value = read_attribute_value(parser);
			}

			parser.allow_whitespace();

			const flags = parser.read(REGEX_ATTRIBUTE_FLAGS);

			parser.allow_whitespace();
			parser.eat(']', true);

			relative_selector.selectors.push({
				type: 'AttributeSelector',
				start,
				end: parser.index,
				name,
				matcher,
				value,
				flags
			});
		} else if (inside_pseudo_class && parser.match_regex(REGEX_NTH_OF)) {
			// nth of matcher must come before combinator matcher to prevent collision else the '+' in '+2n-1' would be parsed as a combinator

			relative_selector.selectors.push({
				type: 'Nth',
				value: /**@type {string} */ (parser.read(REGEX_NTH_OF)),
				start,
				end: parser.index
			});
		} else if (parser.match_regex(REGEX_PERCENTAGE)) {
			relative_selector.selectors.push({
				type: 'Percentage',
				value: /** @type {string} */ (parser.read(REGEX_PERCENTAGE)),
				start,
				end: parser.index
			});
		} else if (!parser.match_regex(REGEX_COMBINATOR)) {
			let name = read_identifier(parser);

			if (parser.eat('|')) {
				// we ignore the namespace when trying to find matching element classes
				name = read_identifier(parser);
			}

			relative_selector.selectors.push({
				type: 'TypeSelector',
				name,
				start,
				end: parser.index
			});
		}

		const index = parser.index;
		parser.allow_whitespace();

		if (parser.match(',') || (inside_pseudo_class ? parser.match(')') : parser.match('{'))) {
			// rewind, so we know whether to continue building the selector list
			parser.index = index;

			relative_selector.end = index;
			children.push(relative_selector);

			return {
				type: 'ComplexSelector',
				start: list_start,
				end: index,
				children,
				metadata: {
					rule: null,
					used: false
				}
			};
		}

		parser.index = index;
		const combinator = read_combinator(parser);

		if (combinator) {
			if (relative_selector.selectors.length === 0) {
				if (!inside_pseudo_class) {
					error(start, 'invalid-css-selector');
				}
			} else {
				relative_selector.end = index;
				children.push(relative_selector);
			}

			// ...and start a new one
			relative_selector = create_selector(combinator, combinator.start);

			parser.allow_whitespace();

			if (parser.match(',') || (inside_pseudo_class ? parser.match(')') : parser.match('{'))) {
				error(parser.index, 'invalid-css-selector');
			}
		}
	}

	error(parser.template.length, 'unexpected-eof');
}

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('#compiler').Css.Combinator | null}
 */
function read_combinator(parser) {
	const start = parser.index;
	parser.allow_whitespace();

	const index = parser.index;
	const name = parser.read(REGEX_COMBINATOR);

	if (name) {
		const end = parser.index;
		parser.allow_whitespace();

		return {
			type: 'Combinator',
			name,
			start: index,
			end
		};
	}

	if (parser.index !== start) {
		return {
			type: 'Combinator',
			name: ' ',
			start,
			end: parser.index
		};
	}

	return null;
}

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('#compiler').Css.Block}
 */
function read_block(parser) {
	const start = parser.index;

	parser.eat('{', true);

	/** @type {Array<import('#compiler').Css.Declaration | import('#compiler').Css.Rule | import('#compiler').Css.Atrule>} */
	const children = [];

	while (parser.index < parser.template.length) {
		allow_comment_or_whitespace(parser);

		if (parser.match('}')) {
			break;
		} else {
			children.push(read_block_item(parser));
		}
	}

	parser.eat('}', true);

	return {
		type: 'Block',
		start,
		end: parser.index,
		children
	};
}

/**
 * Reads a declaration, rule or at-rule
 *
 * @param {import('../index.js').Parser} parser
 * @returns {import('#compiler').Css.Declaration | import('#compiler').Css.Rule | import('#compiler').Css.Atrule}
 */
function read_block_item(parser) {
	if (parser.match('@')) {
		return read_at_rule(parser);
	}

	// read ahead to understand whether we're dealing with a declaration or a nested rule.
	// this involves some duplicated work, but avoids a try-catch that would disguise errors
	const start = parser.index;
	read_value(parser);
	const char = parser.template[parser.index];
	parser.index = start;

	return char === '{' ? read_rule(parser) : read_declaration(parser);
}

/**
 * @param {import('../index.js').Parser} parser
 * @returns {import('#compiler').Css.Declaration}
 */
function read_declaration(parser) {
	const start = parser.index;

	const property = parser.read_until(REGEX_WHITESPACE_OR_COLON);
	parser.allow_whitespace();
	parser.eat(':');
	parser.allow_whitespace();

	const value = read_value(parser);

	const end = parser.index;

	if (!parser.match('}')) {
		parser.eat(';', true);
	}

	return {
		type: 'Declaration',
		start,
		end,
		property,
		value
	};
}

/**
 * @param {import('../index.js').Parser} parser
 * @returns {string}
 */
function read_value(parser) {
	let value = '';
	let escaped = false;
	let in_url = false;

	/** @type {null | '"' | "'"} */
	let quote_mark = null;

	while (parser.index < parser.template.length) {
		const char = parser.template[parser.index];

		if (escaped) {
			value += '\\' + char;
			escaped = false;
		} else if (char === '\\') {
			escaped = true;
		} else if (char === quote_mark) {
			quote_mark = null;
		} else if (char === ')') {
			in_url = false;
		} else if (quote_mark === null && (char === '"' || char === "'")) {
			quote_mark = char;
		} else if (char === '(' && value.slice(-3) === 'url') {
			in_url = true;
		} else if ((char === ';' || char === '{' || char === '}') && !in_url && !quote_mark) {
			return value.trim();
		}

		value += char;

		parser.index++;
	}

	error(parser.template.length, 'unexpected-eof');
}

/**
 * Read a property that may or may not be quoted, e.g.
 * `foo` or `'foo bar'` or `"foo bar"`
 * @param {import('../index.js').Parser} parser
 */
function read_attribute_value(parser) {
	let value = '';
	let escaped = false;
	const quote_mark = parser.eat('"') ? '"' : parser.eat("'") ? "'" : null;

	while (parser.index < parser.template.length) {
		const char = parser.template[parser.index];
		if (escaped) {
			value += '\\' + char;
			escaped = false;
		} else if (char === '\\') {
			escaped = true;
		} else if (quote_mark ? char === quote_mark : REGEX_CLOSING_BRACKET.test(char)) {
			if (quote_mark) {
				parser.eat(quote_mark, true);
			}

			return value.trim();
		} else {
			value += char;
		}

		parser.index++;
	}

	error(parser.template.length, 'unexpected-eof');
}

/**
 * https://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
 * @param {import('../index.js').Parser} parser
 */
function read_identifier(parser) {
	const start = parser.index;

	let identifier = '';

	if (parser.match('--') || parser.match_regex(REGEX_LEADING_HYPHEN_OR_DIGIT)) {
		error(start, 'invalid-css-identifier');
	}

	let escaped = false;

	while (parser.index < parser.template.length) {
		const char = parser.template[parser.index];
		if (escaped) {
			identifier += '\\' + char;
			escaped = false;
		} else if (char === '\\') {
			escaped = true;
		} else if (
			/** @type {number} */ (char.codePointAt(0)) >= 160 ||
			REGEX_VALID_IDENTIFIER_CHAR.test(char)
		) {
			identifier += char;
		} else {
			break;
		}

		parser.index++;
	}

	if (identifier === '') {
		error(start, 'invalid-css-identifier');
	}

	return identifier;
}

/** @param {import('../index.js').Parser} parser */
function allow_comment_or_whitespace(parser) {
	parser.allow_whitespace();
	while (parser.match('/*') || parser.match('<!--')) {
		if (parser.eat('/*')) {
			parser.read_until(REGEX_COMMENT_CLOSE);
			parser.eat('*/', true);
		}

		if (parser.eat('<!--')) {
			parser.read_until(REGEX_HTML_COMMENT_CLOSE);
			parser.eat('-->', true);
		}

		parser.allow_whitespace();
	}
}
