import MagicString, { Bundle } from 'magic-string';
import { walk, childKeys } from 'estree-walker';
import { getLocator } from 'locate-character';
import Stats from '../Stats';
import reservedNames from '../utils/reservedNames';
import { namespaces, validNamespaces } from '../utils/namespaces';
import { removeNode } from '../utils/removeNode';
import wrapModule from './wrapModule';
import { createScopes, extractNames, Scope } from '../utils/annotateWithScopes';
import Stylesheet from './css/Stylesheet';
import { test } from '../config';
import Fragment from './nodes/Fragment';
import internal_exports from './internal-exports';
import { Node, Ast, CompileOptions, Var, Warning } from '../interfaces';
import error from '../utils/error';
import getCodeFrame from '../utils/getCodeFrame';
import flattenReference from '../utils/flattenReference';
import isReference from 'is-reference';
import TemplateScope from './nodes/shared/TemplateScope';
import fuzzymatch from '../utils/fuzzymatch';
import { remove_indentation, add_indentation } from '../utils/indentation';
import getObject from '../utils/getObject';
import globalWhitelist from '../utils/globalWhitelist';

type ComponentOptions = {
	namespace?: string;
	tag?: string;
	immutable?: boolean;
	props?: string;
	props_object?: string;
	props_node?: Node;
};

// We need to tell estree-walker that it should always
// look for an `else` block, otherwise it might get
// the wrong idea about the shape of each/if blocks
childKeys.EachBlock = childKeys.IfBlock = ['children', 'else'];
childKeys.Attribute = ['value'];
childKeys.ExportNamedDeclaration = ['declaration', 'specifiers'];

export default class Component {
	stats: Stats;
	warnings: Warning[];

	ast: Ast;
	source: string;
	code: MagicString;
	name: string;
	compileOptions: CompileOptions;
	fragment: Fragment;
	module_scope: Scope;
	instance_scope: Scope;
	instance_scope_map: WeakMap<Node, Scope>;

	componentOptions: ComponentOptions;
	namespace: string;
	tag: string;

	vars: Var[] = [];
	var_lookup: Map<string, Var> = new Map();

	imports: Node[] = [];
	module_javascript: string;
	javascript: string;

	hoistable_nodes: Set<Node> = new Set();
	node_for_declaration: Map<string, Node> = new Map();
	partly_hoisted: string[] = [];
	fully_hoisted: string[] = [];
	reactive_declarations: Array<{ assignees: Set<string>, dependencies: Set<string>, node: Node, injected: boolean }> = [];
	reactive_declaration_nodes: Set<Node> = new Set();
	has_reactive_assignments = false;
	injected_reactive_declaration_vars: Set<string> = new Set();
	helpers: Set<string> = new Set();

	indirectDependencies: Map<string, Set<string>> = new Map();

	file: string;
	locate: (c: number) => { line: number, column: number };

	// TODO this does the same as component.locate! remove one or the other
	locator: (search: number, startIndex?: number) => {
		line: number,
		column: number
	};

	stylesheet: Stylesheet;

	aliases: Map<string, string> = new Map();
	usedNames: Set<string> = new Set();

	constructor(
		ast: Ast,
		source: string,
		name: string,
		compileOptions: CompileOptions,
		stats: Stats,
		warnings: Warning[]
	) {
		this.name = name;

		this.stats = stats;
		this.warnings = warnings;
		this.ast = ast;
		this.source = source;
		this.compileOptions = compileOptions;

		this.file = compileOptions.filename && (
			typeof process !== 'undefined' ? compileOptions.filename.replace(process.cwd(), '').replace(/^[\/\\]/, '') : compileOptions.filename
		);
		this.locate = getLocator(this.source);

		this.code = new MagicString(source);

		// styles
		this.stylesheet = new Stylesheet(source, ast, compileOptions.filename, compileOptions.dev);
		this.stylesheet.validate(this);

		this.componentOptions = process_component_options(this, this.ast.html.children);
		this.namespace = namespaces[this.componentOptions.namespace] || this.componentOptions.namespace;

		if (compileOptions.customElement === true && !this.componentOptions.tag) {
			throw new Error(`No tag name specified`); // TODO better error
		}

		this.tag = compileOptions.customElement
			? compileOptions.customElement === true
				? this.componentOptions.tag
				: compileOptions.customElement as string
			: this.name;

		this.walk_module_js();
		this.walk_instance_js_pre_template();

		if (this.componentOptions.props) {
			this.has_reactive_assignments = true;

			const name = this.componentOptions.props_object;

			if (!this.ast.module && !this.ast.instance) {
				this.add_var({
					name,
					export_name: name,
					implicit: true
				});
			}

			const variable = this.var_lookup.get(name);

			if (!variable) {
				this.error(this.componentOptions.props_node, {
					code: 'missing-declaration',
					message: `'${name}' is not defined`
				});
			}

			variable.reassigned = true;
		}

		this.name = this.getUniqueName(name);
		this.fragment = new Fragment(this, ast.html);

		this.walk_instance_js_post_template();

		if (!compileOptions.customElement) this.stylesheet.reify();

		this.stylesheet.warnOnUnusedSelectors(this);
	}

