/** @import { AST } from '#compiler' */
/** @import { Parser } from '../index.js' */
/** @import { Visitors } from 'zimmerframe' */
/** @import { StyleSheet as CSSStyleSheet, Rule as CSSRule, Atrule as CSSAtrule, Node as CSSNode } from '@sveltejs/parse-css' */
import { walk } from 'zimmerframe';
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
	/** @type {CSSStyleSheet} */
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
 * @param {Array<CSSRule | CSSAtrule>} children
 * @param {number} offset
 * @returns {Array<AST.CSS.Rule | AST.CSS.Atrule>}
 */
function add_metadata(children, offset) {
	/** @type {Visitors<CSSNode, { offset: number }>} */
	const visitors = {
		_: (node, ctx) => {
			const result = ctx.next() ?? node;
			return {
				...result,
				start: result.start + ctx.state.offset,
				end: result.end + ctx.state.offset
			};
		},
		// Nodes with children that need to be visited
		Atrule: (node, { visit }) => ({
			...node,
			block: node.block && /** @type {CSSNode & { type: 'Block' }} */ (visit(node.block))
		}),
		Rule: (node, { visit }) => ({
			...node,
			prelude: /** @type {CSSNode & { type: 'SelectorList' }} */ (visit(node.prelude)),
			block: /** @type {CSSNode & { type: 'Block' }} */ (visit(node.block)),
			metadata: {
				parent_rule: null,
				has_local_selectors: false,
				has_global_selectors: false,
				is_global_block: false
			}
		}),
		SelectorList: (node, { visit }) => ({
			...node,
			children: node.children.map(
				(child) => /** @type {CSSNode & { type: 'ComplexSelector' }} */ (visit(child))
			)
		}),
		ComplexSelector: (node, { visit }) => ({
			...node,
			children: node.children.map(
				(child) => /** @type {CSSNode & { type: 'RelativeSelector' }} */ (visit(child))
			),
			metadata: { rule: null, is_global: false, used: false }
		}),
		RelativeSelector: (node, { visit }) => ({
			...node,
			combinator:
				node.combinator && /** @type {CSSNode & { type: 'Combinator' }} */ (visit(node.combinator)),
			selectors: node.selectors.map((child) => /** @type {any} */ (visit(child))),
			metadata: { is_global: false, is_global_like: false, scoped: false }
		}),
		Block: (node, { visit }) => ({
			...node,
			children: node.children.map((child) => /** @type {any} */ (visit(child)))
		}),
		PseudoClassSelector: (node, { visit }) => ({
			...node,
			args: node.args && /** @type {CSSNode & { type: 'SelectorList' }} */ (visit(node.args))
		})
	};

	return children.map(
		(child) => /** @type {AST.CSS.Rule | AST.CSS.Atrule} */ (walk(child, { offset }, visitors))
	);
}
