/** @import { AST } from '#compiler' */
/** @import { Location } from 'locate-character' */
/** @import * as ESTree from 'estree' */
/** @import { CommentWithLocation } from './types' */
// @ts-expect-error acorn type definitions are borked in the release we use
import { isIdentifierStart, isIdentifierChar } from 'acorn';
import fragment from './state/fragment.js';
import * as e from '../../errors.js';
import { create_fragment } from './utils/create.js';
import read_options from './read/options.js';
import { is_reserved } from '../../../utils.js';
import { disallow_children } from '../2-analyze/visitors/shared/special-element.js';
import * as state from '../../state.js';
import { find_end } from './utils/find.js';
import { walk } from 'zimmerframe';

/** @param {number} cc */
function is_whitespace(cc) {
	// fast path for common whitespace
	if (cc === 32 || (cc <= 13 && cc >= 9)) return true;
	// rare whitespace — \u00a0, \u1680, \u2000-\u200a, \u2028, \u2029, \u202f, \u205f, \u3000, \ufeff
	if (cc < 160) return false;
	return (
		cc === 160 ||
		cc === 5760 ||
		(cc >= 8192 && cc <= 8202) ||
		cc === 8232 ||
		cc === 8233 ||
		cc === 8239 ||
		cc === 8287 ||
		cc === 12288 ||
		cc === 65279
	);
}

