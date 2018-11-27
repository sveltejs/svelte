import MagicString, { Bundle } from 'magic-string';
import { walk, childKeys } from 'estree-walker';
import { getLocator } from 'locate-character';
import Stats from '../Stats';
import reservedNames from '../utils/reservedNames';
import namespaces from '../utils/namespaces';
import { removeNode } from '../utils/removeNode';
import wrapModule from './wrapModule';
import { createScopes, extractNames, Scope } from '../utils/annotateWithScopes';
import Stylesheet from './css/Stylesheet';
import { test } from '../config';
import Fragment from './nodes/Fragment';
import * as internal from '../internal/index';
import { Node, Ast, CompileOptions, CustomElementOptions } from '../interfaces';
import error from '../utils/error';
import getCodeFrame from '../utils/getCodeFrame';
import flattenReference from '../utils/flattenReference';
import addToSet from '../utils/addToSet';
import isReference from 'is-reference';
import TemplateScope from './nodes/shared/TemplateScope';

type Meta = {
	namespace?: string;
	tag?: string;
	immutable?: boolean;
	props?: string;
	props_object?: string;
};

// We need to tell estree-walker that it should always
// look for an `else` block, otherwise it might get
// the wrong idea about the shape of each/if blocks
childKeys.EachBlock = childKeys.IfBlock = ['children', 'else'];
childKeys.Attribute = ['value'];
childKeys.ExportNamedDeclaration = ['declaration', 'specifiers'];

function get_context(script) {
	const context = script.attributes.find(attribute => attribute.name === 'context');
	if (!context) return 'default';

	if (context.value.length !== 1 || context.value[0].type !== 'Text') {
		throw new Error(`context attribute must be static`);
	}

	return context.value[0].data;
}

export default class Component {
	stats: Stats;

	ast: Ast;
	source: string;
	name: string;
	options: CompileOptions;
	fragment: Fragment;
	module_scope: Scope;
	instance_scope: Scope;
	instance_scope_map: WeakMap<Node, Scope>;

	meta: Meta;

	customElement: CustomElementOptions;
	tag: string;

	properties: Map<string, Node>;

	instance_script: Node;
	module_script: Node;

	imports: Node[] = [];
	namespace: string;
	hasComponents: boolean;
	module_javascript: string;
	javascript: string;

	declarations: string[] = [];
	writable_declarations: Set<string> = new Set();
	initialised_declarations: Set<string> = new Set();
	node_for_declaration: Map<string, Node> = new Map();
	exports: Array<{ name: string, as: string }> = [];
	module_exports: Array<{ name: string, as: string }> = [];
	partly_hoisted: string[] = [];
	fully_hoisted: string[] = [];

	code: MagicString;

	indirectDependencies: Map<string, Set<string>> = new Map();
	expectedProperties: Set<string> = new Set();
	refs: Set<string> = new Set();

	file: string;
	locate: (c: number) => { line: number, column: number };

	stylesheet: Stylesheet;

	userVars: Set<string> = new Set();
	templateVars: Map<string, string> = new Map();
	aliases: Map<string, string> = new Map();
	usedNames: Set<string> = new Set();
	init_uses_self = false;

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

		this.file = options.filename && (
			typeof process !== 'undefined' ? options.filename.replace(process.cwd(), '').replace(/^[\/\\]/, '') : options.filename
		);
		this.locate = getLocator(this.source);

		this.code = new MagicString(source);

		// styles
		this.stylesheet = new Stylesheet(source, ast, options.filename, options.dev);
		this.stylesheet.validate(this);

		this.properties = new Map();

		this.module_script = ast.js.find(script => get_context(script) === 'module');
		this.instance_script = ast.js.find(script => get_context(script) === 'default');

		this.walk_module_js();
		this.walk_instance_js();
		this.name = this.getUniqueName(name);

		this.meta = process_meta(this, this.ast.html.children);
		this.namespace = namespaces[this.meta.namespace] || this.meta.namespace;

		if (options.customElement === true) {
			this.customElement = {
				tag: this.meta.tag,
				props: [] // TODO!!!
			};
		} else {
			this.customElement = options.customElement;
		}

