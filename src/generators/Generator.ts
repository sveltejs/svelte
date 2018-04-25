import MagicString, { Bundle } from 'magic-string';
import isReference from 'is-reference';
import { walk, childKeys } from 'estree-walker';
import { getLocator } from 'locate-character';
import Stats from '../Stats';
import deindent from '../utils/deindent';
import CodeBuilder from '../utils/CodeBuilder';
import flattenReference from '../utils/flattenReference';
import reservedNames from '../utils/reservedNames';
import namespaces from '../utils/namespaces';
import { removeNode, removeObjectKey } from '../utils/removeNode';
import nodeToString from '../utils/nodeToString';
import wrapModule from './wrapModule';
import annotateWithScopes, { Scope } from '../utils/annotateWithScopes';
import getName from '../utils/getName';
import clone from '../utils/clone';
import Stylesheet from '../css/Stylesheet';
import { test } from '../config';
import nodes from './nodes/index';
import Fragment from './nodes/Fragment';
import { Node, GenerateOptions, ShorthandImport, Parsed, CompileOptions, CustomElementOptions } from '../interfaces';

interface Computation {
	key: string;
	deps: string[]
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

export default class Generator {
	stats: Stats;

	ast: Parsed;
	parsed: Parsed;
	source: string;
	name: string;
	options: CompileOptions;
	fragment: Fragment;

	customElement: CustomElementOptions;
	tag: string;
	props: string[];

	defaultExport: Node[];
	imports: Node[];
	shorthandImports: ShorthandImport[];
	helpers: Set<string>;
	components: Set<string>;
	events: Set<string>;
	methods: Set<string>;
	transitions: Set<string>;
	actions: Set<string>;
	importedComponents: Map<string, string>;
	namespace: string;
	hasComponents: boolean;
	computations: Computation[];
	templateProperties: Record<string, Node>;
	slots: Set<string>;
	javascript: string;

	code: MagicString;

	bindingGroups: string[];
	indirectDependencies: Map<string, Set<string>>;
	expectedProperties: Set<string>;
	usesRefs: boolean;

	locate: (c: number) => { line: number, column: number };

	stylesheet: Stylesheet;

	userVars: Set<string>;
	templateVars: Map<string, string>;
	aliases: Map<string, string>;
	usedNames: Set<string>;

