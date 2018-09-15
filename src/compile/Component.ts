import { parseExpressionAt } from 'acorn';
import MagicString, { Bundle } from 'magic-string';
import isReference from 'is-reference';
import { walk, childKeys } from 'estree-walker';
import { getLocator } from 'locate-character';
import Stats from '../Stats';
import deindent from '../utils/deindent';
import CodeBuilder from '../utils/CodeBuilder';
import reservedNames from '../utils/reservedNames';
import namespaces from '../utils/namespaces';
import { removeNode } from '../utils/removeNode';
import nodeToString from '../utils/nodeToString';
import wrapModule from './wrapModule';
import annotateWithScopes from '../utils/annotateWithScopes';
import getName from '../utils/getName';
import Stylesheet from '../css/Stylesheet';
import { test } from '../config';
import Fragment from './nodes/Fragment';
import shared from './shared';
import { DomTarget } from './dom';
import { SsrTarget } from './ssr';
import { Node, GenerateOptions, ShorthandImport, Ast, CompileOptions, CustomElementOptions } from '../interfaces';
import error from '../utils/error';
import getCodeFrame from '../utils/getCodeFrame';
import checkForComputedKeys from './validate/js/utils/checkForComputedKeys';
import checkForDupes from './validate/js/utils/checkForDupes';
import propValidators from './validate/js/propValidators';
import fuzzymatch from './validate/utils/fuzzymatch';
import flattenReference from '../utils/flattenReference';

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

function removeIndentation(
	code: MagicString,
	start: number,
	end: number,
	indentationLevel: string,
	ranges: Node[]
) {
	const str = code.original.slice(start, end);
	const pattern = new RegExp(`^${indentationLevel}`, 'gm');
	let match;

	while (match = pattern.exec(str)) {
		// TODO bail if we're inside an exclusion range
		code.remove(start + match.index, start + match.index + indentationLevel.length);
	}
}

// We need to tell estree-walker that it should always
// look for an `else` block, otherwise it might get
// the wrong idea about the shape of each/if blocks
childKeys.EachBlock = childKeys.IfBlock = ['children', 'else'];
childKeys.Attribute = ['value'];

export default class Component {
	stats: Stats;

	ast: Ast;
	source: string;
	name: string;
	options: CompileOptions;
	fragment: Fragment;
	target: DomTarget | SsrTarget;

	customElement: CustomElementOptions;
	tag: string;
	props: string[];

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
	importedComponents: Map<string, string>;
	namespace: string;
	hasComponents: boolean;
	computations: Computation[];
	templateProperties: Record<string, Node>;
	slots: Set<string>;
	javascript: [string, string];

	used: {
		components: Set<string>;
		helpers: Set<string>;
		events: Set<string>;
		animations: Set<string>;
		transitions: Set<string>;
		actions: Set<string>;
	};

	declarations: Declaration[];

	refCallees: Node[];

	code: MagicString;

	bindingGroups: string[];
	indirectDependencies: Map<string, Set<string>>;
	expectedProperties: Set<string>;
	refs: Set<string>;

