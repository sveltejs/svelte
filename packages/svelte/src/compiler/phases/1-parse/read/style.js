/** @import { AST } from '#compiler' */
/** @import { Parser } from '../index.js' */
import { parse as parse_css, CSSParseError } from '@sveltejs/parse-css';
import * as e from '../../../errors.js';

/**
 * @param {Parser} parser
 * @param {number} start
 * @param {Array<AST.Attribute | AST.SpreadAttribute | AST.Directive | AST.AttachTag>} attributes
 * @returns {AST.CSS.StyleSheet}
 */
export default function read_style(parser, start, attributes) {
	const content_start = parser.index;

	// Find the end of the style content
	const { index: content_end, found: found_close_tag } = find_style_end(parser);
	const styles = parser.template.slice(content_start, content_end);

	// Parse the CSS
	/** @type {import('@sveltejs/parse-css').StyleSheet} */
	let parsed;
	try {
		parsed = parse_css(styles);
	} catch (err) {
		if (err instanceof CSSParseError) {
			// Adjust position to be relative to full template and rethrow as Svelte error
			const start = content_start + err.position;
			const end = err.end !== undefined ? content_start + err.end : start;
			/* eslint-disable no-fallthrough -- apparently this rule isn't `never`-aware */
			switch (err.code) {
				case 'css_expected_identifier':
					e.css_expected_identifier(start);
				case 'css_empty_declaration':
					e.css_empty_declaration({ start, end });
				case 'css_selector_invalid':
					e.css_selector_invalid(start);
				case 'expected_token':
					e.expected_token(start, err.message.replace('Expected ', ''));
				case 'unexpected_eof':
					e.unexpected_eof(start);
			}
			/* eslint-enable no-fallthrough */
		}
		throw err;
	}

	// If CSS parsed successfully but we didn't find </style, throw an error
	if (!found_close_tag) {
		e.expected_token(parser.template.length, '</style');
	}

	// Move parser index past the CSS content
	parser.index = content_end;
	parser.read(/^<\/style\s*>/);

	// Convert parse-css AST to Svelte AST with metadata
	const children = /** @type {Array<AST.CSS.Rule | AST.CSS.Atrule>} */ (
		add_metadata(parsed.children, content_start)
	);

	return {
		type: 'StyleSheet',
		start,
		end: parser.index,
		attributes,
		children,
		content: {
			start: content_start,
			end: content_end,
			styles,
			comment: null
		}
	};
}

/**
 * Find the position of `</style` in the template, or return end of file
 * @param {Parser} parser
 * @returns {{ index: number, found: boolean }}
 */
function find_style_end(parser) {
	let index = parser.index;
	let quote_mark = null;
	let escaped = false;
	let in_url = false;

	while (index < parser.template.length) {
		const char = parser.template[index];

		if (escaped) {
			escaped = false;
		} else if (char === '\\') {
			escaped = true;
		} else if (char === quote_mark) {
			quote_mark = null;
		} else if (char === ')') {
			in_url = false;
		} else if (quote_mark === null && (char === '"' || char === "'")) {
			quote_mark = char;
		} else if (char === '(' && parser.template.slice(index - 3, index) === 'url') {
			in_url = true;
		} else if (!quote_mark && !in_url && parser.template.slice(index, index + 7) === '</style') {
			return { index, found: true };
		}

		index++;
	}

	return { index, found: false };
}

/**
 * Walk the parse-css AST and add Svelte-specific metadata fields.
 * Also adjusts positions by the offset.
 * @param {Array<import('@sveltejs/parse-css').Rule | import('@sveltejs/parse-css').Atrule>} children
 * @param {number} offset
 * @returns {Array<AST.CSS.Rule | AST.CSS.Atrule>}
 */
function add_metadata(children, offset) {
	/** @type {Array<AST.CSS.Rule | AST.CSS.Atrule>} */
	const result = [];

	for (const child of children) {
		if (child.type === 'Rule') {
			result.push(convert_rule(child, offset));
		} else {
			result.push(convert_atrule(child, offset));
		}
	}

	return result;
}

/**
 * @param {import('@sveltejs/parse-css').Rule} rule
 * @param {number} offset
 * @returns {AST.CSS.Rule}
 */
function convert_rule(rule, offset) {
	return {
		type: 'Rule',
		start: rule.start + offset,
		end: rule.end + offset,
		prelude: convert_selector_list(rule.prelude, offset),
		block: convert_block(rule.block, offset),
		metadata: {
			parent_rule: null,
			has_local_selectors: false,
			has_global_selectors: false,
			is_global_block: false
		}
	};
}