	constructor(
		parsed: Parsed,
		source: string,
		name: string,
		stylesheet: Stylesheet,
		options: CompileOptions,
		stats: Stats,
		dom: boolean
	) {
		stats.start('compile');
		this.stats = stats;

		this.ast = clone(parsed);

		this.parsed = parsed;
		this.source = source;
		this.options = options;

		this.imports = [];
		this.shorthandImports = [];
		this.helpers = new Set();
		this.components = new Set();
		this.events = new Set();
		this.methods = new Set();
		this.transitions = new Set();
		this.actions = new Set();
		this.importedComponents = new Map();
		this.slots = new Set();

		this.bindingGroups = [];
		this.indirectDependencies = new Map();

		this.locate = getLocator(this.source);

		// track which properties are needed, so we can provide useful info
		// in dev mode
		this.expectedProperties = new Set();

		this.code = new MagicString(source);
		this.usesRefs = false;

		// styles
		this.stylesheet = stylesheet;

		// allow compiler to deconflict user's `import { get } from 'whatever'` and
		// Svelte's builtin `import { get, ... } from 'svelte/shared.ts'`;
		this.userVars = new Set();
		this.templateVars = new Map();
		this.aliases = new Map();
		this.usedNames = new Set();

		this.computations = [];
		this.templateProperties = {};

		this.walkJs(dom);
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

		this.fragment = new Fragment(this, parsed.html);
		// this.walkTemplate();
		if (!this.customElement) this.stylesheet.reify();
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

	generate(result: string, options: CompileOptions, { banner = '', sharedPath, helpers, name, format }: GenerateOptions ) {
		const pattern = /\[✂(\d+)-(\d+)$/;

		const module = wrapModule(result, format, name, options, banner, sharedPath, helpers, this.imports, this.shorthandImports, this.source);

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

		this.stats.stop('compile');

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

	getUniqueNameMaker(names: string[]) {
		const localUsedNames = new Set();

		function add(name: string) {
			localUsedNames.add(name);
		}

		reservedNames.forEach(add);
		this.userVars.forEach(add);
		names.forEach(add);

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

	walkJs(dom: boolean) {
		const {
			code,
			source,
			computations,
			methods,
			templateProperties,
			imports
		} = this;

		const { js } = this.parsed;

		const componentDefinition = new CodeBuilder();

		if (js) {
			this.addSourcemapLocations(js.content);

			const indentation = detectIndentation(source.slice(js.start, js.end));
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

			// imports need to be hoisted out of the IIFE
			for (let i = 0; i < body.length; i += 1) {
				const node = body[i];
				if (node.type === 'ImportDeclaration') {
					removeNode(code, js.content, node);
					imports.push(node);

					node.specifiers.forEach((specifier: Node) => {
						this.userVars.add(specifier.local.name);
					});
				}
			}

			const defaultExport = this.defaultExport = body.find(
				(node: Node) => node.type === 'ExportDefaultDeclaration'
			);

			if (defaultExport) {
				defaultExport.declaration.properties.forEach((prop: Node) => {
					templateProperties[getName(prop.key)] = prop;
				});

				['helpers', 'events', 'components', 'transitions', 'actions'].forEach(key => {
					if (templateProperties[key]) {
						templateProperties[key].value.properties.forEach((prop: Node) => {
							this[key].add(getName(prop.key));
						});
					}
				});

				const addArrowFunctionExpression = (name: string, node: Node) => {
					const { body, params, async } = node;
					const fnKeyword = async ? 'async function' : 'function';

					const paramString = params.length ?
						`[✂${params[0].start}-${params[params.length - 1].end}✂]` :
						``;

					if (body.type === 'BlockStatement') {
						componentDefinition.addBlock(deindent`
							${fnKeyword} ${name}(${paramString}) [✂${body.start}-${body.end}✂]
						`);
					} else {
						componentDefinition.addBlock(deindent`
							${fnKeyword} ${name}(${paramString}) {
								return [✂${body.start}-${body.end}✂];
							}
						`);
					}
				};

				const addFunctionExpression = (name: string, node: Node) => {
					const { async } = node;
					const fnKeyword = async ? 'async function' : 'function';

					let c = node.start;
					while (this.source[c] !== '(') c += 1;
					componentDefinition.addBlock(deindent`
						${fnKeyword} ${name}[✂${c}-${node.end}✂];
					`);
				};

				const addValue = (name: string, node: Node) => {
					componentDefinition.addBlock(deindent`
						var ${name} = [✂${node.start}-${node.end}✂];
					`);
				};

				const addDeclaration = (key: string, node: Node, allowShorthandImport?: boolean, disambiguator?: string, conflicts?: Record<string, boolean>) => {
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
						addArrowFunctionExpression(name, node);
					} else if (node.type === 'FunctionExpression') {
						addFunctionExpression(name, node);
					} else {
						addValue(name, node);
					}
				};

				if (templateProperties.components) {
					templateProperties.components.value.properties.forEach((property: Node) => {
						addDeclaration(getName(property.key), property.value, true, 'components');
					});
				}

				if (templateProperties.computed) {
					const dependencies = new Map();

					templateProperties.computed.value.properties.forEach((prop: Node) => {
						const key = getName(prop.key);
						const value = prop.value;

						const deps = value.params[0].properties.map(prop => prop.key.name);

						deps.forEach(dep => {
							this.expectedProperties.add(dep);
						});
						dependencies.set(key, deps);
					});

					const visited = new Set();

					const visit = (key: string) => {
						if (!dependencies.has(key)) return; // not a computation

						if (visited.has(key)) return;
						visited.add(key);

						const deps = dependencies.get(key);
						deps.forEach(visit);

						computations.push({ key, deps });

						const prop = templateProperties.computed.value.properties.find((prop: Node) => getName(prop.key) === key);

						addDeclaration(key, prop.value, false, 'computed', {
							state: true,
							changed: true
						});
					};

					templateProperties.computed.value.properties.forEach((prop: Node) =>
						visit(getName(prop.key))
					);
				}

				if (templateProperties.data) {
					addDeclaration('data', templateProperties.data.value);
				}

				if (templateProperties.events && dom) {
					templateProperties.events.value.properties.forEach((property: Node) => {
						addDeclaration(getName(property.key), property.value, false, 'events');
					});
				}

				if (templateProperties.helpers) {
					templateProperties.helpers.value.properties.forEach((property: Node) => {
						addDeclaration(getName(property.key), property.value, false, 'helpers');
					});
				}

				if (templateProperties.methods && dom) {
					addDeclaration('methods', templateProperties.methods.value);

					templateProperties.methods.value.properties.forEach(prop => {
						this.methods.add(prop.key.name);
					});
				}

				if (templateProperties.namespace) {
					const ns = nodeToString(templateProperties.namespace.value);
					this.namespace = namespaces[ns] || ns;
				}

				if (templateProperties.oncreate && dom) {
					addDeclaration('oncreate', templateProperties.oncreate.value);
				}

				if (templateProperties.ondestroy && dom) {
					addDeclaration('ondestroy', templateProperties.ondestroy.value);
				}

				if (templateProperties.onstate && dom) {
					addDeclaration('onstate', templateProperties.onstate.value);
				}

				if (templateProperties.onupdate && dom) {
					addDeclaration('onupdate', templateProperties.onupdate.value);
				}

				if (templateProperties.preload) {
					addDeclaration('preload', templateProperties.preload.value);
				}

				if (templateProperties.props) {
					this.props = templateProperties.props.value.elements.map((element: Node) => nodeToString(element));
				}

				if (templateProperties.setup) {
					addDeclaration('setup', templateProperties.setup.value);
				}

				if (templateProperties.store) {
					addDeclaration('store', templateProperties.store.value);
				}

				if (templateProperties.tag) {
					this.tag = nodeToString(templateProperties.tag.value);
				}

				if (templateProperties.transitions) {
					templateProperties.transitions.value.properties.forEach((property: Node) => {
						addDeclaration(getName(property.key), property.value, false, 'transitions');
					});
				}

				if (templateProperties.actions) {
					templateProperties.actions.value.properties.forEach((property: Node) => {
						addDeclaration(getName(property.key), property.value, false, 'actions');
					});
				}
			}

			if (indentationLevel) {
				if (defaultExport) {
					removeIndentation(code, js.content.start, defaultExport.start, indentationLevel, indentExclusionRanges);
					removeIndentation(code, defaultExport.end, js.content.end, indentationLevel, indentExclusionRanges);
				} else {
					removeIndentation(code, js.content.start, js.content.end, indentationLevel, indentExclusionRanges);
				}
			}

			let a = js.content.start;
			while (/\s/.test(source[a])) a += 1;

			let b = js.content.end;
			while (/\s/.test(source[b - 1])) b -= 1;

			if (defaultExport) {
				this.javascript = '';
				if (a !== defaultExport.start) this.javascript += `[✂${a}-${defaultExport.start}✂]`;
				if (!componentDefinition.isEmpty()) this.javascript += componentDefinition;
				if (defaultExport.end !== b) this.javascript += `[✂${defaultExport.end}-${b}✂]`;
			} else {
				this.javascript = a === b ? null : `[✂${a}-${b}✂]`;
			}
		}
	}
}
