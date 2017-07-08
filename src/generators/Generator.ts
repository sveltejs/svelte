import MagicString, { Bundle } from 'magic-string';
import { walk } from 'estree-walker';
import { getLocator } from 'locate-character';
import getCodeFrame from '../utils/getCodeFrame';
import isReference from '../utils/isReference';
import flattenReference from '../utils/flattenReference';
import globalWhitelist from '../utils/globalWhitelist';
import reservedNames from '../utils/reservedNames';
import namespaces from '../utils/namespaces';
import { removeNode, removeObjectKey } from '../utils/removeNode';
import getIntro from './shared/utils/getIntro';
import getOutro from './shared/utils/getOutro';
import annotateWithScopes from '../utils/annotateWithScopes';
import clone from '../utils/clone';
import DomBlock from './dom/Block';
import SsrBlock from './server-side-rendering/Block';
import Stylesheet from '../css/Stylesheet';
import { Node, Parsed, CompileOptions } from '../interfaces';

const test = typeof global !== 'undefined' && global.__svelte_test;

export default class Generator {
	parsed: Parsed;
	source: string;
	name: string;
	options: CompileOptions;

	imports: Node[];
	helpers: Set<string>;
	components: Set<string>;
	events: Set<string>;
	transitions: Set<string>;
	importedComponents: Map<string, string>;

	code: MagicString;

	bindingGroups: string[];
	indirectDependencies: Map<string, Set<string>>;
	expectedProperties: Set<string>;
	usesRefs: boolean;

	stylesheet: Stylesheet;

	importedNames: Set<string>;
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

		this.bindingGroups = [];
		this.indirectDependencies = new Map();

		// track which properties are needed, so we can provide useful info
		// in dev mode
		this.expectedProperties = new Set();

		this.code = new MagicString(source);
		this.usesRefs = false;

		// styles
		this.stylesheet = stylesheet;

		// TODO this is legacy — just to get the tests to pass during the transition
		this.css = this.stylesheet.render(options.cssOutputFilename).css;
		this.cssId = `svelte-${parsed.hash}`;

		// allow compiler to deconflict user's `import { get } from 'whatever'` and
		// Svelte's builtin `import { get, ... } from 'svelte/shared.ts'`;
		this.importedNames = new Set();
		this.aliases = new Map();
		this.usedNames = new Set();