		if (this.customElement && !this.customElement.tag) {
			throw new Error(`No tag name specified`); // TODO better error
		}

		this.fragment = new Fragment(this, ast.html);
		if (!this.customElement) this.stylesheet.reify();

		this.stylesheet.warnOnUnusedSelectors(options.onwarn);

		if (!this.instance_script) {
			const props = [...this.expectedProperties];
			this.declarations.push(...props);
			addToSet(this.writable_declarations, this.expectedProperties);

			this.exports = props.map(name => ({
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
		result = result.replace(options.generate === 'ssr' ? /(@+|#+)(\w*(?:-\w*)?)/g : /(@+)(\w*(?:-\w*)?)/g, (match: string, sigil: string, name: string) => {
			if (sigil === '@') {
				if (name in internal) {
					if (options.dev && `${name}Dev` in internal) name = `${name}Dev`;
					helpers.add(name);
				}

				return this.alias(name);
			}

			return sigil.slice(1) + name;
		});

		const importedHelpers = Array.from(helpers)
			.concat(options.dev ? 'SvelteComponentDev' : 'SvelteComponent')
			.sort()
			.map(name => {
				const alias = this.alias(name);
				return { name, alias };
			});

		const sharedPath = typeof options.shared === 'string'
			? options.shared
			: 'svelte/internal.js';

		const module = wrapModule(
			result,
			format,
			name,
			options,
			banner,
			sharedPath,
			importedHelpers,
			this.imports,
			this.module_exports,
			this.source
		);

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

	findDependenciesForFunctionCall(name) {
		const declaration = this.node_for_declaration.get(name);

		const dependencies = new Set();

		if (!declaration) {
			// Global or module-scoped function — can't have
			// local state as dependency by definition
			return dependencies;
		}

		let { instance_scope, instance_scope_map: map } = this;
		let scope = instance_scope;

		const component = this;
		let bail = false;

		walk(declaration, {
			enter(node, parent) {
				if (map.has(node)) {
					scope = map.get(node);
				}

				if (isReference(node, parent)) {
					const { name } = flattenReference(node);
					if (scope.findOwner(name) === instance_scope) {
						dependencies.add(name);
					}
				}

				if (node.type === 'CallExpression') {
					if (node.callee.type === 'Identifier') {
						const call_dependencies = component.findDependenciesForFunctionCall(node.callee.name);
						if (!call_dependencies) {
							bail = true;
							return this.skip();
						}

						addToSet(dependencies, call_dependencies);
					} else {
						bail = true;
						return this.skip();
					}
				}
			},

			leave(node) {
				if (map.has(node)) {
					scope = map.get(node);
				}
			}
		});

		return bail ? null : dependencies;
	}

	extract_imports_and_exports(content, imports, exports) {
		const { code } = this;

		content.body.forEach(node => {
			if (node.type === 'ExportDefaultDeclaration') {
				this.error(node, {
					code: `default-export`,
					message: `A component cannot have a default export`
				});
			}

			if (node.type === 'ExportNamedDeclaration') {
				if (node.declaration) {
					if (node.declaration.type === 'VariableDeclaration') {
						node.declaration.declarations.forEach(declarator => {
							extractNames(declarator.id).forEach(name => {
								exports.push({ name, as: name });
							});
						});
					} else {
						const { name } = node.declaration.id;
						exports.push({ name, as: name });
					}

					code.remove(node.start, node.declaration.start);
				} else {
					removeNode(code, content.start, content.end, content.body, node);
					node.specifiers.forEach(specifier => {
						exports.push({
							name: specifier.local.name,
							as: specifier.exported.name
						});
					});
				}
			}

			// imports need to be hoisted out of the IIFE
			// TODO hoist other stuff where possible
			else if (node.type === 'ImportDeclaration') {
				removeNode(code, content.start, content.end, content.body, node);
				imports.push(node);

				node.specifiers.forEach((specifier: Node) => {
					this.userVars.add(specifier.local.name);
					this.declarations.push(specifier.local.name); // TODO we don't really want this, but it's convenient for now
				});
			}
		});
	}

	extract_javascript(script) {
		let a = script.content.start;
		while (/\s/.test(this.source[a])) a += 1;

		let b = script.content.end;
		while (/\s/.test(this.source[b - 1])) b -= 1;

		return a !== b ? `[✂${a}-${b}✂]` : null;
	}

	walk_module_js() {
		const script = this.module_script;
		if (!script) return;

		this.addSourcemapLocations(script.content);

		let { scope } = createScopes(script.content);
		this.module_scope = scope;

		// TODO unindent

		this.extract_imports_and_exports(script.content, this.imports, this.module_exports);
		this.module_javascript = this.extract_javascript(script);
	}

	walk_instance_js() {
		const script = this.instance_script;
		if (!script) return;

		this.addSourcemapLocations(script.content);

		let { scope, map, globals } = createScopes(script.content);
		this.instance_scope = scope;
		this.instance_scope_map = map;

		scope.declarations.forEach((node, name) => {
			this.userVars.add(name);
			this.declarations.push(name);

			this.node_for_declaration.set(name, node);
		});

		this.writable_declarations = scope.writable_declarations;
		this.initialised_declarations = scope.initialised_declarations;

		globals.forEach(name => {
			this.userVars.add(name);
		});

		this.extract_imports_and_exports(script.content, this.imports, this.exports);

		const top_scope = scope;

		walk(script.content, {
			enter: (node, parent) => {
				if (map.has(node)) {
					scope = map.get(node);
				}

				if (node.type === 'AssignmentExpression') {
					const { name } = flattenReference(node.left);

					if (scope.findOwner(name) === top_scope) {
						this.instrument(node, parent, name, false);
					}
				}
			},

			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		});

		this.javascript = this.extract_javascript(script);
	}

	warn_if_undefined(node, template_scope: TemplateScope) {
		const { name } = node;
		if (this.module_scope && this.module_scope.declarations.has(name)) return;
		if (this.instance_scope && this.instance_scope.declarations.has(name)) return;
		if (template_scope.names.has(name)) return;

		this.warn(node, {
			code: 'missing-declaration',
			message: `'${name}' is not defined`
		});
	}

	instrument(node, parent, name, is_event_handler) {
		// TODO only make values reactive if they're used
		// in the template

		if (parent.type === 'ArrowFunctionExpression' && node === parent.body) {
			if (is_event_handler) {
				this.code.prependRight(node.start, `{ `);
				this.code.appendLeft(node.end, `; $$make_dirty('${name}'); }`);
			} else {
				this.code.prependRight(node.start, `{ const $$result = `);
				this.code.appendLeft(node.end, `; $$make_dirty('${name}'); return $$result; }`);
			}
		}

		else {
			this.code.appendLeft(node.end, `; $$make_dirty('${name}')`);
		}
	}
}

function process_meta(component, nodes) {
	const meta: Meta = {};
	const node = nodes.find(node => node.name === 'svelte:meta');

	if (node) {
		node.attributes.forEach(attribute => {
			if (attribute.type === 'Attribute') {
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
								code: `invalid-${name}-attribute`,
								message: `<svelte:meta> ${name} attribute must have a string value`
							});
						}

						meta[name] = data;
						break;

					case 'immutable':
						if (data && (data !== 'true' && data !== 'false')) {
							component.error(attribute, {
								code: `invalid-immutable-attribute`,
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
			}

			else if (attribute.type === 'Binding') {
				if (attribute.name !== 'props') {
					component.error(attribute, {
						code: `invalid-meta-binding`,
						message: `<svelte:meta> only supports bind:props`
					});
				}

				const { start, end } = attribute.expression;
				const { name } = flattenReference(attribute.expression);

				meta.props = `[✂${start}-${end}✂]`;
				meta.props_object = name;
			}

			else {
				component.error(attribute, {
					code: `invalid-meta-attribute`,
					message: `<svelte:meta> can only have static 'tag', 'namespace' and 'immutable' attributes, or a bind:props directive`
				});
			}


		});
	}

	return meta;
}