const regex_lang_attribute =
	/<!--[^]*?-->|<script\s+(?:[^>]*|(?:[^=>'"/]+=(?:"[^"]*"|'[^']*'|[^>\s]+)\s+)*)lang=(["'])?([^"' >]+)\1[^>]*>/g;

export class Parser {
	/**
	 * @readonly
	 * @type {string}
	 */
	template;

	/**
	 * Whether or not we're in loose parsing mode, in which
	 * case we try to continue parsing as much as possible
	 * @type {boolean}
	 */
	loose;

	/** */
	index = 0;

	/**
	 * Creates a minimal parser instance for CSS-only parsing.
	 * Skips Svelte component parsing setup.
	 * @param {string} source
	 * @returns {Parser}
	 */
	static forCss(source) {
		const parser = Object.create(Parser.prototype);
		parser.template = source;
		parser.index = 0;
		parser.loose = false;
		return parser;
	}

	/** Whether we're parsing in TypeScript mode */
	ts = false;

	/** @type {AST.TemplateNode[]} */
	stack = [];

	/** @type {AST.Fragment[]} */
	fragments = [];

	/** @type {AST.Root} */
	root;

	/** @type {Record<string, boolean>} */
	meta_tags = {};

	/** @type {LastAutoClosedTag | undefined} */
	last_auto_closed_tag;

	/**
	 * @param {string} template
	 * @param {boolean} loose
	 */
	constructor(template, loose) {
		if (typeof template !== 'string') {
			throw new TypeError('Template must be a string');
		}

		this.loose = loose;
		this.template = template.trimEnd();

		let match_lang;

		do match_lang = regex_lang_attribute.exec(template);
		while (match_lang && match_lang[0][1] !== 's'); // ensure it starts with '<s' to match script tags

		regex_lang_attribute.lastIndex = 0; // reset matched index to pass tests - otherwise declare the regex inside the constructor

		this.ts = match_lang?.[2] === 'ts';

		this.root = {
			css: null,
			js: [],
			// @ts-ignore
			start: null,
			// @ts-ignore
			end: null,
			type: 'Root',
			fragment: create_fragment(),
			options: null,
			comments: [],
			metadata: {
				ts: this.ts
			}
		};

		this.stack.push(this.root);
		this.fragments.push(this.root.fragment);

		/** @type {ParserState} */
		let state = fragment;

		while (this.index < this.template.length) {
			state = state(this) || fragment;
		}

		if (this.stack.length > 1) {
			const current = this.current();

			if (this.loose) {
				current.end = this.template.length;
			} else if (current.type === 'RegularElement') {
				current.end = current.start + 1;
				e.element_unclosed(current, current.name);
			} else {
				current.end = current.start + 1;
				e.block_unclosed(current);
			}
		}

		if (state !== fragment) {
			e.unexpected_eof(this.index);
		}

		this.root.start = 0;
		this.root.end = template.length;

		const options_index = this.root.fragment.nodes.findIndex(
			/** @param {any} thing */
			(thing) => thing.type === 'SvelteOptions'
		);
		if (options_index !== -1) {
			const options = /** @type {AST.SvelteOptionsRaw} */ (this.root.fragment.nodes[options_index]);
			this.root.fragment.nodes.splice(options_index, 1);
			this.root.options = read_options(options);

			disallow_children(options);

			// We need this for the old AST format
			Object.defineProperty(this.root.options, '__raw__', {
				value: options,
				enumerable: false
			});
		}

		this.#attach_comments();
	}

	current() {
		return this.stack[this.stack.length - 1];
	}

	/**
	 * @param {string} str
	 * @param {boolean} required
	 * @param {boolean} required_in_loose
	 */
	eat(str, required = false, required_in_loose = true) {
		if (this.match(str)) {
			this.index += str.length;
			return true;
		}

		if (required && (!this.loose || required_in_loose)) {
			e.expected_token(this.index, str);
		}

		return false;
	}

	/** @param {string} str */
	match(str) {
		const length = str.length;
		if (length === 1) {
			// more performant than slicing
			return this.template[this.index] === str;
		}

		return this.template.startsWith(str, this.index);
	}

	/**
	 * Match a regex at the current index
	 * @param {RegExp} pattern  Should have the sticky (`y`) flag so that it only matches at the current index
	 */
	match_regex(pattern) {
		pattern.lastIndex = this.index;
		const match = pattern.exec(this.template);
		if (!match || match.index !== this.index) return null;

		return match[0];
	}

	advance() {
		let i = this.index;
		let source = this.template;

		while (i < source.length) {
			const code = source.charCodeAt(i);

			if (is_whitespace(code)) {
				i += 1;
				continue;
			}

			if (code === 47) {
				const start = i;
				const next = source.charCodeAt(i + 1);

				if (next === 47 || next === 42) {
					const is_block = next === 42;
					i = find_end(source, is_block ? '*/' : '\n', i);

					const end = is_block ? i : i - 1; // line comments don't include the '\n'

					this.root.comments.push({
						type: is_block ? 'Block' : 'Line',
						start,
						end,
						value: source.slice(start + 2, end - (is_block ? 2 : 1)),
						loc: state.get_loc(start, end)
					});

					continue;
				}
			}

			break;
		}

		this.index = i;
	}

	allow_whitespace() {
		while (
			this.index < this.template.length &&
			is_whitespace(this.template.charCodeAt(this.index))
		) {
			this.index++;
		}
	}

	/**
	 * Search for a regex starting at the current index and return the result if it matches
	 * @param {RegExp} pattern  Should have a ^ anchor at the start so the regex doesn't search past the beginning, resulting in worse performance
	 */
	read(pattern) {
		const result = this.match_regex(pattern);
		if (result) this.index += result.length;
		return result;
	}

	/**
	 * @returns {ESTree.Identifier & { start: number, end: number, loc: { start: Location, end: Location } }}
	 */
	read_identifier() {
		const start = this.index;
		let end = start;
		let name = '';

		const code = /** @type {number} */ (this.template.codePointAt(this.index));

		if (isIdentifierStart(code, true)) {
			let i = this.index;
			end += code <= 0xffff ? 1 : 2;

			while (end < this.template.length) {
				const code = /** @type {number} */ (this.template.codePointAt(end));

				if (!isIdentifierChar(code, true)) break;
				end += code <= 0xffff ? 1 : 2;
			}

			name = this.template.slice(start, end);
			this.index = end;

			if (is_reserved(name)) {
				e.unexpected_reserved_word(start, name);
			}
		}

		return {
			type: 'Identifier',
			name,
			start,
			end,
			loc: {
				start: state.locator(start),
				end: state.locator(end)
			}
		};
	}

	/** @param {RegExp} pattern */
	read_until(pattern) {
		if (this.index >= this.template.length) {
			if (this.loose) return '';
			e.unexpected_eof(this.template.length);
		}

		const start = this.index;
		const match = pattern.exec(this.template.slice(start));

		if (match) {
			this.index = start + match.index;
			return this.template.slice(start, this.index);
		}

		this.index = this.template.length;
		return this.template.slice(start);
	}

	require_whitespace() {
		if (!is_whitespace(this.template.charCodeAt(this.index))) {
			e.expected_whitespace(this.index);
		}

		this.allow_whitespace();
	}

	pop() {
		this.fragments.pop();
		return this.stack.pop();
	}

	/**
	 * @template {AST.Fragment['nodes'][number]} T
	 * @param {T} node
	 * @returns {T}
	 */
	append(node) {
		this.fragments.at(-1)?.nodes.push(node);
		return node;
	}

	#attach_comments() {
		const source = this.template;
		const comments = this.root.comments.map(({ type, value, start, end }) => ({
			type,
			value,
			start,
			end
		}));

		const root =
			/** @type {AST.BaseNode & { leadingComments: CommentWithLocation[], trailingComments: CommentWithLocation[] }} */ (
				/** @type {unknown} */ (this.root)
			);

		const nodes = [this.root.module, this.root.instance, this.root.css, ...this.root.fragment.nodes]
			.filter((node) => !!node)
			.sort((a, b) => a.start - b.start);

		for (const node of nodes) {
			walk(node, null, {
				_(node, { next, path }) {
					let comment;

					while (comments[0] && comments[0].start < node.start) {
						comment = /** @type {CommentWithLocation} */ (comments.shift());
						(node.leadingComments ||= []).push(comment);
					}

					next();

					if (comments[0]) {
						const parent = /** @type {any} */ (path.at(-1));

						if (parent === undefined || node.end !== parent.end) {
							const slice = source.slice(node.end, comments[0].start);
							const is_last_in_body =
								((parent?.type === 'BlockStatement' || parent?.type === 'Program') &&
									parent.body.indexOf(node) === parent.body.length - 1) ||
								(parent?.type === 'ArrayExpression' &&
									parent.elements.indexOf(node) === parent.elements.length - 1) ||
								(parent?.type === 'ObjectExpression' &&
									parent.properties.indexOf(node) === parent.properties.length - 1);

							if (is_last_in_body) {
								// Special case: There can be multiple trailing comments after the last node in a block,
								// and they can be separated by newlines
								let end = node.end;

								while (comments.length) {
									const comment = comments[0];
									if (parent && comment.start >= parent.end) break;

									(node.trailingComments ||= []).push(comment);
									comments.shift();
									end = comment.end;
								}
							} else if (node.end <= comments[0].start && /^[,) \t]*$/.test(slice)) {
								node.trailingComments = [/** @type {CommentWithLocation} */ (comments.shift())];
							}
						}
					}
				}
			});
		}
	}
}

/**
 * @param {string} template
 * @param {boolean} [loose]
 * @returns {AST.Root}
 */
export function parse(template, loose = false) {
	state.set_source(template);

	const parser = new Parser(template, loose);
	return parser.root;
}

/** @typedef {(parser: Parser) => ParserState | void} ParserState */

/** @typedef {Object} LastAutoClosedTag
 * @property {string} tag
 * @property {string} reason
 * @property {number} depth
 */