		this.parseJs();
		this.name = this.alias(name);
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
	) {
		this.addSourcemapLocations(expression);

		const usedContexts: string[] = [];

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

						if (!~usedContexts.indexOf(name)) usedContexts.push(name);
					} else if (helpers.has(name)) {
						code.prependRight(node.start, `${self.alias('template')}.helpers.`);
					} else if (indexes.has(name)) {
						const context = indexes.get(name);
						if (!~usedContexts.indexOf(context)) usedContexts.push(context);
					} else {
						// handle shorthand properties
						if (parent && parent.type === 'Property' && parent.shorthand) {
							if (key === 'key') {
								code.appendLeft(node.start, `${name}: `);
								return;
							}
						}

						if (globalWhitelist.has(name)) {
							code.prependRight(node.start, `( '${name}' in state ? state.`);
							code.appendLeft(
								node.object ? node.object.end : node.end,
								` : ${name} )`
							);
						} else {
							code.prependRight(node.start, `state.`);
						}

						if (!~usedContexts.indexOf('state')) usedContexts.push('state');
					}

					this.skip();
				}
			},

			leave(node: Node) {
				if (/^Function/.test(node.type)) lexicalDepth -= 1;
				if (node._scope) scope = scope.parent;
			},
		});

		const dependencies = new Set(expression._dependencies || []);

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

	generate(result, options: CompileOptions, { name, format }) {
		if (this.imports.length) {
			const statements: string[] = [];

			this.imports.forEach((declaration, i) => {
				if (format === 'es') {
					statements.push(
						this.source.slice(declaration.start, declaration.end)
					);
					return;
				}

				const defaultImport = declaration.specifiers.find(
					(x: Node) =>
						x.type === 'ImportDefaultSpecifier' ||
						(x.type === 'ImportSpecifier' && x.imported.name === 'default')
				);
				const namespaceImport = declaration.specifiers.find(
					(x: Node) => x.type === 'ImportNamespaceSpecifier'
				);
				const namedImports = declaration.specifiers.filter(
					(x: Node) =>
						x.type === 'ImportSpecifier' && x.imported.name !== 'default'
				);

				const name = defaultImport || namespaceImport
					? (defaultImport || namespaceImport).local.name
					: `__import${i}`;
				declaration.name = name; // hacky but makes life a bit easier later

				namedImports.forEach((specifier: Node) => {
					statements.push(
						`var ${specifier.local.name} = ${name}.${specifier.imported.name}`
					);
				});

				if (defaultImport) {
					statements.push(
						`${name} = ( ${name} && ${name}.__esModule ) ? ${name}['default'] : ${name};`
					);
				}
			});

			result = `${statements.join('\n')}\n\n${result}`;
		}

		const pattern = /\[✂(\d+)-(\d+)$/;

		const parts = result.split('✂]');
		const finalChunk = parts.pop();

		const compiled = new Bundle({ separator: '' });

		function addString(str: string) {
			compiled.addSource({
				content: new MagicString(str),
			});
		}

		const intro = getIntro(format, options, this.imports);
		if (intro) addString(intro);

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
		addString('\n\n' + getOutro(format, name, options, this.imports));

		const { css, cssMap } = this.stylesheet.render(options.cssOutputFilename);

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
			this.importedNames.has(alias) ||
			this.usedNames.has(alias);
			alias = `${name}_${i++}`
		);
		this.usedNames.add(alias);
		return alias;
	}

	getUniqueNameMaker(params) {
		const localUsedNames = new Set(params);
		return name => {
			if (test) name = `${name}$`;
			let alias = name;
			for (
				let i = 1;
				reservedNames.has(alias) ||
				this.importedNames.has(alias) ||
				this.usedNames.has(alias) ||
				localUsedNames.has(alias);
				alias = `${name}_${i++}`
			);
			localUsedNames.add(alias);
			return alias;
		};
	}

	parseJs() {
		const { source } = this;
		const { js } = this.parsed;

		const imports = this.imports;
		const computations = [];
		const templateProperties = {};

		let namespace = null;
		let hasJs = !!js;

		if (js) {
			this.addSourcemapLocations(js.content);
			const body = js.content.body.slice(); // slice, because we're going to be mutating the original

			// imports need to be hoisted out of the IIFE
			for (let i = 0; i < body.length; i += 1) {
				const node = body[i];
				if (node.type === 'ImportDeclaration') {
					removeNode(this.code, js.content, node);
					imports.push(node);

					node.specifiers.forEach((specifier: Node) => {
						this.importedNames.add(specifier.local.name);
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
			}

			['helpers', 'events', 'components', 'transitions'].forEach(key => {
				if (templateProperties[key]) {
					templateProperties[key].value.properties.forEach((prop: node) => {
						this[key].add(prop.key.name);
					});
				}
			});

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

				function visit(key) {
					if (!dependencies.has(key)) return; // not a computation

					if (visited.has(key)) return;
					visited.add(key);

					const deps = dependencies.get(key);
					deps.forEach(visit);

					computations.push({ key, deps });
				}

				templateProperties.computed.value.properties.forEach((prop: Node) =>
					visit(prop.key.name)
				);
			}

			if (templateProperties.namespace) {
				const ns = templateProperties.namespace.value.value;
				namespace = namespaces[ns] || ns;

				removeObjectKey(this.code, defaultExport.declaration, 'namespace');
			}

			if (templateProperties.components) {
				let hasNonImportedComponent = false;
				templateProperties.components.value.properties.forEach(
					(property: Node) => {
						const key = property.key.name;
						const value = source.slice(
							property.value.start,
							property.value.end
						);
						if (this.importedNames.has(value)) {
							this.importedComponents.set(key, value);
						} else {
							hasNonImportedComponent = true;
						}
					}
				);
				if (hasNonImportedComponent) {
					// remove the specific components that were imported, as we'll refer to them directly
					Array.from(this.importedComponents.keys()).forEach(key => {
						removeObjectKey(
							this.code,
							templateProperties.components.value,
							key
						);
					});
				} else {
					// remove the entire components portion of the export
					removeObjectKey(this.code, defaultExport.declaration, 'components');
				}
			}

			// Remove these after version 2
			if (templateProperties.onrender) {
				const { key } = templateProperties.onrender;
				this.code.overwrite(key.start, key.end, 'oncreate', {
					storeName: true,
					contentOnly: false,
				});
				templateProperties.oncreate = templateProperties.onrender;
			}

			if (templateProperties.onteardown) {
				const { key } = templateProperties.onteardown;
				this.code.overwrite(key.start, key.end, 'ondestroy', {
					storeName: true,
					contentOnly: false,
				});
				templateProperties.ondestroy = templateProperties.onteardown;
			}

			// now that we've analysed the default export, we can determine whether or not we need to keep it
			let hasDefaultExport = !!defaultExport;
			if (defaultExport && defaultExport.declaration.properties.length === 0) {
				hasDefaultExport = false;
				removeNode(this.code, js.content, defaultExport);
			}

			// if we do need to keep it, then we need to generate a return statement
			if (hasDefaultExport) {
				const finalNode = body[body.length - 1];
				if (defaultExport === finalNode) {
					// export is last property, we can just return it
					this.code.overwrite(
						defaultExport.start,
						defaultExport.declaration.start,
						`return `
					);
				} else {
					const { declarations } = annotateWithScopes(js);
					let template = 'template';
					for (
						let i = 1;
						declarations.has(template);
						template = `template_${i++}`
					);

					this.code.overwrite(
						defaultExport.start,
						defaultExport.declaration.start,
						`var ${template} = `
					);

					let i = defaultExport.start;
					while (/\s/.test(source[i - 1])) i--;

					const indentation = source.slice(i, defaultExport.start);
					this.code.appendLeft(
						finalNode.end,
						`\n\n${indentation}return ${template};`
					);
				}
			}

			// user code gets wrapped in an IIFE
			if (js.content.body.length) {
				const prefix = hasDefaultExport
					? `var ${this.alias('template')} = (function () {`
					: `(function () {`;
				this.code
					.prependRight(js.content.start, prefix)
					.appendLeft(js.content.end, '}());');
			} else {
				// if there's no need to include user code, remove it altogether
				this.code.remove(js.content.start, js.content.end);
				hasJs = false;
			}
		}

		this.computations = computations;
		this.hasJs = hasJs;
		this.namespace = namespace;
		this.templateProperties = templateProperties;
	}
}
