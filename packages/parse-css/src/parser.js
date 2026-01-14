import * as e from './error.js';

const regex_whitespace = /\s/;

export class Parser {
	/**
	 * @readonly
	 * @type {string}
	 */
	template;

	/** @type {number} */
	index = 0;

	/** @param {string} template */
	constructor(template) {
		this.template = template;
	}

	/**
	 * @param {string} str
	 * @param {boolean} [required]
	 */
	eat(str, required = false) {
		if (this.match(str)) {
			this.index += str.length;
			return true;
		}

		if (required) {
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
	 * @param {RegExp} pattern Should have a ^ anchor at the start
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
	 * @param {RegExp} pattern Should have a ^ anchor at the start
	 */
	read(pattern) {
		const result = this.match_regex(pattern);
		if (result) this.index += result.length;
		return result;
	}

	/** @param {RegExp} pattern */
	read_until(pattern) {
		if (this.index >= this.template.length) {
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
}
