import { parseExpressionAt } from 'acorn';
import MagicString, { Bundle } from 'magic-string';
import isReference from 'is-reference';
import { walk, childKeys } from 'estree-walker';
import { getLocator } from 'locate-character';
import Stats from '../Stats';
import deindent from '../utils/deindent';
import reservedNames from '../utils/reservedNames';
import namespaces from '../utils/namespaces';
import { removeNode } from '../utils/removeNode';
import nodeToString from '../utils/nodeToString';
import wrapModule from './wrapModule';
import { createScopes, extractNames, Scope } from '../utils/annotateWithScopes';
import getName from '../utils/getName';
import Stylesheet from './css/Stylesheet';
import { test } from '../config';
import Fragment from './nodes/Fragment';
import * as internal from '../internal/index';
import { Node, ShorthandImport, Ast, CompileOptions, CustomElementOptions } from '../interfaces';
import error from '../utils/error';
import getCodeFrame from '../utils/getCodeFrame';
import checkForComputedKeys from './validate/js/utils/checkForComputedKeys';
import checkForDupes from './validate/js/utils/checkForDupes';
import propValidators from './validate/js/propValidators';
import fuzzymatch from './validate/utils/fuzzymatch';
import flattenReference from '../utils/flattenReference';
import { instrument } from '../utils/instrument';

interface Computation {
	key: string;
	deps: string[];
	hasRestParam: boolean;
}

interface Declaration {
	type: string;
	name: string;
	node: Node;
	block: string;
}

function detectIndentation(str: string) {
	const pattern = /^[\t\s]{1,4}/gm;
	let match;

	while (match = pattern.exec(str)) {
		if (match[0][0] === '\t') return '\t';
		if (match[0].length === 2) return '  ';
	}

	return '    ';
}

function getIndentationLevel(str: string, b: number) {
	let a = b;
	while (a > 0 && str[a - 1] !== '\n') a -= 1;
	return /^\s*/.exec(str.slice(a, b))[0];
}

function getIndentExclusionRanges(node: Node) {
	// TODO can we fold this into a different pass?
	const ranges: Node[] = [];
	walk(node, {
		enter(node: Node) {
			if (node.type === 'TemplateElement') ranges.push(node);
		}
	});
	return ranges;
}

function increaseIndentation(
	code: MagicString,
	start: number,
	end: number,
	indentationLevel: string,
	ranges: Node[]
) {
	const str = code.original.slice(start, end);
	const lines = str.split('\n');

	let c = start;
	lines.forEach(line => {
		if (line) {
			code.prependRight(c, '\t\t\t'); // TODO detect indentation
		}

		c += line.length + 1;
	});
}

// We need to tell estree-walker that it should always
// look for an `else` block, otherwise it might get
// the wrong idea about the shape of each/if blocks
childKeys.EachBlock = childKeys.IfBlock = ['children', 'else'];
childKeys.Attribute = ['value'];
childKeys.ExportNamedDeclaration = ['declaration', 'specifiers'];

export default class Component {
	stats: Stats;

	ast: Ast;
	source: string;
	name: string;
	options: CompileOptions;
	fragment: Fragment;
	scope: Scope;

	meta: {
		namespace?: string;
		tag?: string;
		immutable?: boolean;
	};

	customElement: CustomElementOptions;
	tag: string;

	properties: Map<string, Node>;

	defaultExport: Node;
	imports: Node[];
	shorthandImports: ShorthandImport[];
	helpers: Set<string>;
	components: Set<string>;
	events: Set<string>;
	methods: Set<string>;
	animations: Set<string>;
	transitions: Set<string>;
	actions: Set<string>;
	namespace: string;
	hasComponents: boolean;
	javascript: string;

	declarations: string[];
	exports: Array<{ name: string, as: string }>;
	event_handlers: Array<{ name: string, body: string }>;
	props: string[];

	refCallees: Node[];

	code: MagicString;

