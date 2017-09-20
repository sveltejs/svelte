import MagicString, { Bundle } from 'magic-string';
import { walk } from 'estree-walker';
import { getLocator } from 'locate-character';
import deindent from '../utils/deindent';
import CodeBuilder from '../utils/CodeBuilder';
import getCodeFrame from '../utils/getCodeFrame';
import isReference from '../utils/isReference';
import flattenReference from '../utils/flattenReference';
import globalWhitelist from '../utils/globalWhitelist';
import reservedNames from '../utils/reservedNames';
import namespaces from '../utils/namespaces';
import { removeNode, removeObjectKey } from '../utils/removeNode';
import wrapModule from './shared/utils/wrapModule';
import annotateWithScopes from '../utils/annotateWithScopes';
import clone from '../utils/clone';
import DomBlock from './dom/Block';
import SsrBlock from './server-side-rendering/Block';
import Stylesheet from '../css/Stylesheet';
import { Node, GenerateOptions, Parsed, CompileOptions, CustomElementOptions } from '../interfaces';

const test = typeof global !== 'undefined' && global.__svelte_test;

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
		options: CompileOptions
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

		this.parseJs();
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
		block: DomBlock | SsrBlock,
		expression: Node,
		context: string,
		isEventHandler: boolean
	): {
		dependencies: string[],
		contexts: Set<string>,
		indexes: Set<string>,
		snippet: string
	} {
		this.addSourcemapLocations(expression);

		const usedContexts: Set<string> = new Set();
		const usedIndexes: Set<string> = new Set();

		const { code, helpers } = this;
		const { contexts, indexes } = block;

		let scope = annotateWithScopes(expression); // TODO this already happens in findDependencies
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
					if (scope.has(name)) return;

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

						if (globalWhitelist.has(name)) {
							code.prependRight(node.start, `('${name}' in state ? state.`);
							code.appendLeft(
								node.object ? node.object.end : node.end,
								` : ${name})`
							);
						} else {
							code.prependRight(node.start, `state.`);
						}

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

		const dependencies: Set<string> = new Set(expression._dependencies || []);

		if (expression._dependencies) {
			expression._dependencies.forEach((prop: string) => {
				if (this.indirectDependencies.has(prop)) {
					this.indirectDependencies.get(prop).forEach(dependency => {
						dependencies.add(dependency);
					});
				}
			});
		}

		return {
			dependencies: Array.from(dependencies),
			contexts: usedContexts,
			indexes: usedIndexes,
			snippet: `[✂${expression.start}-${expression.end}✂]`,
		};
	}

	findDependencies(
		contextDependencies: Map<string, string[]>,
		indexes: Map<string, string>,
		expression: Node
	) {
		if (expression._dependencies) return expression._dependencies;

		let scope = annotateWithScopes(expression);
		const dependencies: string[] = [];

		const generator = this; // can't use arrow functions, because of this.skip()

		walk(expression, {
			enter(node: Node, parent: Node) {
				if (node._scope) {
					scope = node._scope;
					return;
				}

				if (isReference(node, parent)) {
					const { name } = flattenReference(node);
					if (scope.has(name) || generator.helpers.has(name)) return;

					if (contextDependencies.has(name)) {
						dependencies.push(...contextDependencies.get(name));
					} else if (!indexes.has(name)) {
						dependencies.push(name);
					}

					this.skip();
				}
			},

			leave(node: Node) {
				if (node._scope) scope = scope.parent;
			},
		});

		dependencies.forEach(name => {
			if (!globalWhitelist.has(name)) {
				this.expectedProperties.add(name);
			}
		});

		return (expression._dependencies = dependencies);
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

	parseJs() {
		const { code, source } = this;
		const { js } = this.parsed;

		const imports = this.imports;
		const computations: Computation[] = [];
		const templateProperties: Record<string, Node> = {};
		const componentDefinition = new CodeBuilder();

		let namespace = null;

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
					removeNode(this.code, js.content, node);
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
					templateProperties[prop.key.name] = prop;
				});

				['helpers', 'events', 'components', 'transitions'].forEach(key => {
					if (templateProperties[key]) {
						templateProperties[key].value.properties.forEach((prop: Node) => {
							this[key].add(prop.key.name);
						});
					}
				});

				const addArrowFunctionExpression = (name: string, node: Node) => {
					const { body, params } = node;

					const paramString = params.length ?
						`[✂${params[0].start}-${params[params.length - 1].end}✂]` :
						``;

					if (body.type === 'BlockStatement') {
						componentDefinition.addBlock(deindent`
							function ${name}(${paramString}) [✂${body.start}-${body.end}✂]
						`);
					} else {
						componentDefinition.addBlock(deindent`
							function ${name}(${paramString}) {
								return [✂${body.start}-${body.end}✂];
							}
						`);
					}
				};

				const addFunctionExpression = (name: string, node: Node) => {
					let c = node.start;
					while (this.source[c] !== '(') c += 1;
					componentDefinition.addBlock(deindent`
						function ${name}[✂${c}-${node.end}✂];
					`);
				};

				const addValue = (name: string, node: Node) => {
					if (node.type !== 'Identifier' || node.name !== name) {
						componentDefinition.addBlock(deindent`
							var ${name} = [✂${node.start}-${node.end}✂];
						`);
					}
				};

				const addDeclaration = (key: string, node: Node, disambiguator?: string) => {
					let name = this.getUniqueName(key);
					this.templateVars.set(disambiguator ? `${disambiguator}-${key}` : key, name);

					// deindent
					const indentationLevel = getIndentationLevel(source, node.start);
					if (indentationLevel) {
						removeIndentation(code, node.start, node.end, indentationLevel, indentExclusionRanges);
					}

					// TODO disambiguate between different categories, and ensure
					// no conflicts with existing aliases
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
						// TODO replace all the guff below with this:
						// addValue(property.key.name, property.value);

						const key = property.key.name;
						const value = source.slice(
							property.value.start,
							property.value.end
						);

						if (key !== value) {
							const alias = this.alias(key);
							componentDefinition.addLine(
								`var ${alias} = [✂${property.value.start}-${property.value.end}✂];`
							);
							this.importedComponents.set(key, alias);
						} else {
							this.importedComponents.set(key, key);
						}
					});
				}

				if (templateProperties.computed) {
					const dependencies = new Map();

					templateProperties.computed.value.properties.forEach((prop: Node) => {
						const key = prop.key.name;
						const value = prop.value;

						const deps = value.params.map(
							(param: Node) =>
								param.type === 'AssignmentPattern' ? param.left.name : param.name
						);
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

						const prop = templateProperties.computed.value.properties.find((prop: Node) => prop.key.name === key);
						addDeclaration(key, prop.value, 'computed');
					};

					templateProperties.computed.value.properties.forEach((prop: Node) =>
						visit(prop.key.name)
					);
				}

				if (templateProperties.data) {
					addDeclaration('data', templateProperties.data.value);
				}

				if (templateProperties.events) {
					templateProperties.events.value.properties.forEach((property: Node) => {
						addDeclaration(property.key.name, property.value, 'events');
					});
				}

				if (templateProperties.helpers) {
					templateProperties.helpers.value.properties.forEach((property: Node) => {
						addDeclaration(property.key.name, property.value, 'helpers');
					});
				}

				if (templateProperties.methods) {
					addDeclaration('methods', templateProperties.methods.value);
				}

				if (templateProperties.namespace) {
					const ns = templateProperties.namespace.value.value;
					namespace = namespaces[ns] || ns;
				}

				if (templateProperties.onrender) templateProperties.oncreate = templateProperties.onrender; // remove after v2
				if (templateProperties.oncreate) {
					addDeclaration('oncreate', templateProperties.oncreate.value);
				}

				if (templateProperties.onteardown) templateProperties.ondestroy = templateProperties.onteardown; // remove after v2
				if (templateProperties.ondestroy) {
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
						addDeclaration(property.key.name, property.value, 'transitions');
					});
				}
			}

			// if we do need to keep it, then we need to replace `export default`
			// if (defaultExport) {
			// 	this.code.overwrite(
			// 		defaultExport.start,
			// 		defaultExport.declaration.start,
			// 		`var ${this.alias('template')} = `
			// 	);
			// }

			if (indentationLevel) {
				if (defaultExport) {
					removeIndentation(code, js.content.start, defaultExport.start, indentationLevel, indentExclusionRanges);
					removeIndentation(code, defaultExport.end, js.content.end, indentationLevel, indentExclusionRanges);
				} else {
					removeIndentation(code, js.content.start, js.content.end, indentationLevel, indentExclusionRanges);
				}
			}

			if (js.content.body.length === 0) {
				// if there's no need to include user code, remove it altogether
				this.code.remove(js.content.start, js.content.end);
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

		this.computations = computations;
		this.namespace = namespace;
		this.templateProperties = templateProperties;
	}
}
