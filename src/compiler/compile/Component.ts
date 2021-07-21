import { walk } from 'estree-walker';
import { getLocator } from 'locate-character';
import Stats from '../Stats';
import { globals, reserved, is_valid } from '../utils/names';
import { namespaces, valid_namespaces } from '../utils/namespaces';
import create_module from './create_module';
import {
	create_scopes,
	extract_names,
	Scope,
	extract_identifiers
} from './utils/scope';
import Stylesheet from './css/Stylesheet';
import { test } from '../config';
import Fragment from './nodes/Fragment';
import internal_exports from './internal_exports';
import { Ast, CompileOptions, Var, Warning, CssResult } from '../interfaces';
import error from '../utils/error';
import get_code_frame from '../utils/get_code_frame';
import flatten_reference from './utils/flatten_reference';
import is_used_as_reference from './utils/is_used_as_reference';
import is_reference, { NodeWithPropertyDefinition } from 'is-reference';
import TemplateScope from './nodes/shared/TemplateScope';
import fuzzymatch from '../utils/fuzzymatch';
import get_object from './utils/get_object';
import Slot from './nodes/Slot';
import { Node, ImportDeclaration, Identifier, Program, ExpressionStatement, AssignmentExpression, Literal } from 'estree';
import add_to_set from './utils/add_to_set';
import check_graph_for_cycles from './utils/check_graph_for_cycles';
import { print, x, b } from 'code-red';
import { is_reserved_keyword } from './utils/reserved_keywords';
import { apply_preprocessor_sourcemap } from '../utils/mapped_code';
import Element from './nodes/Element';
import { DecodedSourceMap, RawSourceMap } from '@ampproject/remapping/dist/types/types';
import { clone } from '../utils/clone';
import compiler_warnings from './compiler_warnings';
import compiler_errors from './compiler_errors';
import { extract_ignores_above_position, extract_svelte_ignore_from_comments } from '../utils/extract_svelte_ignore';

interface ComponentOptions {
	namespace?: string;
	tag?: string;
	immutable?: boolean;
	accessors?: boolean;
	preserveWhitespace?: boolean;
}

export default class Component {
	stats: Stats;
	warnings: Warning[];
	ignores: Set<string>;
	ignore_stack: Array<Set<string>> = [];

	ast: Ast;
	original_ast: Ast;
	source: string;
	name: Identifier;
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

	imports: ImportDeclaration[] = [];

	hoistable_nodes: Set<Node> = new Set();
	node_for_declaration: Map<string, Node> = new Map();
	partly_hoisted: Array<(Node | Node[])> = [];
	fully_hoisted: Array<(Node | Node[])> = [];
	reactive_declarations: Array<{
		assignees: Set<string>;
		dependencies: Set<string>;
		node: Node;
		declaration: Node;
	}> = [];
	reactive_declaration_nodes: Set<Node> = new Set();
	has_reactive_assignments = false;
	injected_reactive_declaration_vars: Set<string> = new Set();
	helpers: Map<string, Identifier> = new Map();
	globals: Map<string, Identifier> = new Map();

	indirect_dependencies: Map<string, Set<string>> = new Map();

	file: string;
	locate: (c: number) => { line: number; column: number };

	elements: Element[] = [];
	stylesheet: Stylesheet;

	aliases: Map<string, Identifier> = new Map();
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
		this.name = { type: 'Identifier', name };

		this.stats = stats;
		this.warnings = warnings;
		this.ast = ast;
		this.source = source;
		this.compile_options = compile_options;

		// the instance JS gets mutated, so we park
		// a copy here for later. TODO this feels gross
		this.original_ast = clone({
			html: ast.html,
			css: ast.css,
			instance: ast.instance,
			module: ast.module
		});

		this.file =
			compile_options.filename &&
			(typeof process !== 'undefined'
				? compile_options.filename
					.replace(process.cwd(), '')
					.replace(/^[/\\]/, '')
				: compile_options.filename);
		this.locate = getLocator(this.source, { offsetLine: 1 });

		// styles
		this.stylesheet = new Stylesheet({
			source,
			ast,
			filename: compile_options.filename,
			component_name: name,
			dev: compile_options.dev,
			get_css_hash: compile_options.cssHash
		});
		this.stylesheet.validate(this);

		this.component_options = process_component_options(
			this,
			this.ast.html.children
		);
		this.namespace =
			namespaces[this.component_options.namespace] ||
			this.component_options.namespace;