	indirectDependencies: Map<string, Set<string>>;
	expectedProperties: Set<string>;
	refs: Set<string>;

	file: string;
	locate: (c: number) => { line: number, column: number };

	stylesheet: Stylesheet;

	userVars: Set<string>;
	templateVars: Map<string, string>;
	aliases: Map<string, string>;
	usedNames: Set<string>;

	locator: (search: number, startIndex?: number) => {
		line: number,
		column: number
	};

	constructor(
		ast: Ast,
		source: string,
		name: string,
		options: CompileOptions,
		stats: Stats
	) {
		this.stats = stats;

		this.ast = ast;
		this.source = source;
		this.options = options;

		this.imports = [];
		this.shorthandImports = [];
		this.helpers = new Set();
		this.components = new Set();
		this.events = new Set();
		this.methods = new Set();
		this.animations = new Set();
		this.transitions = new Set();
		this.actions = new Set();

		this.declarations = [];
		this.exports = [];
		this.event_handlers = [];

		this.refs = new Set();
		this.refCallees = [];

		this.indirectDependencies = new Map();

		this.file = options.filename && (
			typeof process !== 'undefined' ? options.filename.replace(process.cwd(), '').replace(/^[\/\\]/, '') : options.filename
		);
		this.locate = getLocator(this.source);

		// track which properties are needed, so we can provide useful info
		// in dev mode
		this.expectedProperties = new Set();

		this.code = new MagicString(source);

		// styles
		this.stylesheet = new Stylesheet(source, ast, options.filename, options.dev);
		this.stylesheet.validate(this);

		// allow compiler to deconflict user's `import { flush } from 'whatever'` and
		// Svelte's builtin `import { flush, ... } from 'svelte/internal.ts'`;
		this.userVars = new Set();
		this.templateVars = new Map();
		this.aliases = new Map();
		this.usedNames = new Set();

		this.properties = new Map();

		this.walkJs();
		this.name = this.alias(name);

		const meta = process_meta(this, this.ast.html.children);
		this.namespace = namespaces[meta.namespace] || meta.namespace;

		if (options.customElement === true) {
			this.customElement = {
				tag: meta.tag,
				props: [] // TODO!!!
			};
		} else {
			this.customElement = options.customElement;
		}

		if (this.customElement && !this.customElement.tag) {
			throw new Error(`No tag name specified`); // TODO better error
		}

		this.fragment = new Fragment(this, ast.html);
		// this.walkTemplate();
		if (!this.customElement) this.stylesheet.reify();

		this.stylesheet.warnOnUnusedSelectors(options.onwarn);

		if (!this.ast.js) {
			this.declarations = Array.from(this.expectedProperties);

			this.exports = this.declarations.map(name => ({
				name,
				as: name
			}));
		}
	}

	addSourcemapLocations(node: Node) {
		walk(node, {
			enter: (node: Node) => {
				this.code.addSourcemapLocation(node.start);
				this.code.addSourcemapLocation(node.end);
			},
		});
	}

	alias(name: string) {
		if (!this.aliases.has(name)) {
			this.aliases.set(name, this.getUniqueName(name));
		}

		return this.aliases.get(name);
	}