	file: string;
	fileVar: string;
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
		stats: Stats,
		target: DomTarget | SsrTarget
	) {
		this.stats = stats;

		this.ast = ast;
		this.source = source;
		this.options = options;
		this.target = target;

		this.imports = [];
		this.shorthandImports = [];
		this.helpers = new Set();
		this.components = new Set();
		this.events = new Set();
		this.methods = new Set();
		this.animations = new Set();
		this.transitions = new Set();
		this.actions = new Set();
		this.importedComponents = new Map();
		this.slots = new Set();

		this.used = {
			components: new Set(),
			helpers: new Set(),
			events: new Set(),
			animations: new Set(),
			transitions: new Set(),
			actions: new Set(),
		};

		this.declarations = [];

		this.refs = new Set();
		this.refCallees = [];

		this.bindingGroups = [];
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

		// allow compiler to deconflict user's `import { get } from 'whatever'` and
		// Svelte's builtin `import { get, ... } from 'svelte/shared.ts'`;
		this.userVars = new Set();
		this.templateVars = new Map();
		this.aliases = new Map();
		this.usedNames = new Set();

		this.fileVar = options.dev && this.getUniqueName('file');

		this.computations = [];
		this.templateProperties = {};
		this.properties = new Map();

		this.walkJs();
		this.name = this.alias(name);

		if (options.customElement === true) {
			this.customElement = {
				tag: this.tag,
				props: this.props
			}
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

		if (this.defaultExport) {
			const categories = {
				components: 'component',
				helpers: 'helper',
				events: 'event definition',
				transitions: 'transition',
				actions: 'actions',
			};

			Object.keys(categories).forEach(category => {
				const definitions = this.defaultExport.declaration.properties.find(prop => prop.key.name === category);
				if (definitions) {
					definitions.value.properties.forEach(prop => {
						const { name } = prop.key;
						if (!this.used[category].has(name)) {
							this.warn(prop, {
								code: `unused-${category.slice(0, -1)}`,
								message: `The '${name}' ${categories[category]} is unused`
							});
						}
					});
				}
			});
		}

		this.refCallees.forEach(callee => {
			const { parts } = flattenReference(callee);
			const ref = parts[1];

			if (this.refs.has(ref)) {
				// TODO check method is valid, e.g. `audio.stop()` should be `audio.pause()`
			} else {
				const match = fuzzymatch(ref, Array.from(this.refs.keys()));

				let message = `'refs.${ref}' does not exist`;
				if (match) message += ` (did you mean 'refs.${match}'?)`;

				this.error(callee, {
					code: `missing-ref`,
					message
				});
			}
		});
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

	generate(result: string, options: CompileOptions, { banner = '', name, format }: GenerateOptions ) {
		const pattern = /\[✂(\d+)-(\d+)$/;

		const helpers = new Set();

		// TODO use same regex for both
		result = result.replace(options.generate === 'ssr' ? /(@+|#+|%+)(\w*(?:-\w*)?)/g : /(%+|@+)(\w*(?:-\w*)?)/g, (match: string, sigil: string, name: string) => {
			if (sigil === '@') {
				if (name in shared) {
					if (options.dev && `${name}Dev` in shared) name = `${name}Dev`;
					helpers.add(name);
				}

				return this.alias(name);
			}

			if (sigil === '%') {
				return this.templateVars.get(name);
			}

			return sigil.slice(1) + name;
		});

		let importedHelpers;

		if (options.shared) {
			if (format !== 'es' && format !== 'cjs') {
				throw new Error(`Components with shared helpers must be compiled with \`format: 'es'\` or \`format: 'cjs'\``);
			}

			importedHelpers = Array.from(helpers).sort().map(name => {
				const alias = this.alias(name);
				return { name, alias };
			});
		} else {
			let inlineHelpers = '';

			const component = this;

			importedHelpers = [];

			helpers.forEach(name => {
				const str = shared[name];
				const code = new MagicString(str);
				const expression = parseExpressionAt(str, 0);

				let { scope } = annotateWithScopes(expression);

				walk(expression, {
					enter(node: Node, parent: Node) {
						if (node._scope) scope = node._scope;

						if (
							node.type === 'Identifier' &&
							isReference(node, parent) &&
							!scope.has(node.name)
						) {
							if (node.name in shared) {
								// this helper function depends on another one
								const dependency = node.name;
								helpers.add(dependency);

								const alias = component.alias(dependency);
								if (alias !== node.name) {
									code.overwrite(node.start, node.end, alias);
								}
							}
						}
					},

					leave(node: Node) {
						if (node._scope) scope = scope.parent;
					},
				});

				if (name === 'transitionManager' || name === 'outros') {
					// special case
					const global = name === 'outros'
						? `_svelteOutros`
						: `_svelteTransitionManager`;

					inlineHelpers += `\n\nvar ${this.alias(name)} = window.${global} || (window.${global} = ${code});\n\n`;
				} else if (name === 'escaped' || name === 'missingComponent' || name === 'invalidAttributeNameCharacter') {
					// vars are an awkward special case... would be nice to avoid this
					const alias = this.alias(name);
					inlineHelpers += `\n\nconst ${alias} = ${code};`
				} else {
					const alias = this.alias(expression.id.name);
					if (alias !== expression.id.name) {
						code.overwrite(expression.id.start, expression.id.end, alias);
					}

					inlineHelpers += `\n\n${code}`;
				}
			});

			result += inlineHelpers;
		}

		const sharedPath = options.shared === true
			? 'svelte/shared.js'
			: options.shared || '';

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

	processDefaultExport(node, indentExclusionRanges) {
		const { templateProperties, source, code } = this;

		if (node.declaration.type !== 'ObjectExpression') {
			this.error(node.declaration, {
				code: `invalid-default-export`,
				message: `Default export must be an object literal`
			});
		}

		checkForComputedKeys(this, node.declaration.properties);
		checkForDupes(this, node.declaration.properties);

		const props = this.properties;

		node.declaration.properties.forEach((prop: Node) => {
			props.set(getName(prop.key), prop);
		});

		const validPropList = Object.keys(propValidators);

		// ensure all exported props are valid
		node.declaration.properties.forEach((prop: Node) => {
			const name = getName(prop.key);
			const propValidator = propValidators[name];

			if (propValidator) {
				propValidator(this, prop);
			} else {
				const match = fuzzymatch(name, validPropList);
				if (match) {
					this.error(prop, {
						code: `unexpected-property`,
						message: `Unexpected property '${name}' (did you mean '${match}'?)`
					});
				} else if (/FunctionExpression/.test(prop.value.type)) {
					this.error(prop, {
						code: `unexpected-property`,
						message: `Unexpected property '${name}' (did you mean to include it in 'methods'?)`
					});
				} else {
					this.error(prop, {
						code: `unexpected-property`,
						message: `Unexpected property '${name}'`
					});
				}
			}
		});

		if (props.has('namespace')) {
			const ns = nodeToString(props.get('namespace').value);
			this.namespace = namespaces[ns] || ns;
		}

		node.declaration.properties.forEach((prop: Node) => {
			templateProperties[getName(prop.key)] = prop;
		});

		['helpers', 'events', 'components', 'transitions', 'actions', 'animations'].forEach(key => {
			if (templateProperties[key]) {
				templateProperties[key].value.properties.forEach((prop: Node) => {
					this[key].add(getName(prop.key));
				});
			}
		});

		const addArrowFunctionExpression = (type: string, name: string, node: Node) => {
			const { body, params, async } = node;
			const fnKeyword = async ? 'async function' : 'function';

			const paramString = params.length ?
				`[✂${params[0].start}-${params[params.length - 1].end}✂]` :
				``;

			const block = body.type === 'BlockStatement'
				? deindent`
					${fnKeyword} ${name}(${paramString}) [✂${body.start}-${body.end}✂]
				`
				: deindent`
					${fnKeyword} ${name}(${paramString}) {
						return [✂${body.start}-${body.end}✂];
					}
				`;

			this.declarations.push({ type, name, block, node });
		};

		const addFunctionExpression = (type: string, name: string, node: Node) => {
			const { async } = node;
			const fnKeyword = async ? 'async function' : 'function';

			let c = node.start;
			while (this.source[c] !== '(') c += 1;

			const block = deindent`
				${fnKeyword} ${name}[✂${c}-${node.end}✂];
			`;

			this.declarations.push({ type, name, block, node });
		};

		const addValue = (type: string, name: string, node: Node) => {
			const block = deindent`
				var ${name} = [✂${node.start}-${node.end}✂];
			`;

			this.declarations.push({ type, name, block, node });
		};

		const addDeclaration = (
			type: string,
			key: string,
			node: Node,
			allowShorthandImport?: boolean,
			disambiguator?: string,
			conflicts?: Record<string, boolean>
		) => {
			const qualified = disambiguator ? `${disambiguator}-${key}` : key;

			if (node.type === 'Identifier' && node.name === key) {
				this.templateVars.set(qualified, key);
				return;
			}

			let deconflicted = key;
			if (conflicts) while (deconflicted in conflicts) deconflicted += '_'

			let name = this.getUniqueName(deconflicted);
			this.templateVars.set(qualified, name);

			if (allowShorthandImport && node.type === 'Literal' && typeof node.value === 'string') {
				this.shorthandImports.push({ name, source: node.value });
				return;
			}

			// deindent
			const indentationLevel = getIndentationLevel(source, node.start);
			if (indentationLevel) {
				removeIndentation(code, node.start, node.end, indentationLevel, indentExclusionRanges);
			}

			if (node.type === 'ArrowFunctionExpression') {
				addArrowFunctionExpression(type, name, node);
			} else if (node.type === 'FunctionExpression') {
				addFunctionExpression(type, name, node);
			} else {
				addValue(type, name, node);
			}
		};

		if (templateProperties.components) {
			templateProperties.components.value.properties.forEach((property: Node) => {
				addDeclaration('components', getName(property.key), property.value, true, 'components');
			});
		}

		if (templateProperties.computed) {
			const dependencies = new Map();

			const fullStateComputations = [];

			templateProperties.computed.value.properties.forEach((prop: Node) => {
				const key = getName(prop.key);
				const value = prop.value;

				addDeclaration('computed', key, value, false, 'computed', {
					state: true,
					changed: true
				});

				const param = value.params[0];

				const hasRestParam = (
					param.properties &&
					param.properties.some(prop => prop.type === 'RestElement')
				);

				if (param.type !== 'ObjectPattern' || hasRestParam) {
					fullStateComputations.push({ key, deps: null, hasRestParam });
				} else {
					const deps = param.properties.map(prop => prop.key.name);

					deps.forEach(dep => {
						this.expectedProperties.add(dep);
					});
					dependencies.set(key, deps);
				}
			});

			const visited = new Set();

			const visit = (key: string) => {
				if (!dependencies.has(key)) return; // not a computation

				if (visited.has(key)) return;
				visited.add(key);

				const deps = dependencies.get(key);
				deps.forEach(visit);

				this.computations.push({ key, deps, hasRestParam: false });

				const prop = templateProperties.computed.value.properties.find((prop: Node) => getName(prop.key) === key);
			};

			templateProperties.computed.value.properties.forEach((prop: Node) =>
				visit(getName(prop.key))
			);

			if (fullStateComputations.length > 0) {
				this.computations.push(...fullStateComputations);
			}
		}

		if (templateProperties.data) {
			addDeclaration('data', 'data', templateProperties.data.value);
		}

		if (templateProperties.events) {
			templateProperties.events.value.properties.forEach((property: Node) => {
				addDeclaration('events', getName(property.key), property.value, false, 'events');
			});
		}

		if (templateProperties.helpers) {
			templateProperties.helpers.value.properties.forEach((property: Node) => {
				addDeclaration('helpers', getName(property.key), property.value, false, 'helpers');
			});
		}

		if (templateProperties.methods) {
			addDeclaration('methods', 'methods', templateProperties.methods.value);

			templateProperties.methods.value.properties.forEach(property => {
				this.methods.add(getName(property.key));
			});
		}

		if (templateProperties.namespace) {
			const ns = nodeToString(templateProperties.namespace.value);
			this.namespace = namespaces[ns] || ns;
		}

		if (templateProperties.oncreate) {
			addDeclaration('oncreate', 'oncreate', templateProperties.oncreate.value);
		}

		if (templateProperties.ondestroy) {
			addDeclaration('ondestroy', 'ondestroy', templateProperties.ondestroy.value);
		}

		if (templateProperties.onstate) {
			addDeclaration('onstate', 'onstate', templateProperties.onstate.value);
		}

		if (templateProperties.onupdate) {
			addDeclaration('onupdate', 'onupdate', templateProperties.onupdate.value);
		}

		if (templateProperties.preload) {
			addDeclaration('preload', 'preload', templateProperties.preload.value);
		}

		if (templateProperties.props) {
			this.props = templateProperties.props.value.elements.map((element: Node) => nodeToString(element));
		}

		if (templateProperties.setup) {
			addDeclaration('setup', 'setup', templateProperties.setup.value);
		}

		if (templateProperties.store) {
			addDeclaration('store', 'store', templateProperties.store.value);
		}

		if (templateProperties.tag) {
			this.tag = nodeToString(templateProperties.tag.value);
		}

		if (templateProperties.transitions) {
			templateProperties.transitions.value.properties.forEach((property: Node) => {
				addDeclaration('transitions', getName(property.key), property.value, false, 'transitions');
			});
		}

		if (templateProperties.animations) {
			templateProperties.animations.value.properties.forEach((property: Node) => {
				addDeclaration('animations', getName(property.key), property.value, false, 'animations');
			});
		}

		if (templateProperties.actions) {
			templateProperties.actions.value.properties.forEach((property: Node) => {
				addDeclaration('actions', getName(property.key), property.value, false, 'actions');
			});
		}

		this.defaultExport = node;
	}

	walkJs() {
		const { js } = this.ast;
		if (!js) return;

		this.addSourcemapLocations(js.content);

		const { code, source, imports } = this;

		const indentationLevel = getIndentationLevel(source, js.content.body[0].start);
		const indentExclusionRanges = getIndentExclusionRanges(js.content);

		const { scope, globals } = annotateWithScopes(js.content);

		scope.declarations.forEach(name => {
			this.userVars.add(name);
		});

		globals.forEach(name => {
			this.userVars.add(name);
		});

		const body = js.content.body.slice(); // slice, because we're going to be mutating the original

		body.forEach(node => {
			// check there are no named exports
			if (node.type === 'ExportNamedDeclaration') {
				this.error(node, {
					code: `named-export`,
					message: `A component can only have a default export`
				});
			}

			if (node.type === 'ExportDefaultDeclaration') {
				this.processDefaultExport(node, indentExclusionRanges);
			}

			// imports need to be hoisted out of the IIFE
			else if (node.type === 'ImportDeclaration') {
				removeNode(code, js.content, node);
				imports.push(node);

				node.specifiers.forEach((specifier: Node) => {
					this.userVars.add(specifier.local.name);
				});
			}
		});

		if (indentationLevel) {
			if (this.defaultExport) {
				removeIndentation(code, js.content.start, this.defaultExport.start, indentationLevel, indentExclusionRanges);
				removeIndentation(code, this.defaultExport.end, js.content.end, indentationLevel, indentExclusionRanges);
			} else {
				removeIndentation(code, js.content.start, js.content.end, indentationLevel, indentExclusionRanges);
			}
		}

		let a = js.content.start;
		while (/\s/.test(source[a])) a += 1;

		let b = js.content.end;
		while (/\s/.test(source[b - 1])) b -= 1;

		this.javascript = this.defaultExport
			? [
				a !== this.defaultExport.start ? `[✂${a}-${this.defaultExport.start}✂]` : '',
				b !== this.defaultExport.end ?`[✂${this.defaultExport.end}-${b}✂]` : ''
			]
			: [
				a !== b ? `[✂${a}-${b}✂]` : '',
				''
			];
	}
}
