import validateJs from './js/index';
import validateHtml from './html/index';
import { getLocator, Location } from 'locate-character';
import getCodeFrame from '../utils/getCodeFrame';
import Stats from '../Stats';
import error from '../utils/error';
import Stylesheet from '../css/Stylesheet';
import { Node, Ast, CompileOptions, Warning } from '../interfaces';

export class Validator {
	readonly source: string;
	readonly filename: string;
	readonly stats: Stats;

	options: CompileOptions;
	locator?: (pos: number) => Location;

	namespace: string;
	defaultExport: Node;
	properties: Map<string, Node>;
	components: Map<string, Node>;
	methods: Map<string, Node>;
	helpers: Map<string, Node>;
	animations: Map<string, Node>;
	transitions: Map<string, Node>;
	actions: Map<string, Node>;
	slots: Set<string>;

	used: {
		components: Set<string>;
		helpers: Set<string>;
		events: Set<string>;
		animations: Set<string>;
		transitions: Set<string>;
		actions: Set<string>;
	};

	constructor(ast: Ast, source: string, stats: Stats, options: CompileOptions) {
		this.source = source;
		this.stats = stats;

		this.filename = options.filename;
		this.options = options;

		this.namespace = null;
		this.defaultExport = null;

		this.properties = new Map();
		this.components = new Map();
		this.methods = new Map();
		this.helpers = new Map();
		this.animations = new Map();
		this.transitions = new Map();
		this.actions = new Map();
		this.slots = new Set();

		this.used = {
			components: new Set(),
			helpers: new Set(),
			events: new Set(),
			animations: new Set(),
			transitions: new Set(),
			actions: new Set(),
		};
	}

	error(pos: { start: number, end: number }, { code, message } : { code: string, message: string }) {
		error(message, {
			name: 'ValidationError',
			code,
			source: this.source,
			start: pos.start,
			end: pos.end,
			filename: this.filename
		});
	}

	warn(pos: { start: number, end: number }, { code, message }: { code: string, message: string }) {
		if (!this.locator) this.locator = getLocator(this.source, { offsetLine: 1 });
		const start = this.locator(pos.start);
		const end = this.locator(pos.end);

		const frame = getCodeFrame(this.source, start.line - 1, start.column);

		this.stats.warn({
			code,
			message,
			frame,
			start,
			end,
			pos: pos.start,
			filename: this.filename,
			toString: () => `${message} (${start.line + 1}:${start.column})\n${frame}`,
		});
	}
}

export default function validate(
	ast: Ast,
	source: string,
	stylesheet: Stylesheet,
	stats: Stats,
	options: CompileOptions
) {
	const { onerror, name, filename, dev, parser } = options;

	try {
		if (name && !/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(name)) {
			const error = new Error(`options.name must be a valid identifier (got '${name}')`);
			throw error;
		}

		if (name && /^[a-z]/.test(name)) {
			const message = `options.name should be capitalised`;
			stats.warn({
				code: `options-lowercase-name`,
				message,
				filename,
				toString: () => message,
			});
		}

		const validator = new Validator(ast, source, stats, {
			name,
			filename,
			dev,
			parser
		});

		if (ast.js) {
			validateJs(validator, ast.js);
		}

		if (ast.css) {
			stylesheet.validate(validator);
		}

		if (ast.html) {
			validateHtml(validator, ast.html);
		}

		// need to do a second pass of the JS, now that we've analysed the markup
		if (ast.js && validator.defaultExport) {
			const categories = {
				components: 'component',
				// TODO helpers require a bit more work — need to analyse all expressions
				// helpers: 'helper',
				events: 'event definition',
				transitions: 'transition',
				actions: 'actions',
			};

			Object.keys(categories).forEach(category => {
				const definitions = validator.defaultExport.declaration.properties.find(prop => prop.key.name === category);
				if (definitions) {
					definitions.value.properties.forEach(prop => {
						const { name } = prop.key;
						if (!validator.used[category].has(name)) {
							validator.warn(prop, {
								code: `unused-${category.slice(0, -1)}`,
								message: `The '${name}' ${categories[category]} is unused`
							});
						}
					});
				}
			});
		}
	} catch (err) {
		if (onerror) {
			onerror(err);
		} else {
			throw err;
		}
	}
}