/**
 * @param {import('@sveltejs/parse-css').Atrule} atrule
 * @param {number} offset
 * @returns {AST.CSS.Atrule}
 */
function convert_atrule(atrule, offset) {
	return {
		type: 'Atrule',
		start: atrule.start + offset,
		end: atrule.end + offset,
		name: atrule.name,
		prelude: atrule.prelude,
		block: atrule.block ? convert_block(atrule.block, offset) : null
	};
}

/**
 * @param {import('@sveltejs/parse-css').SelectorList} list
 * @param {number} offset
 * @returns {AST.CSS.SelectorList}
 */
function convert_selector_list(list, offset) {
	return {
		type: 'SelectorList',
		start: list.start + offset,
		end: list.end + offset,
		children: list.children.map((child) => convert_complex_selector(child, offset))
	};
}

/**
 * @param {import('@sveltejs/parse-css').ComplexSelector} selector
 * @param {number} offset
 * @returns {AST.CSS.ComplexSelector}
 */
function convert_complex_selector(selector, offset) {
	return {
		type: 'ComplexSelector',
		start: selector.start + offset,
		end: selector.end + offset,
		children: selector.children.map((child) => convert_relative_selector(child, offset)),
		metadata: {
			rule: null,
			is_global: false,
			used: false
		}
	};
}

/**
 * @param {import('@sveltejs/parse-css').RelativeSelector} selector
 * @param {number} offset
 * @returns {AST.CSS.RelativeSelector}
 */
function convert_relative_selector(selector, offset) {
	return {
		type: 'RelativeSelector',
		start: selector.start + offset,
		end: selector.end + offset,
		combinator: selector.combinator
			? {
					type: 'Combinator',
					start: selector.combinator.start + offset,
					end: selector.combinator.end + offset,
					name: selector.combinator.name
				}
			: null,
		selectors: selector.selectors.map((s) => convert_simple_selector(s, offset)),
		metadata: {
			is_global: false,
			is_global_like: false,
			scoped: false
		}
	};
}

/**
 * @param {import('@sveltejs/parse-css').SimpleSelector} selector
 * @param {number} offset
 * @returns {AST.CSS.SimpleSelector}
 */
function convert_simple_selector(selector, offset) {
	const base = {
		start: selector.start + offset,
		end: selector.end + offset
	};

	switch (selector.type) {
		case 'TypeSelector':
			return { ...base, type: 'TypeSelector', name: selector.name };
		case 'IdSelector':
			return { ...base, type: 'IdSelector', name: selector.name };
		case 'ClassSelector':
			return { ...base, type: 'ClassSelector', name: selector.name };
		case 'AttributeSelector':
			return {
				...base,
				type: 'AttributeSelector',
				name: selector.name,
				matcher: selector.matcher,
				value: selector.value,
				flags: selector.flags
			};
		case 'PseudoElementSelector':
			return { ...base, type: 'PseudoElementSelector', name: selector.name };
		case 'PseudoClassSelector':
			return {
				...base,
				type: 'PseudoClassSelector',
				name: selector.name,
				args: selector.args ? convert_selector_list(selector.args, offset) : null
			};
		case 'Percentage':
			return { ...base, type: 'Percentage', value: selector.value };
		case 'Nth':
			return { ...base, type: 'Nth', value: selector.value };
		case 'NestingSelector':
			return { ...base, type: 'NestingSelector', name: '&' };
	}
}

/**
 * @param {import('@sveltejs/parse-css').Block} block
 * @param {number} offset
 * @returns {AST.CSS.Block}
 */
function convert_block(block, offset) {
	return {
		type: 'Block',
		start: block.start + offset,
		end: block.end + offset,
		children: block.children.map((child) => {
			if (child.type === 'Declaration') {
				return convert_declaration(child, offset);
			} else if (child.type === 'Rule') {
				return convert_rule(child, offset);
			} else {
				return convert_atrule(child, offset);
			}
		})
	};
}

/**
 * @param {import('@sveltejs/parse-css').Declaration} decl
 * @param {number} offset
 * @returns {AST.CSS.Declaration}
 */
function convert_declaration(decl, offset) {
	return {
		type: 'Declaration',
		start: decl.start + offset,
		end: decl.end + offset,
		property: decl.property,
		value: decl.value
	};
}