	generate(result: string, options: CompileOptions, {
		banner = '',
		name,
		format
	}) {
		const pattern = /\[✂(\d+)-(\d+)$/;

		const helpers = new Set();

		// TODO use same regex for both
		result = result.replace(options.generate === 'ssr' ? /(@+|#+|%+)(\w*(?:-\w*)?)/g : /(%+|@+)(\w*(?:-\w*)?)/g, (match: string, sigil: string, name: string) => {
			if (sigil === '@') {
				if (name in internal) {
					if (options.dev && `${name}Dev` in internal) name = `${name}Dev`;
					helpers.add(name);
				}

				return this.alias(name);
			}

			if (sigil === '%') {
				return this.templateVars.get(name);
			}

			return sigil.slice(1) + name;
		});

		const importedHelpers = Array.from(helpers).concat('SvelteComponent').sort().map(name => {
			const alias = this.alias(name);
			return { name, alias };
		});

		const sharedPath = options.shared || 'svelte/internal.js';

		const module = wrapModule(result, format, name, options, banner, sharedPath, importedHelpers, this.imports, this.shorthandImports, this.source);

		const parts = module.split('✂]');
		const finalChunk = parts.pop();

		const compiled = new Bundle({ separator: '' });

		function addString(str: string) {
			compiled.addSource({
				content: new MagicString(str),
			});
		}

		const { filename } = options;

		// special case — the source file doesn't actually get used anywhere. we need
		// to add an empty file to populate map.sources and map.sourcesContent
		if (!parts.length) {
			compiled.addSource({
				filename,
				content: new MagicString(this.source).remove(0, this.source.length),
			});
		}

		parts.forEach((str: string) => {
			const chunk = str.replace(pattern, '');
			if (chunk) addString(chunk);

			const match = pattern.exec(str);

			const snippet = this.code.snip(+match[1], +match[2]);

			compiled.addSource({
				filename,
				content: snippet,
			});
		});

		addString(finalChunk);

		const css = this.customElement ?
			{ code: null, map: null } :
			this.stylesheet.render(options.cssOutputFilename, true);

		const js = {
			code: compiled.toString(),
			map: compiled.generateMap({
				includeContent: true,
				file: options.outputFilename,
			})
		};

		return {
			ast: this.ast,
			js,
			css,
			stats: this.stats.render(this)
		};
	}

	getUniqueName(name: string) {
		if (test) name = `${name}$`;
		let alias = name;
		for (
			let i = 1;
			reservedNames.has(alias) ||
			this.userVars.has(alias) ||
			this.usedNames.has(alias);
			alias = `${name}_${i++}`
		);
		this.usedNames.add(alias);
		return alias;
	}

	getUniqueNameMaker() {
		const localUsedNames = new Set();

		function add(name: string) {
			localUsedNames.add(name);
		}

		reservedNames.forEach(add);
		this.userVars.forEach(add);

		return (name: string) => {
			if (test) name = `${name}$`;
			let alias = name;
			for (
				let i = 1;
				this.usedNames.has(alias) ||
				localUsedNames.has(alias);
				alias = `${name}_${i++}`
			);
			localUsedNames.add(alias);
			return alias;
		};
	}

	error(
		pos: {
			start: number,
			end: number
		},
		e : {
			code: string,
			message: string
		}
	) {
		error(e.message, {
			name: 'ValidationError',
			code: e.code,
			source: this.source,
			start: pos.start,
			end: pos.end,
			filename: this.options.filename
		});
	}

	warn(
		pos: {
			start: number,
			end: number
		},
		warning: {
			code: string,
			message: string
		}
	) {
		if (!this.locator) {
			this.locator = getLocator(this.source, { offsetLine: 1 });
		}

		const start = this.locator(pos.start);
		const end = this.locator(pos.end);

		const frame = getCodeFrame(this.source, start.line - 1, start.column);

		this.stats.warn({
			code: warning.code,
			message: warning.message,
			frame,
			start,
			end,
			pos: pos.start,
			filename: this.options.filename,
			toString: () => `${warning.message} (${start.line + 1}:${start.column})\n${frame}`,
		});
	}

	walkJs() {
		const { js } = this.ast;
		if (!js) return;

		this.addSourcemapLocations(js.content);

		const { code, source, imports } = this;

		const indent = code.getIndentString();
		code.indent(indent, {
			exclude: [
				[0, js.content.start],
				[js.content.end, source.length]
			]
		});

		let { scope, map, globals } = createScopes(js.content);
		this.scope = scope;

		scope.declarations.forEach(name => {
			this.userVars.add(name);
			this.declarations.push(name);
		});

		globals.forEach(name => {
			this.userVars.add(name);
		});

		const body = js.content.body.slice(); // slice, because we're going to be mutating the original

		body.forEach(node => {
			if (node.type === 'ExportDefaultDeclaration') {
				this.error(node, {
					code: `default-export`,
					message: `A component cannot have a default export`
				})
			}

			if (node.type === 'ExportNamedDeclaration') {
				if (node.declaration) {
					if (node.declaration.type === 'VariableDeclaration') {
						node.declaration.declarations.forEach(declarator => {
							extractNames(declarator.id).forEach(name => {
								this.exports.push({ name, as: name });
							});
						});
					} else {
						const { name } = node.declaration.id;
						this.exports.push({ name, as: name });
					}

					code.remove(node.start, node.declaration.start);
				} else {
					node.specifiers.forEach(specifier => {
						this.exports.push({
							name: specifier.local.name,
							as: specifier.exported.name
						});
					});
				}
			}

			// imports need to be hoisted out of the IIFE
			// TODO hoist other stuff where possible
			else if (node.type === 'ImportDeclaration') {
				removeNode(code, js.content, node);
				imports.push(node);

				node.specifiers.forEach((specifier: Node) => {
					this.userVars.add(specifier.local.name);
					this.declarations.push(specifier.local.name); // TODO we don't really want this, but it's convenient for now
				});
			}
		});

		const top_scope = scope;

		walk(js.content, {
			enter: (node, parent) => {
				if (map.has(node)) {
					scope = map.get(node);
				}

				if (node.type === 'AssignmentExpression') {
					const { name } = flattenReference(node.left);

					if (scope.findOwner(name) === top_scope) {
						this.instrument(node, parent, name);
					}
				}
			},

			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		});

		let a = js.content.start;
		while (/\s/.test(source[a])) a += 1;

		let b = js.content.end;
		while (/\s/.test(source[b - 1])) b -= 1;

		this.javascript = a !== b ? `[✂${a}-${b}✂]` : '';
	}

	instrument(node, parent, name) {
		// TODO only make values reactive if they're used
		// in the template

		if (parent.type === 'ArrowFunctionExpression' && node === parent.body) {
			// TODO don't do the $$result dance if this is an event handler
			this.code.prependRight(node.start, `{ const $$result = `);
			this.code.appendLeft(node.end, `; $$make_dirty('${name}'); return $$result; }`);
		}

		else {
			this.code.appendLeft(node.end, `; $$make_dirty('${name}')`);
		}
	}
}

type Meta = {
	namespace?: string;
	tag?: string;
	immutable?: boolean;
};

function process_meta(component, nodes) {
	const meta: Meta = {};
	const node = nodes.find(node => node.name === 'svelte:meta');

	if (node) {
		node.attributes.forEach(attribute => {
			if (attribute.type !== 'Attribute') {
				// TODO implement bindings on <svelte:meta>
				component.error(attribute, {
					code: `invalid-meta-attribute`,
					message: `<svelte:meta> can only have 'tag' and 'namespace' attributes`
				});
			}

			const { name, value } = attribute;

			if (value.length > 1 || (value[0] && value[0].type !== 'Text')) {
				component.error(attribute, {
					code: `invalid-meta-attribute`,
					message: `<svelte:meta> cannot have dynamic attributes`
				});
			}

			const { data } = value[0];

			switch (name) {
				case 'tag':
				case 'namespace':
					if (!data) {
						component.error(attribute, {
							code: `invalid-meta-attribute`,
							message: `<svelte:meta> ${name} attribute must have a string value`
						});
					}

					meta[name] = data;
					break;

				case 'immutable':
					if (data && (data !== 'true' && data !== 'false')) {
						component.error(attribute, {
							code: `invalid-meta-attribute`,
							message: `<svelte:meta> immutable attribute must be true or false`
						});
					}

					meta.immutable = data !== 'false';

				default:
					component.error(attribute, {
						code: `invalid-meta-attribute`,
						message: `<svelte:meta> unknown attribute`
					});
			}
		});
	}

	return meta;
}