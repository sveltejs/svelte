import MagicString, { Bundle } from 'magic-string';
import { walk, childKeys } from 'estree-walker';
import { getLocator } from 'locate-character';
import Stats from '../Stats';
import { globals, reserved } from '../utils/names';
import { namespaces, valid_namespaces } from '../utils/namespaces';
import create_module from './create_module';
import { create_scopes, extract_names, Scope, extract_identifiers } from './utils/scope';
import Stylesheet from './css/Stylesheet';
import { test } from '../config';
import Fragment from './nodes/Fragment';
import internal_exports from './internal-exports';
import { Node, Ast, CompileOptions, Var, Warning } from '../interfaces';
import error from '../utils/error';
import get_code_frame from '../utils/get_code_frame';
import flatten_reference from './utils/flatten_reference';
import is_reference from 'is-reference';
import TemplateScope from './nodes/shared/TemplateScope';
import fuzzymatch from '../utils/fuzzymatch';
import { remove_indentation, add_indentation } from '../utils/indentation';
import get_object from './utils/get_object';
import unwrap_parens from './utils/unwrap_parens';
import Slot from './nodes/Slot';

type ComponentOptions = {
	namespace?: string;
	tag?: string;
	immutable?: boolean;
	accessors?: boolean;
	preserveWhitespace?: boolean;
};

// We need to tell estree-walker that it should always
// look for an `else` block, otherwise it might get
// the wrong idea about the shape of each/if blocks
childKeys.EachBlock = childKeys.IfBlock = ['children', 'else'];
childKeys.Attribute = ['value'];
childKeys.ExportNamedDeclaration = ['declaration', 'specifiers'];

function remove_node(code: MagicString, start: number, end: number, body: Node, node: Node) {
	const i = body.indexOf(node);
	if (i === -1) throw new Error('node not in list');

	let a;
	let b;

	if (body.length === 1) {
		// remove everything, leave {}
		a = start;
		b = end;
	} else if (i === 0) {
		// remove everything before second node, including comments
		a = start;
		while (/\s/.test(code.original[a])) a += 1;

		b = body[i].end;
		while (/[\s,]/.test(code.original[b])) b += 1;
	} else {
		// remove the end of the previous node to the end of this one
		a = body[i - 1].end;
		b = node.end;
	}

	code.remove(a, b);
	return;
}

export default class Component {
	stats: Stats;
	warnings: Warning[];

	ast: Ast;
	source: string;
	code: MagicString;
	name: string;
	compile_options: CompileOptions;
	fragment: Fragment;
	module_scope: Scope;
	instance_scope: Scope;
	instance_scope_map: WeakMap<Node, Scope>;

	component_options: ComponentOptions;
	namespace: string;
	tag: string;
	accessors: boolean;

	vars: Var[] = [];
	var_lookup: Map<string, Var> = new Map();

	imports: Node[] = [];
	module_javascript: string;
	javascript: string;

	hoistable_nodes: Set<Node> = new Set();
	node_for_declaration: Map<string, Node> = new Map();
	partly_hoisted: string[] = [];
	fully_hoisted: string[] = [];
	reactive_declarations: Array<{ assignees: Set<string>, dependencies: Set<string>, node: Node, declaration: Node }> = [];
	reactive_declaration_nodes: Set<Node> = new Set();
	has_reactive_assignments = false;
	injected_reactive_declaration_vars: Set<string> = new Set();
	helpers: Set<string> = new Set();

	indirect_dependencies: Map<string, Set<string>> = new Map();

	file: string;
	locate: (c: number) => { line: number, column: number };

	// TODO this does the same as component.locate! remove one or the other
	locator: (search: number, startIndex?: number) => {
		line: number,
		column: number
	};

	stylesheet: Stylesheet;

	aliases: Map<string, string> = new Map();
	used_names: Set<string> = new Set();
	globally_used_names: Set<string> = new Set();

	slots: Map<string, Slot> = new Map();
	slot_outlets: Set<string> = new Set();

