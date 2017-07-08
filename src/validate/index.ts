import validateJs from './js/index';
import validateHtml from './html/index';
import { getLocator, Location } from 'locate-character';
import getCodeFrame from '../utils/getCodeFrame';
import CompileError from '../utils/CompileError';
import Stylesheet from '../generators/Stylesheet';
import { Node, Parsed, CompileOptions, Warning } from '../interfaces';

class ValidationError extends CompileError {
	constructor(
		message: string,
		template: string,
		index: number,
		filename: string
	) {
		super(message, template, index, filename);
		this.name = 'ValidationError';
	}
}

export class Validator {
	readonly source: string;
	readonly filename: string;

	onwarn: ({}) => void;
	locator?: (pos: number) => Location;

	namespace: string;
	defaultExport: Node;
	properties: Map<string, Node>;
	components: Map<string, Node>;
	methods: Map<string, Node>;
	helpers: Map<string, Node>;
	transitions: Map<string, Node>;

	constructor(parsed: Parsed, source: string, options: CompileOptions) {
		this.source = source;
		this.filename = options.filename;

		this.onwarn = options.onwarn;

		this.namespace = null;
		this.defaultExport = null;

		this.properties = new Map();
		this.components = new Map();
		this.methods = new Map();
		this.helpers = new Map();
		this.transitions = new Map();
	}

	error(message: string, pos: number) {
		throw new ValidationError(message, this.source, pos, this.filename);
	}

	warn(message: string, pos: number) {
		if (!this.locator) this.locator = getLocator(this.source);
		const { line, column } = this.locator(pos);

		const frame = getCodeFrame(this.source, line, column);

		this.onwarn({
			message,
			frame,
			loc: { line: line + 1, column },
			pos,
			filename: this.filename,
			toString: () => `${message} (${line + 1}:${column})\n${frame}`,
		});
	}
}

export default function validate(
	parsed: Parsed,
	source: string,
	stylesheet: Stylesheet,
	options: CompileOptions
) {
	const { onwarn, onerror, name, filename } = options;

	try {
		if (name && !/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(name)) {
			const error = new Error(`options.name must be a valid identifier (got '${name}')`);
			throw error;
		}

		if (name && !/^[A-Z]/.test(name)) {
			const message = `options.name should be capitalised`;
			onwarn({
				message,
				filename,
				toString: () => message,
			});
		}

		const validator = new Validator(parsed, source, {
			onwarn,
			name,
			filename,
		});

		if (parsed.js) {
			validateJs(validator, parsed.js);
		}

		if (parsed.css) {
			stylesheet.validate(validator);
		}

		if (parsed.html) {
			validateHtml(validator, parsed.html);
		}
	} catch (err) {
		if (onerror) {
			onerror(err);
		} else {
			throw err;
		}
	}
}
