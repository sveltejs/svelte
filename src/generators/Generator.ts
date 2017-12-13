import MagicString, { Bundle } from 'magic-string';
import { walk, childKeys } from 'estree-walker';
import { getLocator } from 'locate-character';
import deindent from '../utils/deindent';
import CodeBuilder from '../utils/CodeBuilder';
import getCodeFrame from '../utils/getCodeFrame';
import isReference from '../utils/isReference';
import flattenReference from '../utils/flattenReference';
import reservedNames from '../utils/reservedNames';
import namespaces from '../utils/namespaces';
import { removeNode, removeObjectKey } from '../utils/removeNode';
import wrapModule from './wrapModule';
import annotateWithScopes, { Scope } from '../utils/annotateWithScopes';
import getName from '../utils/getName';
import clone from '../utils/clone';
import Stylesheet from '../css/Stylesheet';
import { test } from '../config';
import nodes from './nodes/index';
import { Node, GenerateOptions, Parsed, CompileOptions, CustomElementOptions } from '../interfaces';

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
	ast: Parsed;
	parsed: Parsed;
	source: string;
	name: string;
	options: CompileOptions;

	customElement: CustomElementOptions;
	tag: string;
	props: string[];

	defaultExport: Node[];
	imports: Node[];
	helpers: Set<string>;
	components: Set<string>;
	events: Set<string>;
	transitions: Set<string>;
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
		dom: boolean
	) {
		this.ast = clone(parsed);

		this.parsed = parsed;
		this.source = source;
		this.options = options;

		this.imports = [];
		this.helpers = new Set();
		this.components = new Set();
		this.events = new Set();
		this.transitions = new Set();
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
				props: this.props // TODO autofill this in
			}
		} else {
			this.customElement = options.customElement;
		}

		if (this.customElement && !this.customElement.tag) {
			throw new Error(`No tag name specified`); // TODO better error
		}

		this.walkTemplate();
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

	contextualise(
		contexts: Map<string, string>,
		indexes: Map<string, string>,
		expression: Node,
		context: string,
		isEventHandler: boolean
	): {
		contexts: Set<string>,
		indexes: Set<string>
	} {
		// this.addSourcemapLocations(expression);

		const usedContexts: Set<string> = new Set();
		const usedIndexes: Set<string> = new Set();

		const { code, helpers } = this;

		let scope: Scope;
		let lexicalDepth = 0;

		const self = this;

		walk(expression, {
			enter(node: Node, parent: Node, key: string) {
				if (/^Function/.test(node.type)) lexicalDepth += 1;

				if (node._scope) {
					scope = node._scope;
					return;
				}

				if (node.type === 'ThisExpression') {
					if (lexicalDepth === 0 && context)
						code.overwrite(node.start, node.end, context, {
							storeName: true,
							contentOnly: false,
						});
				} else if (isReference(node, parent)) {
					const { name } = flattenReference(node);
					if (scope && scope.has(name)) return;

					if (name === 'event' && isEventHandler) {
						// noop
					} else if (contexts.has(name)) {
						const contextName = contexts.get(name);
						if (contextName !== name) {
							// this is true for 'reserved' names like `state` and `component`
							code.overwrite(
								node.start,
								node.start + name.length,
								contextName,
								{ storeName: true, contentOnly: false }
							);
						}

						usedContexts.add(name);
					} else if (helpers.has(name)) {
						let object = node;
						while (object.type === 'MemberExpression') object = object.object;

						const alias = self.templateVars.get(`helpers-${name}`);
						if (alias !== name) code.overwrite(object.start, object.end, alias);
					} else if (indexes.has(name)) {
						const context = indexes.get(name);
						usedContexts.add(context); // TODO is this right?
						usedIndexes.add(name);
					} else {
						// handle shorthand properties
						if (parent && parent.type === 'Property' && parent.shorthand) {
							if (key === 'key') {
								code.appendLeft(node.start, `${name}: `);
								return;
							}
						}

						code.prependRight(node.start, `state.`);
						usedContexts.add('state');
					}

					this.skip();
				}
			},

			leave(node: Node) {
				if (/^Function/.test(node.type)) lexicalDepth -= 1;
				if (node._scope) scope = scope.parent;
			},
		});

		return {
			contexts: usedContexts,
			indexes: usedIndexes
		};
	}

	generate(result: string, options: CompileOptions, { banner = '', sharedPath, helpers, name, format }: GenerateOptions ) {
		const pattern = /\[✂(\d+)-(\d+)$/;

		const module = wrapModule(result, format, name, options, banner, sharedPath, helpers, this.imports, this.source);

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

		const { css, cssMap } = this.customElement ?
			{ css: null, cssMap: null } :
			this.stylesheet.render(options.cssOutputFilename, true);

		return {
			ast: this.ast,
			code: compiled.toString(),
			map: compiled.generateMap({
				includeContent: true,
				file: options.outputFilename,
			}),
			css,
			cssMap
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

	getUniqueNameMaker(params: string[]) {
		const localUsedNames = new Set(params);

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

	walkJs(dom: boolean) {
		const {
			code,
			source,
			computations,
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

			const scope = annotateWithScopes(js.content);
			scope.declarations.forEach(name => {
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

				['helpers', 'events', 'components', 'transitions'].forEach(key => {
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

				const addDeclaration = (key: string, node: Node, disambiguator?: string, conflicts?: Record<string, boolean>) => {
					const qualified = disambiguator ? `${disambiguator}-${key}` : key;

					if (node.type === 'Identifier' && node.name === key) {
						this.templateVars.set(qualified, key);
						return;
					}

					let deconflicted = key;
					if (conflicts) while (deconflicted in conflicts) deconflicted += '_'

					let name = this.getUniqueName(deconflicted);
					this.templateVars.set(qualified, name);

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
						addDeclaration(getName(property.key), property.value, 'components');
					});
				}

				if (templateProperties.computed) {
					const dependencies = new Map();

					templateProperties.computed.value.properties.forEach((prop: Node) => {
						const key = getName(prop.key);
						const value = prop.value;

						const deps = value.params.map(
							(param: Node) =>
								param.type === 'AssignmentPattern' ? param.left.name : param.name
						);
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

						addDeclaration(key, prop.value, 'computed', {
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
						addDeclaration(getName(property.key), property.value, 'events');
					});
				}

				if (templateProperties.helpers) {
					templateProperties.helpers.value.properties.forEach((property: Node) => {
						addDeclaration(getName(property.key), property.value, 'helpers');
					});
				}

				if (templateProperties.methods && dom) {
					addDeclaration('methods', templateProperties.methods.value);
				}

				if (templateProperties.namespace) {
					const ns = templateProperties.namespace.value.value;
					this.namespace = namespaces[ns] || ns;
				}

				if (templateProperties.onrender) templateProperties.oncreate = templateProperties.onrender; // remove after v2
				if (templateProperties.oncreate && dom) {
					addDeclaration('oncreate', templateProperties.oncreate.value);
				}

				if (templateProperties.onteardown) templateProperties.ondestroy = templateProperties.onteardown; // remove after v2
				if (templateProperties.ondestroy && dom) {
					addDeclaration('ondestroy', templateProperties.ondestroy.value);
				}

				if (templateProperties.props) {
					this.props = templateProperties.props.value.elements.map((element: Node) => element.value);
				}

				if (templateProperties.setup) {
					addDeclaration('setup', templateProperties.setup.value);
				}

				if (templateProperties.tag) {
					this.tag = templateProperties.tag.value.value;
				}

				if (templateProperties.transitions) {
					templateProperties.transitions.value.properties.forEach((property: Node) => {
						addDeclaration(getName(property.key), property.value, 'transitions');
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

	walkTemplate() {
		const generator = this;
		const {
			code,
			expectedProperties,
			helpers
		} = this;
		const { html } = this.parsed;

		const contextualise = (
			node: Node, contextDependencies: Map<string, string[]>,
			indexes: Set<string>,
			isEventHandler: boolean
		) => {
			this.addSourcemapLocations(node); // TODO this involves an additional walk — can we roll it in somewhere else?
			let scope = annotateWithScopes(node);

			const dependencies: Set<string> = new Set();

			walk(node, {
				enter(node: Node, parent: Node) {
					code.addSourcemapLocation(node.start);
					code.addSourcemapLocation(node.end);

					if (node._scope) {
						scope = node._scope;
						return;
					}

					if (isReference(node, parent)) {
						const { name } = flattenReference(node);
						if (scope && scope.has(name) || helpers.has(name) || (name === 'event' && isEventHandler)) return;

						if (contextDependencies.has(name)) {
							contextDependencies.get(name).forEach(dependency => {
								dependencies.add(dependency);
							});
						} else if (!indexes.has(name)) {
							dependencies.add(name);
						}

						this.skip();
					}
				},

				leave(node: Node, parent: Node) {
					if (node._scope) scope = scope.parent;
				}
			});

			dependencies.forEach(dependency => {
				expectedProperties.add(dependency);
			});

			return {
				snippet: `[✂${node.start}-${node.end}✂]`,
				dependencies: Array.from(dependencies)
			};
		}

		const contextStack = [];
		const indexStack = [];
		const dependenciesStack = [];

		let contextDependencies = new Map();
		const contextDependenciesStack: Map<string, string[]>[] = [contextDependencies];

		let indexes = new Set();
		const indexesStack: Set<string>[] = [indexes];

		walk(html, {
			enter(node: Node, parent: Node, key: string) {
				// TODO this is hacky as hell
				if (key === 'parent') return this.skip();
				node.parent = parent;

				node.generator = generator;

				if (node.type === 'Element' && (node.name === ':Component' || node.name === ':Self' || generator.components.has(node.name))) {
					node.type = 'Component';
					node.__proto__ = nodes.Component.prototype;
				} else if (node.name === ':Window') { // TODO do this in parse?
					node.type = 'Window';
					node.__proto__ = nodes.Window.prototype;
				} else if (node.name === ':Document') { // TODO do this in parse?
					node.type = 'Document';
					node.__proto__ = nodes.Document.prototype;
				} else if (node.type === 'Element' && node.name === 'slot' && !generator.customElement) {
					node.type = 'Slot';
					node.__proto__ = nodes.Slot.prototype;
				} else if (node.type in nodes) {
					node.__proto__ = nodes[node.type].prototype;
				}

				if (node.type === 'Element') {
					generator.stylesheet.apply(node);
				}

				if (node.type === 'EachBlock') {
					node.metadata = contextualise(node.expression, contextDependencies, indexes, false);

					contextDependencies = new Map(contextDependencies);
					contextDependencies.set(node.context, node.metadata.dependencies);

					if (node.destructuredContexts) {
						for (let i = 0; i < node.destructuredContexts.length; i += 1) {
							const name = node.destructuredContexts[i];
							const value = `${node.context}[${i}]`;

							contextDependencies.set(name, node.metadata.dependencies);
						}
					}

					contextDependenciesStack.push(contextDependencies);

					if (node.index) {
						indexes = new Set(indexes);
						indexes.add(node.index);
						indexesStack.push(indexes);
					}
				}

				if (node.type === 'AwaitBlock') {
					node.metadata = contextualise(node.expression, contextDependencies, indexes, false);

					contextDependencies = new Map(contextDependencies);
					contextDependencies.set(node.value, node.metadata.dependencies);
					contextDependencies.set(node.error, node.metadata.dependencies);

					contextDependenciesStack.push(contextDependencies);
				}

				if (node.type === 'IfBlock') {
					node.metadata = contextualise(node.expression, contextDependencies, indexes, false);
				}

				if (node.type === 'MustacheTag' || node.type === 'RawMustacheTag' || node.type === 'AttributeShorthand') {
					node.metadata = contextualise(node.expression, contextDependencies, indexes, false);
					this.skip();
				}

				if (node.type === 'Binding') {
					node.metadata = contextualise(node.value, contextDependencies, indexes, false);
					this.skip();
				}

				if (node.type === 'EventHandler' && node.expression) {
					node.expression.arguments.forEach((arg: Node) => {
						arg.metadata = contextualise(arg, contextDependencies, indexes, true);
					});
					this.skip();
				}

				if (node.type === 'Transition' && node.expression) {
					node.metadata = contextualise(node.expression, contextDependencies, indexes, false);
					this.skip();
				}

				if (node.type === 'Component' && node.name === ':Component') {
					node.metadata = contextualise(node.expression, contextDependencies, indexes, false);
				}
			},

			leave(node: Node, parent: Node) {
				if (node.type === 'EachBlock') {
					contextDependenciesStack.pop();
					contextDependencies = contextDependenciesStack[contextDependenciesStack.length - 1];

					if (node.index) {
						indexesStack.pop();
						indexes = indexesStack[indexesStack.length - 1];
					}
				}

				if (node.type === 'Element' && node.name === 'option') {
					// Special case — treat these the same way:
					//   <option>{{foo}}</option>
					//   <option value='{{foo}}'>{{foo}}</option>
					const valueAttribute = node.attributes.find((attribute: Node) => attribute.name === 'value');

					if (!valueAttribute) {
						node.attributes.push(new nodes.Attribute({
							generator,
							name: 'value',
							value: node.children,
							parent: node
						}));
					}
				}
			}
		});
	}
}