	constructor(
		ast: Ast,
		source: string,
		name: string,
		compile_options: CompileOptions,
		stats: Stats,
		warnings: Warning[]
	) {
		this.name = name;

		this.stats = stats;
		this.warnings = warnings;
		this.ast = ast;
		this.source = source;
		this.compile_options = compile_options;

		this.file = compile_options.filename && (
			typeof process !== 'undefined' ? compile_options.filename.replace(process.cwd(), '').replace(/^[\/\\]/, '') : compile_options.filename
		);
		this.locate = getLocator(this.source);

		this.code = new MagicString(source);

		// styles
		this.stylesheet = new Stylesheet(source, ast, compile_options.filename, compile_options.dev);
		this.stylesheet.validate(this);

		this.component_options = process_component_options(this, this.ast.html.children);
		this.namespace = namespaces[this.component_options.namespace] || this.component_options.namespace;

		if (compile_options.customElement) {
			this.tag = this.component_options.tag || compile_options.tag;
			if (!this.tag) {
				throw new Error(`Cannot compile to a custom element without specifying a tag name via options.tag or <svelte:options>`);
			}
		} else {
			this.tag = this.name;
		}

		this.walk_module_js();
		this.walk_instance_js_pre_template();

		this.fragment = new Fragment(this, ast.html);
		this.name = this.get_unique_name(name);

		this.walk_instance_js_post_template();

		if (!compile_options.customElement) this.stylesheet.reify();

		this.stylesheet.warn_on_unused_selectors(this);
	}

	add_var(variable: Var) {
		this.vars.push(variable);
		this.var_lookup.set(variable.name, variable);
	}

	add_reference(name: string) {
		const variable = this.var_lookup.get(name);

		if (variable) {
			variable.referenced = true;
		} else if (name === '$$props') {
			this.add_var({
				name,
				injected: true,
				referenced: true
			});
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
			if (variable) variable.subscribable = true;
		} else {
			this.used_names.add(name);
		}
	}

	add_sourcemap_locations(node: Node) {
		walk(node, {
			enter: (node: Node) => {
				this.code.addSourcemapLocation(node.start);
				this.code.addSourcemapLocation(node.end);
			},
		});
	}

	alias(name: string) {
		if (!this.aliases.has(name)) {
			this.aliases.set(name, this.get_unique_name(name));
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
			const { compile_options, name } = this;
			const { format = 'esm' } = compile_options;

			const banner = `/* ${this.file ? `${this.file} ` : ``}generated by Svelte v${"__VERSION__"} */`;

			result = result
				.replace(/__svelte:self__/g, this.name)
				.replace(compile_options.generate === 'ssr' ? /(@+|#+)(\w*(?:-\w*)?)/g : /(@+)(\w*(?:-\w*)?)/g, (match: string, sigil: string, name: string) => {
					if (sigil === '@') {
						if (internal_exports.has(name)) {
							if (compile_options.dev && internal_exports.has(`${name}Dev`)) name = `${name}Dev`;
							this.helpers.add(name);
						}

						return this.alias(name);
					}

					return sigil.slice(1) + name;
				});

			const imported_helpers = Array.from(this.helpers)
				.sort()
				.map(name => {
					const alias = this.alias(name);
					return { name, alias };
				});

			const module = create_module(
				result,
				format,
				name,
				banner,
				compile_options.sveltePath,
				imported_helpers,
				this.imports,
				this.vars.filter(variable => variable.module && variable.export_name).map(variable => ({
					name: variable.name,
					as: variable.export_name
				})),
				this.source
			);

			const parts = module.split('✂]');
			const final_chunk = parts.pop();

			const compiled = new Bundle({ separator: '' });

			function add_string(str: string) {
				compiled.addSource({
					content: new MagicString(str),
				});
			}

			const { filename } = compile_options;

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
				if (chunk) add_string(chunk);

				const match = pattern.exec(str);

				const snippet = this.code.snip(+match[1], +match[2]);

				compiled.addSource({
					filename,
					content: snippet,
				});
			});

			add_string(final_chunk);

			css = compile_options.customElement ?
				{ code: null, map: null } :
				this.stylesheet.render(compile_options.cssOutputFilename, true);