		if (compile_options.customElement) {
			if (
				this.component_options.tag === undefined &&
				compile_options.tag === undefined
			) {
				const svelteOptions = ast.html.children.find(
					child => child.name === 'svelte:options'
				) || { start: 0, end: 0 };
				this.warn(svelteOptions, compiler_warnings.custom_element_no_tag);
			}
			this.tag = this.component_options.tag || compile_options.tag;
		} else {
			this.tag = this.name.name;
		}

		this.walk_module_js();

		this.push_ignores(this.ast.instance ? extract_ignores_above_position(this.ast.instance.start, this.ast.html.children) : []);
		this.walk_instance_js_pre_template();
		this.pop_ignores();

		this.fragment = new Fragment(this, ast.html);
		this.name = this.get_unique_name(name);

		this.push_ignores(this.ast.instance ? extract_ignores_above_position(this.ast.instance.start, this.ast.html.children) : []);
		this.walk_instance_js_post_template();
		this.pop_ignores();

		this.elements.forEach(element => this.stylesheet.apply(element));
		if (!compile_options.customElement) this.stylesheet.reify();
		this.stylesheet.warn_on_unused_selectors(this);
	}

	add_var(variable: Var, add_to_lookup = true) {
		this.vars.push(variable);

		if (add_to_lookup) {
			this.var_lookup.set(variable.name, variable);
		}
	}

	add_reference(name: string) {
		const variable = this.var_lookup.get(name);

		if (variable) {
			variable.referenced = true;
		} else if (is_reserved_keyword(name)) {
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

			const variable = this.var_lookup.get(subscribable_name);
			if (variable) {
				variable.referenced = true;
				variable.subscribable = true;
			}
		} else {
			if (this.compile_options.varsReport === 'full') {
				this.add_var({ name, referenced: true }, false);
			}

			this.used_names.add(name);
		}
	}

	alias(name: string) {
		if (!this.aliases.has(name)) {
			this.aliases.set(name, this.get_unique_name(name));
		}

		return this.aliases.get(name);
	}

	apply_stylesheet(element: Element) {
		this.elements.push(element);
	}

	global(name: string) {
		const alias = this.alias(name);
		this.globals.set(name, alias);
		return alias;
	}

	generate(result?: { js: Node[]; css: CssResult }) {
		let js = null;
		let css = null;

		if (result) {
			const { compile_options, name } = this;
			const { format = 'esm' } = compile_options;

			const banner = `${this.file ? `${this.file} ` : ''}generated by Svelte v${'__VERSION__'}`;

			const program: any = { type: 'Program', body: result.js };

			walk(program, {
				enter: (node: Node, parent: Node, key) => {
					if (node.type === 'Identifier') {
						if (node.name[0] === '@') {
							if (node.name[1] === '_') {
								const alias = this.global(node.name.slice(2));
								node.name = alias.name;
							} else {
								let name = node.name.slice(1);

								if (compile_options.dev) {
									if (internal_exports.has(`${name}_dev`)) {
										name += '_dev';
									} else if (internal_exports.has(`${name}Dev`)) {
										name += 'Dev';
									}
								}

								const alias = this.alias(name);
								this.helpers.set(name, alias);
								node.name = alias.name;
							}
						} else if (node.name[0] !== '#' && !is_valid(node.name)) {
							// this hack allows x`foo.${bar}` where bar could be invalid
							const literal: Literal = { type: 'Literal', value: node.name };

							if (parent.type === 'Property' && key === 'key') {
								parent.key = literal;
							} else if (parent.type === 'MemberExpression' && key === 'property') {
								parent.property = literal;
								parent.computed = true;
							}
						}
					}
				}
			});

			const referenced_globals = Array.from(
				this.globals,
				([name, alias]) => name !== alias.name && { name, alias }
			).filter(Boolean);
			if (referenced_globals.length) {
				this.helpers.set('globals', this.alias('globals'));
			}
			const imported_helpers = Array.from(this.helpers, ([name, alias]) => ({
				name,
				alias
			}));

			create_module(
				program,
				format,
				name,
				banner,
				compile_options.sveltePath,
				imported_helpers,
				referenced_globals,
				this.imports,
				this.vars
					.filter(variable => variable.module && variable.export_name)
					.map(variable => ({
						name: variable.name,
						as: variable.export_name
					}))
			);

			css = compile_options.customElement
				? { code: null, map: null }
				: result.css;

			js = print(program, {
				sourceMapSource: compile_options.filename
			});

			js.map.sources = [
				compile_options.filename ? get_relative_path(compile_options.outputFilename || '', compile_options.filename) : null
			];

			js.map.sourcesContent = [
				this.source
			];

			js.map = apply_preprocessor_sourcemap(this.file, js.map, compile_options.sourcemap as (string | RawSourceMap | DecodedSourceMap));
		}

		return {
			js,
			css,
			ast: this.original_ast,
			warnings: this.warnings,
			vars: this.get_vars_report(),
			stats: this.stats.render()
		};
	}

	get_unique_name(name: string, scope?: Scope): Identifier {
		if (test) name = `${name}$`;
		let alias = name;
		for (
			let i = 1;
			reserved.has(alias) ||
			this.var_lookup.has(alias) ||
			this.used_names.has(alias) ||
			this.globally_used_names.has(alias) ||
			(scope && scope.has(alias));
			alias = `${name}_${i++}`
		);
		this.used_names.add(alias);
		return { type: 'Identifier', name: alias };
	}

	get_unique_name_maker() {
		const local_used_names = new Set();

		function add(name: string) {
			local_used_names.add(name);
		}

		reserved.forEach(add);
		internal_exports.forEach(add);
		this.var_lookup.forEach((_value, key) => add(key));

		return (name: string): Identifier => {
			if (test) name = `${name}$`;
			let alias = name;
			for (
				let i = 1;
				this.used_names.has(alias) || local_used_names.has(alias);
				alias = `${name}_${i++}`
			);
			local_used_names.add(alias);
			this.globally_used_names.add(alias);

			return {
				type: 'Identifier',
				name: alias
			};
		};
	}

	get_vars_report(): Var[] {
		const { compile_options, vars } = this;

		const vars_report = compile_options.varsReport === false
			? []
			: compile_options.varsReport === 'full'
				? vars
				: vars.filter(v => !v.global && !v.internal);

		return vars_report.map(v => ({
			name: v.name,
			export_name: v.export_name || null,
			injected: v.injected || false,
			module: v.module || false,
			mutated: v.mutated || false,
			reassigned: v.reassigned || false,
			referenced: v.referenced || false,
			writable: v.writable || false,
			referenced_from_script: v.referenced_from_script || false
		}));
	}

	error(
		pos: {
			start: number;
			end: number;
		},
		e: {
			code: string;
			message: string;
		}
	) {
		if (this.compile_options.errorMode === 'warn') {
			this.warn(pos, e);
		} else {
			error(e.message, {
				name: 'ValidationError',
				code: e.code,
				source: this.source,
				start: pos.start,
				end: pos.end,
				filename: this.compile_options.filename
			});
		}
	}

	warn(
		pos: {
			start: number;
			end: number;
		},
		warning: {
			code: string;
			message: string;
		}
	) {
		if (this.ignores && this.ignores.has(warning.code)) {
			return;
		}

		const start = this.locate(pos.start);
		const end = this.locate(pos.end);

		const frame = get_code_frame(this.source, start.line - 1, start.column);

		this.warnings.push({
			code: warning.code,
			message: warning.message,
			frame,
			start,
			end,
			pos: pos.start,
			filename: this.compile_options.filename,
			toString: () =>
				`${warning.message} (${start.line}:${start.column})\n${frame}`
		});
	}

	extract_imports(node) {
		this.imports.push(node);
	}

	extract_exports(node) {
		const ignores = extract_svelte_ignore_from_comments(node);
		if (ignores.length) this.push_ignores(ignores);
		const result = this._extract_exports(node);
		if (ignores.length) this.pop_ignores();
		return result;
	}

	private _extract_exports(node) {
		if (node.type === 'ExportDefaultDeclaration') {
			return this.error(node, compiler_errors.default_export);
		}

		if (node.type === 'ExportNamedDeclaration') {
			if (node.source) {
				return this.error(node, compiler_errors.not_implemented);
			}
			if (node.declaration) {
				if (node.declaration.type === 'VariableDeclaration') {
					node.declaration.declarations.forEach(declarator => {
						extract_names(declarator.id).forEach(name => {
							const variable = this.var_lookup.get(name);
							variable.export_name = name;
							if (variable.writable && !(variable.referenced || variable.referenced_from_script || variable.subscribable)) {
								this.warn(declarator, compiler_warnings.unused_export_let(this.name.name, name));
							}
						});
					});
				} else {
					const { name } = node.declaration.id;

					const variable = this.var_lookup.get(name);
					variable.export_name = name;
				}

				return node.declaration;
			} else {
				node.specifiers.forEach(specifier => {
					const variable = this.var_lookup.get(specifier.local.name);

					if (variable) {
						variable.export_name = specifier.exported.name;

						if (variable.writable && !(variable.referenced || variable.referenced_from_script || variable.subscribable)) {
							this.warn(specifier, compiler_warnings.unused_export_let(this.name.name, specifier.exported.name));
						}
					}
				});

				return null;
			}
		}
	}

	extract_javascript(script) {
		if (!script) return null;

		return script.content.body.filter(node => {
			if (!node) return false;
			if (this.hoistable_nodes.has(node)) return false;
			if (this.reactive_declaration_nodes.has(node)) return false;
			if (node.type === 'ImportDeclaration') return false;
			if (node.type === 'ExportDeclaration' && node.specifiers.length > 0) return false;
			return true;
		});
	}

	walk_module_js() {
		const component = this;
		const script = this.ast.module;
		if (!script) return;

		walk(script.content, {
			enter(node: Node) {
				if (node.type === 'LabeledStatement' && node.label.name === '$') {
					component.warn(node as any, compiler_warnings.module_script_reactive_declaration);
				}
			}
		});

		const { scope, globals } = create_scopes(script.content);
		this.module_scope = scope;

		scope.declarations.forEach((node, name) => {
			if (name[0] === '$') {
				return this.error(node as any, compiler_errors.illegal_declaration);
			}

			const writable = node.type === 'VariableDeclaration' && (node.kind === 'var' || node.kind === 'let');

			this.add_var({
				name,
				module: true,
				hoistable: true,
				writable
			});
		});

		globals.forEach((node, name) => {
			if (name[0] === '$') {
				return this.error(node as any, compiler_errors.illegal_subscription);
			} else {
				this.add_var({
					name,
					global: true,
					hoistable: true
				});
			}
		});

		const { body } = script.content;
		let i = body.length;
		while (--i >= 0) {
			const node = body[i];
			if (node.type === 'ImportDeclaration') {
				this.extract_imports(node);
				body.splice(i, 1);
			}

			if (/^Export/.test(node.type)) {
				const replacement = this.extract_exports(node);
				if (replacement) {
					body[i] = replacement;
				} else {
					body.splice(i, 1);
				}
			}
		}
	}

	walk_instance_js_pre_template() {
		const script = this.ast.instance;
		if (!script) return;

		// inject vars for reactive declarations
		script.content.body.forEach(node => {
			if (node.type !== 'LabeledStatement') return;
			if (node.body.type !== 'ExpressionStatement') return;

			const { expression } = node.body;
			if (expression.type !== 'AssignmentExpression') return;
			if (expression.left.type === 'MemberExpression') return;

			extract_names(expression.left).forEach(name => {
				if (!this.var_lookup.has(name) && name[0] !== '$') {
					this.injected_reactive_declaration_vars.add(name);
				}
			});
		});

		const { scope: instance_scope, map, globals } = create_scopes(
			script.content
		);
		this.instance_scope = instance_scope;
		this.instance_scope_map = map;

		instance_scope.declarations.forEach((node, name) => {
			if (name[0] === '$') {
				return this.error(node as any, compiler_errors.illegal_declaration);
			}

			const writable = node.type === 'VariableDeclaration' && (node.kind === 'var' || node.kind === 'let');
			const imported = node.type.startsWith('Import');

			this.add_var({
				name,
				initialised: instance_scope.initialised_declarations.has(name),
				writable,
				imported
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
			} else if (is_reserved_keyword(name)) {
				this.add_var({
					name,
					injected: true
				});
			} else if (name[0] === '$') {
				if (name === '$' || name[1] === '$') {
					return this.error(node as any, compiler_errors.illegal_global(name));
				}

				this.add_var({
					name,
					injected: true,
					mutated: true,
					writable: true
				});

				this.add_reference(name.slice(1));

				const variable = this.var_lookup.get(name.slice(1));
				if (variable) {
					variable.subscribable = true;
					variable.referenced_from_script = true;
				}
			} else {
				this.add_var({
					name,
					global: true,
					hoistable: true
				});
			}
		});

		this.track_references_and_mutations();
	}

	walk_instance_js_post_template() {
		const script = this.ast.instance;
		if (!script) return;

		this.post_template_walk();

		this.hoist_instance_declarations();
		this.extract_reactive_declarations();
	}

	post_template_walk() {
		const script = this.ast.instance;
		if (!script) return;

		const component = this;
		const { content } = script;
		const { instance_scope, instance_scope_map: map } = this;

		let scope = instance_scope;

		const to_remove = [];
		const remove = (parent, prop, index) => {
			to_remove.unshift([parent, prop, index]);
		};
		let scope_updated = false;

		let generator_count = 0;

		walk(content, {
			enter(node: Node, parent: Node, prop, index) {
				if ((node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') && node.generator === true) {
					generator_count++;
				}

				if (map.has(node)) {
					scope = map.get(node);
				}

				if (node.type === 'ImportDeclaration') {
					component.extract_imports(node);
					// TODO: to use actual remove
					remove(parent, prop, index);
					return this.skip();
				}

				if (/^Export/.test(node.type)) {
					const replacement = component.extract_exports(node);
					if (replacement) {
						this.replace(replacement);
					} else {
						// TODO: to use actual remove
						remove(parent, prop, index);
					}
					return this.skip();
				}

				component.warn_on_undefined_store_value_references(node, parent, prop, scope);
			},

			leave(node: Node) {
				if ((node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') && node.generator === true) {
					generator_count--;
				}

				// do it on leave, to prevent infinite loop
				if (component.compile_options.dev && component.compile_options.loopGuardTimeout > 0 && generator_count <= 0) {
					const to_replace_for_loop_protect = component.loop_protect(node, scope, component.compile_options.loopGuardTimeout);
					if (to_replace_for_loop_protect) {
						this.replace(to_replace_for_loop_protect);
						scope_updated = true;
					}
				}

				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		});

		for (const [parent, prop, index] of to_remove) {
			if (parent) {
				if (index !== null) {
					parent[prop].splice(index, 1);
				} else {
					delete parent[prop];
				}
			}
		}

		if (scope_updated) {
			const { scope, map } = create_scopes(script.content);
			this.instance_scope = scope;
			this.instance_scope_map = map;
		}
	}

	track_references_and_mutations() {
		const script = this.ast.instance;
		if (!script) return;

		const component = this;
		const { content } = script;
		const { instance_scope, module_scope, instance_scope_map: map } = this;

		let scope = instance_scope;

		walk(content, {
			enter(node: Node, parent: Node) {
				if (map.has(node)) {
					scope = map.get(node);
				}

				if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
					const assignee = node.type === 'AssignmentExpression' ? node.left : node.argument;
					const names = extract_names(assignee as Node);

					const deep = assignee.type === 'MemberExpression';

					names.forEach(name => {
						const scope_owner = scope.find_owner(name);
						if (
							scope_owner !== null
								? scope_owner === instance_scope
								: module_scope && module_scope.has(name)
						) {
							const variable = component.var_lookup.get(name);
							variable[deep ? 'mutated' : 'reassigned'] = true;
						}
					});
				}

				if (is_used_as_reference(node, parent)) {
					const object = get_object(node);
					if (scope.find_owner(object.name) === instance_scope) {
						const variable = component.var_lookup.get(object.name);
						variable.referenced_from_script = true;
					}
				}
			},

			leave(node: Node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		});
	}

	warn_on_undefined_store_value_references(node: Node, parent: Node, prop: string, scope: Scope) {
		if (
			node.type === 'LabeledStatement' &&
			node.label.name === '$' &&
			parent.type !== 'Program'
		) {
			this.warn(node as any, compiler_warnings.non_top_level_reactive_declaration);
		}

		if (is_reference(node as NodeWithPropertyDefinition, parent as NodeWithPropertyDefinition)) {
			const object = get_object(node);
			const { name } = object;

			if (name[0] === '$') {
				if (!scope.has(name)) {
					this.warn_if_undefined(name, object, null);
				}

				if (name[1] !== '$' && scope.has(name.slice(1)) && scope.find_owner(name.slice(1)) !== this.instance_scope) {
					if (!((/Function/.test(parent.type) && prop === 'params') || (parent.type === 'VariableDeclarator' && prop === 'id'))) {
						return this.error(node as any, compiler_errors.contextual_store);
					}
				}
			}
		}
	}

	loop_protect(node, scope: Scope, timeout: number): Node | null {
		if (node.type === 'WhileStatement' ||
			node.type === 'ForStatement' ||
			node.type === 'DoWhileStatement') {
			const guard = this.get_unique_name('guard', scope);
			this.used_names.add(guard.name);

			const before = b`const ${guard} = @loop_guard(${timeout})`;
			const inside = b`${guard}();`;

			// wrap expression statement with BlockStatement
			if (node.body.type !== 'BlockStatement') {
				node.body = {
					type: 'BlockStatement',
					body: [node.body]
				};
			}
			node.body.body.push(inside[0]);

			return {
				type: 'BlockStatement',
				body: [
					before[0],
					node
				]
			};
		}
		return null;
	}

	rewrite_props(get_insert: (variable: Var) => Node[]) {
		if (!this.ast.instance) return;

		const component = this;
		const { instance_scope, instance_scope_map: map } = this;
		let scope = instance_scope;

		walk(this.ast.instance.content, {
			enter(node: Node, parent, key, index) {
				if (/Function/.test(node.type)) {
					return this.skip();
				}

				if (map.has(node)) {
					scope = map.get(node);
				}

				if (node.type === 'VariableDeclaration') {
					if (node.kind === 'var' || scope === instance_scope) {
						node.declarations.forEach(declarator => {
							if (declarator.id.type !== 'Identifier') {
								const inserts = [];

								extract_names(declarator.id).forEach(name => {
									const variable = component.var_lookup.get(name);

									if (variable.export_name) {
										// TODO is this still true post-#3539?
										return component.error(declarator as any, compiler_errors.destructured_prop);
									}

									if (variable.subscribable) {
										inserts.push(get_insert(variable));
									}
								});

								if (inserts.length) {
									parent[key].splice(index + 1, 0, ...inserts);
								}

								return;
							}

							const { name } = declarator.id;
							const variable = component.var_lookup.get(name);

							if (variable.export_name && variable.writable) {
								declarator.id = {
									type: 'ObjectPattern',
									properties: [{
										type: 'Property',
										method: false,
										shorthand: false,
										computed: false,
										kind: 'init',
										key: { type: 'Identifier', name: variable.export_name },
										value: declarator.init
											? {
												type: 'AssignmentPattern',
												left: declarator.id,
												right: declarator.init
											}
											: declarator.id
									}]
								};

								declarator.init = x`$$props`;
							}

							if (variable.subscribable && declarator.init) {
								const insert = get_insert(variable);
								parent[key].splice(index + 1, 0, ...insert);
							}
						});
					}
				}
			},

			leave(node: Node, parent, _key, index) {
				if (map.has(node)) {
					scope = scope.parent;
				}

				if (node.type === 'ExportNamedDeclaration' && node.declaration) {
					(parent as Program).body[index] = node.declaration;
				}
			}
		});
	}

	hoist_instance_declarations() {
		// we can safely hoist variable declarations that are
		// initialised to literals, and functions that don't
		// reference instance variables other than other
		// hoistable functions. TODO others?

		const {
			hoistable_nodes,
			var_lookup,
			injected_reactive_declaration_vars,
			imports
		} = this;

		const top_level_function_declarations = new Map();

		const { body } = this.ast.instance.content;

		for (let i = 0; i < body.length; i += 1) {
			const node = body[i];

			if (node.type === 'VariableDeclaration') {
				const all_hoistable = node.declarations.every(d => {
					if (!d.init) return false;
					if (d.init.type !== 'Literal') return false;

					// everything except const values can be changed by e.g. svelte devtools
					// which means we can't hoist it
					if (node.kind !== 'const' && this.compile_options.dev) return false;

					const { name } = d.id as Identifier;

					const v = this.var_lookup.get(name);
					if (v.reassigned) return false;
					if (v.export_name) return false;

					if (this.var_lookup.get(name).reassigned) return false;
					if (
						this.vars.find(
							variable => variable.name === name && variable.module
						)
					) {
						return false;
					}

					return true;
				});

				if (all_hoistable) {
					node.declarations.forEach(d => {
						const variable = this.var_lookup.get((d.id as Identifier).name);
						variable.hoistable = true;
					});

					hoistable_nodes.add(node);

					body.splice(i--, 1);
					this.fully_hoisted.push(node);
				}
			}

			if (
				node.type === 'ExportNamedDeclaration' &&
				node.declaration &&
				node.declaration.type === 'FunctionDeclaration'
			) {
				top_level_function_declarations.set(node.declaration.id.name, node);
			}

			if (node.type === 'FunctionDeclaration') {
				top_level_function_declarations.set(node.id.name, node);
			}
		}

		const checked = new Set();
		const walking = new Set();

		const is_hoistable = fn_declaration => {
			if (fn_declaration.type === 'ExportNamedDeclaration') {
				fn_declaration = fn_declaration.declaration;
			}

			const instance_scope = this.instance_scope;
			let scope = this.instance_scope;
			const map = this.instance_scope_map;

			let hoistable = true;

			// handle cycles
			walking.add(fn_declaration);

			walk(fn_declaration, {
				enter(node: Node, parent) {
					if (!hoistable) return this.skip();

					if (map.has(node)) {
						scope = map.get(node);
					}

					if (is_reference(node as NodeWithPropertyDefinition, parent as NodeWithPropertyDefinition)) {
						const { name } = flatten_reference(node);
						const owner = scope.find_owner(name);

						if (injected_reactive_declaration_vars.has(name)) {
							hoistable = false;
						} else if (name[0] === '$' && !owner) {
							hoistable = false;
						} else if (owner === instance_scope) {
							const variable = var_lookup.get(name);

							if (variable.reassigned || variable.mutated) hoistable = false;

							if (name === fn_declaration.id.name) return;

							if (variable.hoistable) return;

							if (top_level_function_declarations.has(name)) {
								const other_declaration = top_level_function_declarations.get(
									name
								);

								if (walking.has(other_declaration)) {
									hoistable = false;
								} else if (
									other_declaration.type === 'ExportNamedDeclaration' &&
									walking.has(other_declaration.declaration)
								) {
									hoistable = false;
								} else if (!is_hoistable(other_declaration)) {
									hoistable = false;
								}
							} else {
								hoistable = false;
							}
						}

						this.skip();
					}
				},

				leave(node: Node) {
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

				const i = body.indexOf(node);
				body.splice(i, 1);
				this.fully_hoisted.push(node);
			}
		}

		for (const { specifiers } of imports) {
			for (const specifier of specifiers) {
				const variable = var_lookup.get(specifier.local.name);

				if (!variable.mutated || variable.subscribable) {
					variable.hoistable = true;
				}
			}
		}
	}

	extract_reactive_declarations() {
		const component = this;

		const unsorted_reactive_declarations: Array<{
			assignees: Set<string>;
			dependencies: Set<string>;
			node: Node;
			declaration: Node;
		}> = [];

		this.ast.instance.content.body.forEach(node => {
			const ignores = extract_svelte_ignore_from_comments(node);
			if (ignores.length) this.push_ignores(ignores);

			if (node.type === 'LabeledStatement' && node.label.name === '$') {
				this.reactive_declaration_nodes.add(node);

				const assignees = new Set<string>();
				const assignee_nodes = new Set();
				const dependencies = new Set<string>();
				const module_dependencies = new Set<string>();

				let scope = this.instance_scope;
				const map = this.instance_scope_map;

				walk(node.body, {
					enter(node: Node, parent) {
						if (map.has(node)) {
							scope = map.get(node);
						}

						if (node.type === 'AssignmentExpression') {
							const left = get_object(node.left);

							extract_identifiers(left).forEach(node => {
								assignee_nodes.add(node);
								assignees.add(node.name);
							});

							if (node.operator !== '=') {
								dependencies.add(left.name);
							}
						} else if (node.type === 'UpdateExpression') {
							const identifier = get_object(node.argument);
							assignees.add(identifier.name);
						} else if (is_reference(node as NodeWithPropertyDefinition, parent as NodeWithPropertyDefinition)) {
							const identifier = get_object(node);
							if (!assignee_nodes.has(identifier)) {
								const { name } = identifier;
								const owner = scope.find_owner(name);
								const variable = component.var_lookup.get(name);
								let should_add_as_dependency = true;

								if (variable) {
									variable.is_reactive_dependency = true;
									if (variable.module) {
										should_add_as_dependency = false;
										module_dependencies.add(name);
									}
								}
								const is_writable_or_mutated =
									variable && (variable.writable || variable.mutated);
								if (
									should_add_as_dependency &&
									(!owner || owner === component.instance_scope) &&
									(name[0] === '$' || is_writable_or_mutated)
								) {
									dependencies.add(name);
								}
							}

							this.skip();
						}
					},

					leave(node: Node) {
						if (map.has(node)) {
							scope = scope.parent;
						}
					}
				});

				if (module_dependencies.size > 0 && dependencies.size === 0) {
					component.warn(node.body as any, compiler_warnings.module_script_variable_reactive_declaration(Array.from(module_dependencies)));
				}

				const { expression } = node.body as ExpressionStatement;
				const declaration = expression && (expression as AssignmentExpression).left;

				unsorted_reactive_declarations.push({
					assignees,
					dependencies,
					node,
					declaration
				});
			}

			if (ignores.length) this.pop_ignores();
		});

		const lookup = new Map();

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

		const cycle = check_graph_for_cycles(unsorted_reactive_declarations.reduce((acc, declaration) => {
			declaration.assignees.forEach(v => {
				declaration.dependencies.forEach(w => {
					if (!declaration.assignees.has(w)) {
						acc.push([v, w]);
					}
				});
			});
			return acc;
		}, []));

		if (cycle && cycle.length) {
			const declarationList = lookup.get(cycle[0]);
			const declaration = declarationList[0];
			return this.error(declaration.node, compiler_errors.cyclical_reactive_declaration(cycle));
		}

		const add_declaration = declaration => {
			if (this.reactive_declarations.includes(declaration)) return;

			declaration.dependencies.forEach(name => {
				if (declaration.assignees.has(name)) return;
				const earlier_declarations = lookup.get(name);
				if (earlier_declarations) {
					earlier_declarations.forEach(add_declaration);
				}
			});

			this.reactive_declarations.push(declaration);
		};

		unsorted_reactive_declarations.forEach(add_declaration);
	}

	warn_if_undefined(name: string, node, template_scope: TemplateScope) {
		if (name[0] === '$') {
			if (name === '$' || name[1] === '$' && !is_reserved_keyword(name)) {
				return this.error(node, compiler_errors.illegal_global(name));
			}

			this.has_reactive_assignments = true; // TODO does this belong here?

			if (is_reserved_keyword(name)) return;

			name = name.slice(1);
		}

		if (this.var_lookup.has(name) && !this.var_lookup.get(name).global) return;
		if (template_scope && template_scope.names.has(name)) return;
		if (globals.has(name) && node.type !== 'InlineComponent') return;

		this.warn(node, compiler_warnings.missing_declaration(name, !!this.ast.instance));
	}

	push_ignores(ignores) {
		this.ignores = new Set(this.ignores || []);
		add_to_set(this.ignores, ignores);
		this.ignore_stack.push(this.ignores);
	}

	pop_ignores() {
		this.ignore_stack.pop();
		this.ignores = this.ignore_stack[this.ignore_stack.length - 1];
	}
}

function process_component_options(component: Component, nodes) {
	const component_options: ComponentOptions = {
		immutable: component.compile_options.immutable || false,
		accessors:
			'accessors' in component.compile_options
				? component.compile_options.accessors
				: !!component.compile_options.customElement,
		preserveWhitespace: !!component.compile_options.preserveWhitespace,
		namespace: component.compile_options.namespace
	};

	const node = nodes.find(node => node.name === 'svelte:options');

	function get_value(attribute, {code, message}) {
		const { value } = attribute;
		const chunk = value[0];

		if (!chunk) return true;

		if (value.length > 1) {
			return component.error(attribute, { code, message });
		}

		if (chunk.type === 'Text') return chunk.data;

		if (chunk.expression.type !== 'Literal') {
			return component.error(attribute, { code, message });
		}

		return chunk.expression.value;
	}

	if (node) {
		node.attributes.forEach(attribute => {
			if (attribute.type === 'Attribute') {
				const { name } = attribute;

				switch (name) {
					case 'tag': {
						const tag = get_value(attribute, compiler_errors.invalid_tag_attribute);

						if (typeof tag !== 'string' && tag !== null) {
							return component.error(attribute, compiler_errors.invalid_tag_attribute);
						}

						if (tag && !/^[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]+$/.test(tag)) {
							return component.error(attribute, compiler_errors.invalid_tag_property);
						}

						if (tag && !component.compile_options.customElement) {
							component.warn(attribute, compiler_warnings.missing_custom_element_compile_options);
						}

						component_options.tag = tag;
						break;
					}

					case 'namespace': {
						const ns = get_value(attribute, compiler_errors.invalid_namespace_attribute);

						if (typeof ns !== 'string') {
							return component.error(attribute, compiler_errors.invalid_namespace_attribute);
						}

						if (valid_namespaces.indexOf(ns) === -1) {
							const match = fuzzymatch(ns, valid_namespaces);
							return component.error(attribute, compiler_errors.invalid_namespace_property(ns, match));
						}

						component_options.namespace = ns;
						break;
					}

					case 'accessors':
					case 'immutable':
					case 'preserveWhitespace': {
						const value = get_value(attribute, compiler_errors.invalid_attribute_value(name));

						if (typeof value !== 'boolean') {
							return component.error(attribute, compiler_errors.invalid_attribute_value(name));
						}

						component_options[name] = value;
						break;
					}

					default:
						return component.error(attribute, compiler_errors.invalid_options_attribute_unknown);
				}
			} else {
				return component.error(attribute, compiler_errors.invalid_options_attribute);
			}
		});
	}

	return component_options;
}

function get_relative_path(from: string, to: string) {
	const from_parts = from.split(/[/\\]/);
	const to_parts = to.split(/[/\\]/);

	from_parts.pop(); // get dirname

	while (from_parts[0] === to_parts[0]) {
		from_parts.shift();
		to_parts.shift();
	}

	if (from_parts.length) {
		let i = from_parts.length;
		while (i--) from_parts[i] = '..';
	}

	return from_parts.concat(to_parts).join('/');
}
