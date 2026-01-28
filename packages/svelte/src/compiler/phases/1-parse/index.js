/** @import { AST } from '#compiler' */
/** @import { Location } from 'locate-character' */
/** @import * as ESTree from 'estree' */
// @ts-expect-error acorn type definitions are borked in the release we use
import { isIdentifierStart, isIdentifierChar } from 'acorn';
import fragment from './state/fragment.js';
import { regex_whitespace } from '../patterns.js';
import * as e from '../../errors.js';
import { create_fragment } from './utils/create.js';
import read_options from './read/options.js';
import { is_reserved } from '../../../utils.js';
import { disallow_children } from '../2-analyze/visitors/shared/special-element.js';
import * as state from '../../state.js';

const regex_position_indicator = / \(\d+:\d+\)$/;

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
	}

	current() {
		return this.stack[this.stack.length - 1];
	}

	/**
	 * @param {any} err
	 * @returns {never}
	 */
	acorn_error(err) {
		e.js_parse_error(err.pos, err.message.replace(regex_position_indicator, ''));
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

		return this.template.slice(this.index, this.index + length) === str;
	}

	/**
	 * Match a regex at the current index
	 * @param {RegExp} pattern  Should have a ^ anchor at the start so the regex doesn't search past the beginning, resulting in worse performance
	 */
	match_regex(pattern) {
		const match = pattern.exec(this.template.slice(this.index));
		if (!match || match.index !== 0) return null;

		return match[0];
	}

	allow_whitespace() {
		while (this.index < this.template.length && regex_whitespace.test(this.template[this.index])) {
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
		if (!regex_whitespace.test(this.template[this.index])) {
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