			js = {
				code: compiled.toString(),
				map: compiled.generateMap({
					includeContent: true,
					file: compile_options.outputFilename,
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

	get_unique_name(name: string) {
		if (test) name = `${name}$`;
		let alias = name;
		for (
			let i = 1;
			reserved.has(alias) ||
			this.var_lookup.has(alias) ||
			this.used_names.has(alias) ||
			this.globally_used_names.has(alias);
			alias = `${name}_${i++}`
		);
		this.used_names.add(alias);
		return alias;
	}

	get_unique_name_maker() {
		const local_used_names = new Set();

		function add(name: string) {
			local_used_names.add(name);
		}

		reserved.forEach(add);
		internal_exports.forEach(add);
		this.var_lookup.forEach((value, key) => add(key));

		return (name: string) => {
			if (test) name = `${name}$`;
			let alias = name;
			for (
				let i = 1;
				this.used_names.has(alias) ||
				local_used_names.has(alias);
				alias = `${name}_${i++}`
			);
			local_used_names.add(alias);
			this.globally_used_names.add(alias);
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
			filename: this.compile_options.filename
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

		const frame = get_code_frame(this.source, start.line - 1, start.column);

		this.warnings.push({
			code: warning.code,
			message: warning.message,
			frame,
			start,
			end,
			pos: pos.start,
			filename: this.compile_options.filename,
			toString: () => `${warning.message} (${start.line + 1}:${start.column})\n${frame}`,
		});
	}

	extract_imports(content) {
		const { code } = this;

		content.body.forEach(node => {
			if (node.type === 'ImportDeclaration') {
				// imports need to be hoisted out of the IIFE
				remove_node(code, content.start, content.end, content.body, node);
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
				if (node.source) {
					this.error(node, {
						code: `not-implemented`,
						message: `A component currently cannot have an export ... from`
					});
				}
				if (node.declaration) {
					if (node.declaration.type === 'VariableDeclaration') {
						node.declaration.declarations.forEach(declarator => {
							extract_names(declarator.id).forEach(name => {
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
					remove_node(code, content.start, content.end, content.body, node);
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

		this.add_sourcemap_locations(script.content);

		let { scope, globals } = create_scopes(script.content);
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

		this.add_sourcemap_locations(script.content);

		// inject vars for reactive declarations
		script.content.body.forEach(node => {
			if (node.type !== 'LabeledStatement') return;
			if (node.body.type !== 'ExpressionStatement') return;

			const expression = unwrap_parens(node.body.expression);
			if (expression.type !== 'AssignmentExpression') return;

			extract_names(expression.left).forEach(name => {
				if (!this.var_lookup.has(name) && name[0] !== '$') {
					this.injected_reactive_declaration_vars.add(name);
				}
			});
		});

		let { scope: instance_scope, map, globals } = create_scopes(script.content);
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
			} else if (name === '$$props') {
				this.add_var({
					name,
					injected: true
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
				if (variable) variable.subscribable = true;
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
						? [get_object(node.left).name]
						: extract_names(node.left);
				} else if (node.type === 'UpdateExpression') {
					names = [get_object(node.argument).name];
				}

				if (names) {
					names.forEach(name => {
						if (scope.find_owner(name) === instance_scope) {
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

				if (is_reference(node, parent)) {
					const object = get_object(node);
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

		if (name[0] === '$' && name[1] !== '$') {
			return `${name.slice(1)}.set(${name})`
		}

		return `$$invalidate('${name}', ${value})`;
	}

	rewrite_props(get_insert: (variable: Var) => string) {
		const component = this;
		const { code, instance_scope, instance_scope_map: map } = this;
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

								extract_names(declarator.id).forEach(name => {
									const variable = component.var_lookup.get(name);

									if (variable.export_name) {
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

							if (variable.export_name) {
								if (current_group && current_group.kind !== node.kind) {
									current_group = null;
								}

								const insert = variable.subscribable
									? get_insert(variable)
									: null;

								if (!current_group || (current_group.insert && insert)) {
									current_group = { kind: node.kind, declarators: [declarator], insert };
									coalesced_declarations.push(current_group);
								} else if (insert) {
									current_group.insert = insert;
									current_group.declarators.push(declarator);
								} else {
									current_group.declarators.push(declarator);
								}

								if (variable.writable && variable.name !== variable.export_name) {
									code.prependRight(declarator.id.start, `${variable.export_name}: `)
								}

								if (next) {
									const next_variable = component.var_lookup.get(next.id.name)
									const new_declaration = !next_variable.export_name
										|| (current_group.insert && next_variable.subscribable)

									if (new_declaration) {
										code.overwrite(declarator.end, next.start, ` ${node.kind} `);
									}
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
						if (!parent || parent.type === 'Program') current_group = null;
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
			const writable = group.kind === 'var' || group.kind === 'let';

			let c = 0;
			let combining = false;

			group.declarators.forEach(declarator => {
				const { id } = declarator;

				if (combining) {
					code.overwrite(c, id.start, ', ');
				} else {
					if (writable) code.appendLeft(id.start, '{ ');
					combining = true;
				}

				c = declarator.end;
			});

			if (combining) {
				const insert = group.insert
					? `; ${group.insert}`
					: '';

				const suffix = `${writable ? ` } = $$props` : ``}${insert}` + (code.original[c] === ';' ? `` : `;`);
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

					const v = this.var_lookup.get(d.id.name)
					if (v.reassigned) return false
					if (v.export_name) return false

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

					if (is_reference(node, parent)) {
						const { name } = flatten_reference(node);
						const owner = scope.find_owner(name);

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
								} else if (other_declaration.type === 'ExportNamedDeclaration' && walking.has(other_declaration.declaration)) {
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
			if (is_hoistable(node)) {
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
				const assignee_nodes = new Set();
				const dependencies = new Set();

				let scope = this.instance_scope;
				let map = this.instance_scope_map;

				walk(node.body, {
					enter(node, parent) {
						if (map.has(node)) {
							scope = map.get(node);
						}

						if (node.type === 'AssignmentExpression') {
							extract_identifiers(get_object(node.left)).forEach(node => {
								assignee_nodes.add(node);
								assignees.add(node.name);
							});
						} else if (node.type === 'UpdateExpression') {
							const identifier = get_object(node.argument);
							assignees.add(identifier.name);
						} else if (is_reference(node, parent)) {
							const identifier = get_object(node);
							if (!assignee_nodes.has(identifier)) {
								const { name } = identifier;
								const owner = scope.find_owner(name);
								if (
									(!owner || owner === component.instance_scope) &&
									(name[0] === '$' || component.var_lookup.has(name) && component.var_lookup.get(name).writable)
								) {
									dependencies.add(name);
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

				add_indentation(this.code, node.body, 2);

				const expression = node.body.expression && unwrap_parens(node.body.expression);
				const declaration = expression && expression.left;

				unsorted_reactive_declarations.push({ assignees, dependencies, node, declaration });
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
		if (name === `$$props`) return `ctx.$$props`;

		const variable = this.var_lookup.get(name);

		if (!variable) return name;

		this.add_reference(name); // TODO we can probably remove most other occurrences of this

		if (variable.hoistable) return name;

		return `ctx.${name}`;
	}

	warn_if_undefined(node, template_scope: TemplateScope) {
		let { name } = node;

		if (name[0] === '$') {
			name = name.slice(1);
			this.has_reactive_assignments = true; // TODO does this belong here?

			if (name[0] === '$') return; // $$props
		}

		if (this.var_lookup.has(name) && !this.var_lookup.get(name).global) return;
		if (template_scope && template_scope.names.has(name)) return;
		if (globals.has(name)) return;

		let message = `'${name}' is not defined`;
		if (!this.ast.instance) message += `. Consider adding a <script> block with 'export let ${name}' to declare a prop`;

		this.warn(node, {
			code: 'missing-declaration',
			message
		});
	}
}

function process_component_options(component: Component, nodes) {
	const component_options: ComponentOptions = {
		immutable: component.compile_options.immutable || false,
		accessors: 'accessors' in component.compile_options
			? component.compile_options.accessors
			: !!component.compile_options.customElement,
		preserveWhitespace: !!component.compile_options.preserveWhitespace
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

						component_options.tag = tag;
						break;
					}

					case 'namespace': {
						const code = 'invalid-namespace-attribute';
						const message = `The 'namespace' attribute must be a string literal representing a valid namespace`;
						const ns = get_value(attribute, code, message);

						if (typeof ns !== 'string') component.error(attribute, { code, message });

						if (valid_namespaces.indexOf(ns) === -1) {
							const match = fuzzymatch(ns, valid_namespaces);
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

						component_options.namespace = ns;
						break;
					}

					case 'accessors':
					case 'immutable':
					case 'preserveWhitespace':
						const code = `invalid-${name}-value`;
						const message = `${name} attribute must be true or false`
						const value = get_value(attribute, code, message);

						if (typeof value !== 'boolean') component.error(attribute, { code, message });

						component_options[name] = value;
						break;

					default:
						component.error(attribute, {
							code: `invalid-options-attribute`,
							message: `<svelte:options> unknown attribute`
						});
				}
			}

			else {
				component.error(attribute, {
					code: `invalid-options-attribute`,
					message: `<svelte:options> can only have static 'tag', 'namespace', 'accessors', 'immutable' and 'preserveWhitespace' attributes`
				});
			}
		});
	}

	return component_options;
}
