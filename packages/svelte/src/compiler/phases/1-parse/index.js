// @ts-expect-error acorn type definitions are borked in the release we use
import { isIdentifierStart, isIdentifierChar } from 'acorn';
import fragment from './state/fragment.js';
import { regex_whitespace } from '../patterns.js';
import { reserved } from './utils/names.js';
import full_char_code_at from './utils/full_char_code_at.js';
import { error } from '../../errors.js';
import { create_fragment } from './utils/create.js';
import read_options from './read/options.js';

const regex_position_indicator = / \(\d+:\d+\)$/;

const regex_lang_attribute =
	/<!--[^]*?-->|<script\s+(?:[^>]*|(?:[^=>'"/]+=(?:"[^"]*"|'[^']*'|[^>\s]+)\s+)*)lang=(["'])?([^"' >]+)\1[^>]*>/g;

export class Parser {
	/**
	 * @readonly
	 * @type {string}
	 */
	template;

	/** */
	index = 0;

	/** Whether we're parsing in TypeScript mode */
	ts = false;

	/** @type {import('#compiler').TemplateNode[]} */
	stack = [];

	/** @type {import('#compiler').Fragment[]} */
	fragments = [];

	/** @type {import('#compiler').Root} */
	root;

	/** @type {Record<string, boolean>} */
	meta_tags = {};

	/** @type {LastAutoClosedTag | undefined} */
	last_auto_closed_tag;

	/** @param {string} template */
	constructor(template) {
		if (typeof template !== 'string') {
			throw new TypeError('Template must be a string');
		}

		this.template = template.trimRight();

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

			if (current.type === 'RegularElement') {
				current.end = current.start + 1;
				error(current, 'unclosed-element', current.name);
			} else {
				current.end = current.start + 1;
				error(current, 'unclosed-block');
			}
		}

		if (state !== fragment) {
			error(this.index, 'unexpected-eof');
		}

		if (this.root.fragment.nodes.length) {
			let start = /** @type {number} */ (this.root.fragment.nodes[0].start);
			while (regex_whitespace.test(template[start])) start += 1;

			let end = /** @type {number} */ (
				this.root.fragment.nodes[this.root.fragment.nodes.length - 1].end
			);
			while (regex_whitespace.test(template[end - 1])) end -= 1;

			this.root.start = start;
			this.root.end = end;
		} else {
			// @ts-ignore
			this.root.start = this.root.end = null;
		}

		const options_index = this.root.fragment.nodes.findIndex(
			/** @param {any} thing */
			(thing) => thing.type === 'SvelteOptions'
		);
		if (options_index !== -1) {
			const options = /** @type {import('#compiler').SvelteOptionsRaw} */ (
				this.root.fragment.nodes[options_index]
			);
			this.root.fragment.nodes.splice(options_index, 1);
			this.root.options = read_options(options);
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
		error(err.pos, 'js-parse-error', err.message.replace(regex_position_indicator, ''));
	}

	/**
	 * @param {string} str
	 * @param {boolean} [required]
	 */
	eat(str, required) {
		if (this.match(str)) {
			this.index += str.length;
			return true;
		}

		if (required) {
			if (this.index === this.template.length) {
				error(this.index, 'unexpected-eof', str);
			} else {
				error(this.index, 'expected-token', str);
			}
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

	/** @param {any} allow_reserved */
	read_identifier(allow_reserved = false) {
		const start = this.index;

		let i = this.index;

		const code = full_char_code_at(this.template, i);
		if (!isIdentifierStart(code, true)) return null;

		i += code <= 0xffff ? 1 : 2;

		while (i < this.template.length) {
			const code = full_char_code_at(this.template, i);

			if (!isIdentifierChar(code, true)) break;
			i += code <= 0xffff ? 1 : 2;
		}

		const identifier = this.template.slice(this.index, (this.index = i));

		if (!allow_reserved && reserved.includes(identifier)) {
			error(start, 'unexpected-reserved-word', identifier);
		}

		return identifier;
	}

	/** @param {RegExp} pattern */
	read_until(pattern) {
		if (this.index >= this.template.length) {
			error(this.template.length, 'unexpected-eof');
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
			error(this.index, 'missing-whitespace');
		}

		this.allow_whitespace();
	}

	pop() {
		this.fragments.pop();
		return this.stack.pop();
	}

	/**
	 * @template T
	 * @param {Omit<T, 'prev' | 'parent'>} node
	 * @returns {T}
	 */
	append(node) {
		const current = this.current();
		const fragment = this.fragments.at(-1);

		Object.defineProperties(node, {
			prev: {
				enumerable: false,
				value: fragment?.nodes.at(-1) ?? null
			},
			parent: {
				enumerable: false,
				configurable: true,
				value: current
			}
		});

		// @ts-expect-error
		fragment.nodes.push(node);

		// @ts-expect-error
		return node;
	}
}

/**
 * @param {string} template
 * @returns {import('#compiler').Root}
 */
export function parse(template) {
	const parser = new Parser(template);

	return parser.root;
}

/** @typedef {(parser: Parser) => ParserState | void} ParserState */

/** @typedef {Object} LastAutoClosedTag
 * @property {string} tag
 * @property {string} reason
 * @property {number} depth
 */