	add_var(variable: Var) {
		this.vars.push(variable);
		this.var_lookup.set(variable.name, variable);
	}

	add_reference(name: string) {
		const variable = this.var_lookup.get(name);

		if (variable) {
			variable.referenced = true;
		} else if (name[0] === '$') {
			this.add_var({
				name,
				injected: true,
				referenced: true,
				mutated: true,
				writable: true
			});

			const subscribable_name = name.slice(1);
			this.add_reference(subscribable_name);

			const variable = this.var_lookup.get(subscribable_name);
			variable.subscribable = true;
		} else if (!this.ast.instance) {
			this.add_var({
				name,
				export_name: name,
				implicit: true,
				mutated: false,
				referenced: true,
				writable: true
			});
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

	helper(name: string) {
		this.helpers.add(name);
		return this.alias(name);
	}

	generate(result: string) {
		let js = null;
		let css = null;

		if (result) {
			const { compileOptions, name } = this;
			const { format = 'esm' } = compileOptions;

			const banner = `/* ${this.file ? `${this.file} ` : ``}generated by Svelte v${"__VERSION__"} */`;

			// TODO use same regex for both
			result = result.replace(compileOptions.generate === 'ssr' ? /(@+|#+)(\w*(?:-\w*)?)/g : /(@+)(\w*(?:-\w*)?)/g, (match: string, sigil: string, name: string) => {
				if (sigil === '@') {
					if (internal_exports.has(name)) {
						if (compileOptions.dev && internal_exports.has(`${name}Dev`)) name = `${name}Dev`;
						this.helpers.add(name);
					}

					return this.alias(name);
				}

				return sigil.slice(1) + name;
			});

			const importedHelpers = Array.from(this.helpers)
				.sort()
				.map(name => {
					const alias = this.alias(name);
					return { name, alias };
				});

			const module = wrapModule(
				result,
				format,
				name,
				compileOptions,
				banner,
				compileOptions.sveltePath,
				importedHelpers,
				this.imports,
				this.vars.filter(variable => variable.module && variable.export_name).map(variable => ({
					name: variable.name,
					as: variable.export_name
				})),
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

			const { filename } = compileOptions;

			// special case — the source file doesn't actually get used anywhere. we need
			// to add an empty file to populate map.sources and map.sourcesContent
			if (!parts.length) {
				compiled.addSource({
					filename,
					content: new MagicString(this.source).remove(0, this.source.length),
				});
			}

			const pattern = /\[✂(\d+)-(\d+)$/;

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

			css = compileOptions.customElement ?
				{ code: null, map: null } :
				this.stylesheet.render(compileOptions.cssOutputFilename, true);

			js = {
				code: compiled.toString(),
				map: compiled.generateMap({
					includeContent: true,
					file: compileOptions.outputFilename,
				})
			};
		}

		return {
			js,
			css,
			ast: this.ast,
			warnings: this.warnings,
			vars: this.vars.filter(v => !v.global && !v.internal).map(v => ({
				name: v.name,
				export_name: v.export_name || null,
				injected: v.injected || false,
				module: v.module || false,
				mutated: v.mutated || false,
				reassigned: v.reassigned || false,
				referenced: v.referenced || false,
				writable: v.writable || false
			})),
			stats: this.stats.render()
		};
	}

	getUniqueName(name: string) {
		if (test) name = `${name}$`;
		let alias = name;
		for (
			let i = 1;
			reservedNames.has(alias) ||
			this.var_lookup.has(alias) ||
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
		this.var_lookup.forEach((value, key) => add(key));

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
			filename: this.compileOptions.filename
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

		this.warnings.push({
			code: warning.code,
			message: warning.message,
			frame,
			start,
			end,
			pos: pos.start,
			filename: this.compileOptions.filename,
			toString: () => `${warning.message} (${start.line + 1}:${start.column})\n${frame}`,
		});
	}

	extract_imports(content) {
		const { code } = this;

		content.body.forEach(node => {
			if (node.type === 'ImportDeclaration') {
				// imports need to be hoisted out of the IIFE
				removeNode(code, content.start, content.end, content.body, node);
				this.imports.push(node);
			}
		});
	}

	extract_exports(content) {
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
								const variable = this.var_lookup.get(name);
								variable.export_name = name;
							});
						});
					} else {
						const { name } = node.declaration.id;

						const variable = this.var_lookup.get(name);
						variable.export_name = name;
					}

					code.remove(node.start, node.declaration.start);
				} else {
					removeNode(code, content.start, content.end, content.body, node);
					node.specifiers.forEach(specifier => {
						const variable = this.var_lookup.get(specifier.local.name);

						if (variable) {
							variable.export_name = specifier.exported.name;
						} else {
							// TODO what happens with `export { Math }` or some other global?
						}
					});
				}
			}
		});
	}

	extract_javascript(script) {
		const nodes_to_include = script.content.body.filter(node => {
			if (this.hoistable_nodes.has(node)) return false;
			if (this.reactive_declaration_nodes.has(node)) return false;
			if (node.type === 'ImportDeclaration') return false;
			if (node.type === 'ExportDeclaration' && node.specifiers.length > 0) return false;
			return true;
		});

		if (nodes_to_include.length === 0) return null;

		let a = script.content.start;
		while (/\s/.test(this.source[a])) a += 1;

		let b = a;

		let result = '';

		script.content.body.forEach((node, i) => {
			if (this.hoistable_nodes.has(node) || this.reactive_declaration_nodes.has(node)) {
				if (a !== b) result += `[✂${a}-${b}✂]`;
				a = node.end;
			}

			b = node.end;
		});

		// while (/\s/.test(this.source[a - 1])) a -= 1;

		b = script.content.end;
		while (/\s/.test(this.source[b - 1])) b -= 1;

		if (a < b) result += `[✂${a}-${b}✂]`;

		return result || null;
	}

	walk_module_js() {
		const script = this.ast.module;
		if (!script) return;

		this.addSourcemapLocations(script.content);

		let { scope, globals } = createScopes(script.content);
		this.module_scope = scope;

		scope.declarations.forEach((node, name) => {
			if (name[0] === '$') {
				this.error(node, {
					code: 'illegal-declaration',
					message: `The $ prefix is reserved, and cannot be used for variable and import names`
				});
			}

			this.add_var({
				name,
				module: true,
				hoistable: true,
				writable: node.kind === 'var' || node.kind === 'let'
			});
		});

		globals.forEach((node, name) => {
			if (name[0] === '$') {
				this.error(node, {
					code: 'illegal-subscription',
					message: `Cannot reference store value inside <script context="module">`
				})
			} else {
				this.add_var({
					name,
					global: true
				});
			}
		});

		this.extract_imports(script.content);
		this.extract_exports(script.content);
		remove_indentation(this.code, script.content);
		this.module_javascript = this.extract_javascript(script);
	}

	walk_instance_js_pre_template() {
		const script = this.ast.instance;
		if (!script) return;

		this.addSourcemapLocations(script.content);

		// inject vars for reactive declarations
		script.content.body.forEach(node => {
			if (node.type !== 'LabeledStatement') return;
			if (node.body.type !== 'ExpressionStatement') return;
			if (node.body.expression.type !== 'AssignmentExpression') return;

			const { type, name } = node.body.expression.left;

			if (type === 'Identifier' && !this.var_lookup.has(name)) {
				this.injected_reactive_declaration_vars.add(name);
			}
		});

		let { scope: instance_scope, map, globals } = createScopes(script.content);
		this.instance_scope = instance_scope;
		this.instance_scope_map = map;

		instance_scope.declarations.forEach((node, name) => {
			if (name[0] === '$') {
				this.error(node, {
					code: 'illegal-declaration',
					message: `The $ prefix is reserved, and cannot be used for variable and import names`
				});
			}

			this.add_var({
				name,
				initialised: instance_scope.initialised_declarations.has(name),
				hoistable: /^Import/.test(node.type),
				writable: node.kind === 'var' || node.kind === 'let'
			});

			this.node_for_declaration.set(name, node);
		});

		globals.forEach((node, name) => {
			if (this.var_lookup.has(name)) return;

			if (this.injected_reactive_declaration_vars.has(name)) {
				this.add_var({
					name,
					injected: true,
					writable: true,
					reassigned: true,
					initialised: true
				});
			} else if (name[0] === '$') {
				this.add_var({
					name,
					injected: true,
					mutated: true,
					writable: true
				});

				this.add_reference(name.slice(1));

				const variable = this.var_lookup.get(name.slice(1));
				variable.subscribable = true;
			} else {
				this.add_var({
					name,
					global: true
				});
			}
		});

		this.extract_imports(script.content);
		this.extract_exports(script.content);
		this.track_mutations();
	}

	walk_instance_js_post_template() {
		const script = this.ast.instance;
		if (!script) return;

		this.hoist_instance_declarations();
		this.extract_reactive_declarations();
		this.extract_reactive_store_references();
		this.javascript = this.extract_javascript(script);
	}

	// TODO merge this with other walks that are independent
	track_mutations() {
		const component = this;
		const { instance_scope, instance_scope_map: map } = this;

		let scope = instance_scope;

		walk(this.ast.instance.content, {
			enter(node, parent) {
				if (map.has(node)) {
					scope = map.get(node);
				}

				let names;
				let deep = false;

				if (node.type === 'AssignmentExpression') {
					deep = node.left.type === 'MemberExpression';

					names = deep
						? [getObject(node.left).name]
						: extractNames(node.left);
				} else if (node.type === 'UpdateExpression') {
					names = [getObject(node.argument).name];
				}

				if (names) {
					names.forEach(name => {
						if (scope.findOwner(name) === instance_scope) {
							const variable = component.var_lookup.get(name);
							variable[deep ? 'mutated' : 'reassigned'] = true;
						}
					});
				}
			},

			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		})
	}

	extract_reactive_store_references() {
		// TODO this pattern happens a lot... can we abstract it
		// (or better still, do fewer AST walks)?
		const component = this;
		let { instance_scope: scope, instance_scope_map: map } = this;

		walk(this.ast.instance.content, {
			enter(node, parent) {
				if (map.has(node)) {
					scope = map.get(node);
				}

				if (isReference(node, parent)) {
					const object = getObject(node);
					const { name } = object;

					if (name[0] === '$' && !scope.has(name)) {
						component.warn_if_undefined(object, null);
					}
				}
			},

			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		});
	}

	invalidate(name, value = name) {
		const variable = this.var_lookup.get(name);
		if (variable && (variable.subscribable && variable.reassigned)) {
			return `$$subscribe_${name}(), $$invalidate('${name}', ${value})`;
		}
		return `$$invalidate('${name}', ${value})`;
	}

	rewrite_props(get_insert: (variable: Var) => string) {
		const component = this;
		const { code, instance_scope, instance_scope_map: map, componentOptions } = this;
		let scope = instance_scope;

		const coalesced_declarations = [];
		let current_group;

		walk(this.ast.instance.content, {
			enter(node, parent) {
				if (/Function/.test(node.type)) {
					current_group = null;
					return this.skip();
				}

				if (map.has(node)) {
					scope = map.get(node);
				}

				if (node.type === 'VariableDeclaration') {
					if (node.kind === 'var' || scope === instance_scope) {
						node.declarations.forEach((declarator, i) => {
							const next = node.declarations[i + 1];

							if (declarator.id.type !== 'Identifier') {
								const inserts = [];

								extractNames(declarator.id).forEach(name => {
									const variable = component.var_lookup.get(name);

									if (variable.export_name || name === componentOptions.props_object) {
										component.error(declarator, {
											code: 'destructured-prop',
											message: `Cannot declare props in destructured declaration`
										});
									}

									if (variable.subscribable) {
										inserts.push(get_insert(variable));
									}
								});

								if (inserts.length > 0) {
									if (next) {
										code.overwrite(declarator.end, next.start, `; ${inserts.join('; ')}; ${node.kind} `);
									} else {
										code.appendLeft(declarator.end, `; ${inserts.join('; ')}`);
									}
								}

								return;
							}

							const { name } = declarator.id;
							const variable = component.var_lookup.get(name);

							if (name === componentOptions.props_object) {
								if (variable.export_name) {
									component.error(declarator, {
										code: 'exported-options-props',
										message: `Cannot export props binding`
									});
								}

								// can't use the @ trick here, because we're
								// manipulating the underlying magic string
								const exclude_internal_props = component.helper('exclude_internal_props');

								const suffix = code.original[declarator.end] === ';'
									? ` = ${exclude_internal_props}($$props)`
									: ` = ${exclude_internal_props}($$props);`

								if (declarator.id.end === declarator.end) {
									code.appendLeft(declarator.end, suffix);
								} else {
									code.overwrite(declarator.id.end, declarator.end, suffix);
								}
							}

							if (variable.export_name) {
								if (variable.subscribable) {
									coalesced_declarations.push({
										kind: node.kind,
										declarators: [declarator],
										insert: get_insert(variable)
									});
								} else {
									if (current_group && current_group.kind !== node.kind) {
										current_group = null;
									}

									if (!current_group) {
										current_group = { kind: node.kind, declarators: [], insert: null };
										coalesced_declarations.push(current_group);
									}

									current_group.declarators.push(declarator);
								}
							} else {
								current_group = null;

								if (variable.subscribable) {
									let insert = get_insert(variable);

									if (next) {
										code.overwrite(declarator.end, next.start, `; ${insert}; ${node.kind} `);
									} else {
										code.appendLeft(declarator.end, `; ${insert}`);
									}
								}
							}
						});
					}
				} else {
					if (node.type !== 'ExportNamedDeclaration') {
						if (!parent) current_group = null;
					}
				}
			},

			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		});

		coalesced_declarations.forEach(group => {
			let c = 0;

			let combining = false;

			group.declarators.forEach(declarator => {
				const { id } = declarator;

				if (combining) {
					code.overwrite(c, id.start, ', ');
				} else {
					code.appendLeft(id.start, '{ ');
					combining = true;
				}

				c = declarator.end;
			});

			if (combining) {
				const insert = group.insert
					? `; ${group.insert}`
					: '';

				const suffix = code.original[c] === ';' ? ` } = $$props${insert}` : ` } = $$props${insert};`;
				code.appendLeft(c, suffix);
			}
		});
	}

	hoist_instance_declarations() {
		// we can safely hoist variable declarations that are
		// initialised to literals, and functions that don't
		// reference instance variables other than other
		// hoistable functions. TODO others?

		const { hoistable_nodes, var_lookup } = this;

		const top_level_function_declarations = new Map();

		this.ast.instance.content.body.forEach(node => {
			if (node.type === 'VariableDeclaration') {
				const all_hoistable = node.declarations.every(d => {
					if (!d.init) return false;
					if (d.init.type !== 'Literal') return false;
					if (this.var_lookup.get(d.id.name).reassigned) return false;
					if (this.vars.find(variable => variable.name === d.id.name && variable.module)) return false;

					return true;
				});

				if (all_hoistable) {
					node.declarations.forEach(d => {
						const variable = this.var_lookup.get(d.id.name);
						variable.hoistable = true;
					});

					hoistable_nodes.add(node);
					this.fully_hoisted.push(`[✂${node.start}-${node.end}✂]`);
				}
			}

			if (node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'FunctionDeclaration') {
				top_level_function_declarations.set(node.declaration.id.name, node);
			}

			if (node.type === 'FunctionDeclaration') {
				top_level_function_declarations.set(node.id.name, node);
			}
		});

		const checked = new Set();
		let walking = new Set();

		const is_hoistable = fn_declaration => {
			if (fn_declaration.type === 'ExportNamedDeclaration') {
				fn_declaration = fn_declaration.declaration;
			}

			const instance_scope = this.instance_scope;
			let scope = this.instance_scope;
			let map = this.instance_scope_map;

			let hoistable = true;

			// handle cycles
			walking.add(fn_declaration);

			walk(fn_declaration, {
				enter(node, parent) {
					if (map.has(node)) {
						scope = map.get(node);
					}

					if (isReference(node, parent)) {
						const { name } = flattenReference(node);
						const owner = scope.findOwner(name);

						if (name[0] === '$' && !owner) {
							hoistable = false;
						}

						else if (owner === instance_scope) {
							if (name === fn_declaration.id.name) return;

							const variable = var_lookup.get(name);
							if (variable.hoistable) return;

							if (top_level_function_declarations.has(name)) {
								const other_declaration = top_level_function_declarations.get(name);

								if (walking.has(other_declaration)) {
									hoistable = false;
								} else if (!is_hoistable(other_declaration)) {
									hoistable = false;
								}
							}

							else {
								hoistable = false;
							}
						}

						this.skip();
					}
				},

				leave(node) {
					if (map.has(node)) {
						scope = scope.parent;
					}
				}
			});

			checked.add(fn_declaration);
			walking.delete(fn_declaration);

			return hoistable;
		};

		for (const [name, node] of top_level_function_declarations) {
			if (!checked.has(node) && is_hoistable(node)) {
				const variable = this.var_lookup.get(name);
				variable.hoistable = true;
				hoistable_nodes.add(node);

				remove_indentation(this.code, node);

				this.fully_hoisted.push(`[✂${node.start}-${node.end}✂]`);
			}
		}
	}

	extract_reactive_declarations() {
		const component = this;

		const unsorted_reactive_declarations = [];

		this.ast.instance.content.body.forEach(node => {
			if (node.type === 'LabeledStatement' && node.label.name === '$') {
				this.reactive_declaration_nodes.add(node);

				const assignees = new Set();
				const dependencies = new Set();

				let scope = this.instance_scope;
				let map = this.instance_scope_map;

				walk(node.body, {
					enter(node, parent) {
						if (map.has(node)) {
							scope = map.get(node);
						}

						if (node.type === 'AssignmentExpression') {
							assignees.add(getObject(node.left).name);
						} else if (node.type === 'UpdateExpression') {
							assignees.add(getObject(node.argument).name);
						} else if (isReference(node, parent)) {
							const object = getObject(node);
							const { name } = object;

							const owner = scope.findOwner(name);
							if ((!owner || owner === component.instance_scope) && (name[0] === '$' || component.var_lookup.has(name))) {
								dependencies.add(name);
							}

							this.skip();
						}
					},

					leave(node) {
						if (map.has(node)) {
							scope = scope.parent;
						}
					}
				});

				add_indentation(this.code, node.body, 2);

				unsorted_reactive_declarations.push({
					assignees,
					dependencies,
					node,
					injected: (
						node.body.type === 'ExpressionStatement' &&
						node.body.expression.type === 'AssignmentExpression' &&
						node.body.expression.left.type === 'Identifier' &&
						this.var_lookup.get(node.body.expression.left.name).injected
					)
				});
			}
		});

		const lookup = new Map();
		let seen;

		unsorted_reactive_declarations.forEach(declaration => {
			declaration.assignees.forEach(name => {
				if (!lookup.has(name)) {
					lookup.set(name, []);
				}

				// TODO warn or error if a name is assigned to in
				// multiple reactive declarations?
				lookup.get(name).push(declaration);
			});
		});

		const add_declaration = declaration => {
			if (seen.has(declaration)) {
				this.error(declaration.node, {
					code: 'cyclical-reactive-declaration',
					message: 'Cyclical dependency detected'
				});
			}

			if (this.reactive_declarations.indexOf(declaration) !== -1) {
				return;
			}

			seen.add(declaration);

			if (declaration.dependencies.size === 0) {
				this.error(declaration.node, {
					code: 'invalid-reactive-declaration',
					message: 'Invalid reactive declaration — must depend on local state'
				});
			}

			declaration.dependencies.forEach(name => {
				if (declaration.assignees.has(name)) return;
				const earlier_declarations = lookup.get(name);
				if (earlier_declarations) earlier_declarations.forEach(declaration => {
					add_declaration(declaration);
				});
			});

			this.reactive_declarations.push(declaration);
		};

		unsorted_reactive_declarations.forEach(declaration => {
			seen = new Set();
			add_declaration(declaration);
		});
	}

	qualify(name) {
		const variable = this.var_lookup.get(name);

		if (!variable) return name;
		if (variable && variable.hoistable) return name;

		this.add_reference(name); // TODO we can probably remove most other occurrences of this
		return `ctx.${name}`;
	}

	warn_if_undefined(node, template_scope: TemplateScope, allow_implicit?: boolean) {
		let { name } = node;

		if (name[0] === '$') {
			name = name.slice(1);
			this.has_reactive_assignments = true;
		}

		if (allow_implicit && !this.ast.instance && !this.ast.module) return;
		if (this.var_lookup.has(name)) return;
		if (template_scope && template_scope.names.has(name)) return;
		if (globalWhitelist.has(name)) return;

		this.warn(node, {
			code: 'missing-declaration',
			message: `'${name}' is not defined`
		});
	}
}

