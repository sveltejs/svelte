import { locate, Location } from 'locate-character';
import fragment from './state/fragment';
import { whitespace } from '../utils/patterns';
import { trimStart, trimEnd } from '../utils/trim';
import getCodeFrame from '../utils/getCodeFrame';
import hash from './utils/hash';
import stripWhitespace from './utils/stripWhitespace';
import { Node, Parsed } from '../interfaces';
import CompileError from '../utils/CompileError';

class ParseError extends CompileError {
	constructor(
		message: string,
		template: string,
		index: number,
		filename: string
	) {
		super(message, template, index, filename);
		this.name = 'ParseError';
	}
}

interface ParserOptions {
	filename?: string;
}

export class Parser {
	readonly template: string;
	readonly filename?: string;

	index: number;
	stack: Array<Node>;

	html: Node;
	css: Node;
	js: Node;
	metaTags: {};

	constructor(template: string, options: ParserOptions) {
		if (typeof template !== 'string') {
			throw new TypeError('Template must be a string');
		}

		this.template = template.replace(/\s+$/, '');
		this.filename = options.filename;

		this.index = 0;
		this.stack = [];
		this.metaTags = {};

		this.html = {
			start: null,
			end: null,
			type: 'Fragment',
			children: [],
		};

		this.css = null;
		this.js = null;

		this.stack.push(this.html);

		let state = fragment;

		while (this.index < this.template.length) {
			state = state(this) || fragment;
		}

		if (this.stack.length > 1) {
			const current = this.current();

			const type = current.type === 'Element' ? `<${current.name}>` : 'Block';
			this.error(`${type} was left open`, current.start);
		}

		if (state !== fragment) {
			this.error('Unexpected end of input');
		}

		// trim unnecessary whitespace
		// stripWhitespace(this.html.children);
		// this.html.start = this.html.children[0] && this.html.children.start;
		// this.html.end = this.html.children[this.html.children.length] && this.html.children[this.html.children.length].end;
	}

	current() {
		return this.stack[this.stack.length - 1];
	}

	acornError(err: Error) {
		this.error(err.message.replace(/ \(\d+:\d+\)$/, ''), err.pos);
	}

	error(message: string, index = this.index) {
		throw new ParseError(message, this.template, index, this.filename);
	}

	eat(str: string, required?: boolean) {
		if (this.match(str)) {
			this.index += str.length;
			return true;
		}

		if (required) {
			this.error(`Expected ${str}`);
		}
	}

	match(str: string) {
		return this.template.slice(this.index, this.index + str.length) === str;
	}

	allowWhitespace() {
		while (
			this.index < this.template.length &&
			whitespace.test(this.template[this.index])
		) {
			this.index++;
		}
	}

	read(pattern: RegExp) {
		const match = pattern.exec(this.template.slice(this.index));
		if (!match || match.index !== 0) return null;

		this.index += match[0].length;

		return match[0];
	}

	readUntil(pattern: RegExp) {
		if (this.index >= this.template.length)
			this.error('Unexpected end of input');

		const start = this.index;
		const match = pattern.exec(this.template.slice(start));

		if (match) {
			const start = this.index;
			this.index = start + match.index;
			return this.template.slice(start, this.index);
		}

		this.index = this.template.length;
		return this.template.slice(start);
	}

	remaining() {
		return this.template.slice(this.index);
	}

	requireWhitespace() {
		if (!whitespace.test(this.template[this.index])) {
			this.error(`Expected whitespace`);
		}

		this.allowWhitespace();
	}
}

export default function parse(
	template: string,
	options: ParserOptions = {}
): Parsed {
	const parser = new Parser(template, options);

	return {
		hash: hash(parser.template),
		html: parser.html,
		css: parser.css,
		js: parser.js,
	};
}