function process_component_options(component: Component, nodes) {
	const componentOptions: ComponentOptions = {
		immutable: component.compileOptions.immutable || false
	};

	const node = nodes.find(node => node.name === 'svelte:options');

	function get_value(attribute, code, message) {
		const { value } = attribute;
		const chunk = value[0];

		if (!chunk) return true;

		if (value.length > 1) {
			component.error(attribute, { code, message });
		}

		if (chunk.type === 'Text') return chunk.data;

		if (chunk.expression.type !== 'Literal') {
			component.error(attribute, { code, message });
		}

		return chunk.expression.value;
	}

	if (node) {
		node.attributes.forEach(attribute => {
			if (attribute.type === 'Attribute') {
				const { name } = attribute;

				switch (name) {
					case 'tag': {
						const code = 'invalid-tag-attribute';
						const message = `'tag' must be a string literal`;
						const tag = get_value(attribute, code, message);

						if (typeof tag !== 'string') component.error(attribute, { code, message });

						if (!/^[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]+$/.test(tag)) {
							component.error(attribute, {
								code: `invalid-tag-property`,
								message: `tag name must be two or more words joined by the '-' character`
							});
						}

						componentOptions.tag = tag;
						break;
					}

					case 'namespace': {
						const code = 'invalid-namespace-attribute';
						const message = `The 'namespace' attribute must be a string literal representing a valid namespace`;
						const ns = get_value(attribute, code, message);

						if (typeof ns !== 'string') component.error(attribute, { code, message });

						if (validNamespaces.indexOf(ns) === -1) {
							const match = fuzzymatch(ns, validNamespaces);
							if (match) {
								component.error(attribute, {
									code: `invalid-namespace-property`,
									message: `Invalid namespace '${ns}' (did you mean '${match}'?)`
								});
							} else {
								component.error(attribute, {
									code: `invalid-namespace-property`,
									message: `Invalid namespace '${ns}'`
								});
							}
						}

						componentOptions.namespace = ns;
						break;
					}

					case 'immutable':
						const code = `invalid-immutable-value`;
						const message = `immutable attribute must be true or false`
						const value = get_value(attribute, code, message);

						if (typeof value !== 'boolean') component.error(attribute, { code, message });

						componentOptions.immutable = value;
						break;

					default:
						component.error(attribute, {
							code: `invalid-options-attribute`,
							message: `<svelte:options> unknown attribute`
						});
				}
			}

			else if (attribute.type === 'Binding') {
				if (attribute.name !== 'props') {
					component.error(attribute, {
						code: `invalid-options-binding`,
						message: `<svelte:options> only supports bind:props`
					});
				}

				const { start, end } = attribute.expression;
				const { name } = flattenReference(attribute.expression);

				componentOptions.props = `[✂${start}-${end}✂]`;
				componentOptions.props_node = attribute.expression;
				componentOptions.props_object = name;
			}

			else {
				component.error(attribute, {
					code: `invalid-options-attribute`,
					message: `<svelte:options> can only have static 'tag', 'namespace' and 'immutable' attributes, or a bind:props directive`
				});
			}
		});
	}

	return componentOptions;
}
