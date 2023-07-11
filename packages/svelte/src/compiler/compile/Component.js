import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { walk } from 'estree-walker';
import { getLocator } from 'locate-character';
import { reserved, is_valid } from '../utils/names.js';
import globals from '../utils/globals.js';
import { namespaces, valid_namespaces } from '../utils/namespaces.js';
import create_module from './create_module.js';
import { create_scopes, extract_names, extract_identifiers } from './utils/scope.js';
import Stylesheet from './css/Stylesheet.js';
import Fragment from './nodes/Fragment.js';
import internal_exports from './internal_exports.js';
import error from '../utils/error.js';
import get_code_frame from '../utils/get_code_frame.js';
import flatten_reference from './utils/flatten_reference.js';
import is_used_as_reference from './utils/is_used_as_reference.js';
import is_reference from 'is-reference';
import fuzzymatch from '../utils/fuzzymatch.js';
import get_object from './utils/get_object.js';
import add_to_set from './utils/add_to_set.js';
import check_graph_for_cycles from './utils/check_graph_for_cycles.js';
import { print, b } from 'code-red';
import { is_reserved_keyword } from './utils/reserved_keywords.js';
import { apply_preprocessor_sourcemap } from '../utils/mapped_code.js';
import { clone } from '../utils/clone.js';
import compiler_warnings from './compiler_warnings.js';
import compiler_errors from './compiler_errors.js';
import {
	extract_ignores_above_position,
	extract_svelte_ignore_from_comments
} from '../utils/extract_svelte_ignore.js';
import check_enable_sourcemap from './utils/check_enable_sourcemap.js';
import { VERSION } from '../../shared/version.js';

const regex_leading_directory_separator = /^[/\\]/;
const regex_starts_with_term_export = /^Export/;
const regex_contains_term_function = /Function/;

export default class Component {
	/** @type {import('../Stats.js').default} */
	stats;

	/** @type {import('../interfaces.js').Warning[]} */
	warnings;

	/** @type {Set<string>} */
	ignores;

	/** @type {Array<Set<string>>} */
	ignore_stack = [];

	/** @type {import('../interfaces.js').Ast} */
	ast;

	/** @type {import('../interfaces.js').Ast} */
	original_ast;

	/** @type {string} */
	source;

	/** @type {import('estree').Identifier} */
	name;

	/** @type {import('../interfaces.js').CompileOptions} */
	compile_options;

	/** @type {import('./nodes/Fragment.js').default} */
	fragment;

	/** @type {import('./utils/scope.js').Scope} */
	module_scope;

	/** @type {import('./utils/scope.js').Scope} */
	instance_scope;

	/** @type {WeakMap<import('estree').Node, import('./utils/scope.js').Scope>} */
	instance_scope_map;

	/** @type {ComponentOptions} */
	component_options;

	/** @type {string} */
	namespace;

	/** @type {string} */
	tag;

	/** @type {boolean} */
	accessors;

	/** @type {import('../interfaces.js').Var[]} */
	vars = [];

	/** @type {Map<string, import('../interfaces.js').Var>} */
	var_lookup = new Map();

	/** @type {import('estree').ImportDeclaration[]} */
	imports = [];

	/** @type {import('estree').ExportNamedDeclaration[]} */
	exports_from = [];

	/** @type {import('estree').ExportNamedDeclaration[]} */
	instance_exports_from = [];

	/** @type {Set<import('estree').Node>} */
	hoistable_nodes = new Set();

	/** @type {Map<string, import('estree').Node>} */
	node_for_declaration = new Map();

	/** @type {Array<import('estree').Node | import('estree').Node[]>} */
	partly_hoisted = [];

	/** @type {Array<import('estree').Node | import('estree').Node[]>} */
	fully_hoisted = [];
	/**
	 * @type {Array<{
	 * 		assignees: Set<string>;
	 * 		dependencies: Set<string>;
	 * 		node: import('estree').Node;
	 * 		declaration: import('estree').Node;
	 * 	}>}
	 */
	reactive_declarations = [];

	/** @type {Set<import('estree').Node>} */
	reactive_declaration_nodes = new Set();
	/** */
	has_reactive_assignments = false;

	/** @type {Set<string>} */
	injected_reactive_declaration_vars = new Set();

	/** @type {Map<string, import('estree').Identifier>} */
	helpers = new Map();

	/** @type {Map<string, import('estree').Identifier>} */
	globals = new Map();

	/** @type {Map<string, Set<string>>} */
	indirect_dependencies = new Map();

	/** @type {string} */
	file;

	/**
	 * Use this for stack traces. It is 1-based and acts on pre-processed sources.
	 * Use `meta_locate` for metadata on DOM elements.
	 * @type {(c: number) => { line: number; column: number }}
	 */
	locate;

	/**
	 * Use this for metadata on DOM elements. It is 1-based and acts on sources that have not been pre-processed.
	 * Use `locate` for source mappings.
	 * @type {(c: number) => { line: number; column: number }}
	 */
	meta_locate;

	/** @type {import('./nodes/Element.js').default[]} */
	elements = [];

	/** @type {import('./css/Stylesheet.js').default} */
	stylesheet;

	/** @type {Map<string, import('estree').Identifier>} */
	aliases = new Map();

	/** @type {Set<string>} */
	used_names = new Set();

	/** @type {Set<string>} */
	globally_used_names = new Set();

	/** @type {Map<string, import('./nodes/Slot.js').default>} */
	slots = new Map();

	/** @type {Set<string>} */
	slot_outlets = new Set();

	/** @type {import('./nodes/shared/Tag.js').default[]} */
	tags = [];

	/**
	 * @param {import('../interfaces.js').Ast} ast
	 * @param {string} source
	 * @param {string} name
	 * @param {import('../interfaces.js').CompileOptions} compile_options
	 * @param {import('../Stats.js').default} stats
	 * @param {import('../interfaces.js').Warning[]} warnings
	 */
	constructor(ast, source, name, compile_options, stats, warnings) {
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
						.replace(regex_leading_directory_separator, '')
				: compile_options.filename);

		// line numbers in stack trace frames are 1-based. source maps are 0-based
		this.locate = getLocator(this.source, { offsetLine: 1 });
		/** @type {TraceMap | null | undefined} initialise lazy because only used in dev mode */
		let tracer;
		this.meta_locate = (c) => {
			/** @type {{ line: number, column: number }} */
			let location = this.locate(c);
			if (tracer === undefined) {
				// @ts-expect-error - fix the type of CompileOptions.sourcemap
				tracer = compile_options.sourcemap ? new TraceMap(compile_options.sourcemap) : null;
			}
			if (tracer) {
				// originalPositionFor returns 1-based lines like locator
				location = originalPositionFor(tracer, location);
			}
			return location;
		};

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
		this.component_options = process_component_options(this, this.ast.html.children);
		this.namespace =
			namespaces[this.component_options.namespace] || this.component_options.namespace;
		if (compile_options.customElement) {
			this.tag = this.component_options.customElement?.tag || compile_options.tag || this.name.name;
		} else {
			this.tag = this.name.name;
		}
		this.walk_module_js();
		this.push_ignores(
			this.ast.instance
				? extract_ignores_above_position(this.ast.instance.start, this.ast.html.children)
				: []
		);
		this.walk_instance_js_pre_template();
		this.pop_ignores();
		this.fragment = new Fragment(this, ast.html);
		this.name = this.get_unique_name(name);
		this.push_ignores(
			this.ast.instance
				? extract_ignores_above_position(this.ast.instance.start, this.ast.html.children)
				: []
		);
		this.walk_instance_js_post_template();
		this.pop_ignores();
		this.elements.forEach((element) => this.stylesheet.apply(element));
		this.stylesheet.reify();
		this.stylesheet.warn_on_unused_selectors(this);
	}

	/**
	 * @param {import('estree').Node} node
	 * @param {import('../interfaces.js').Var} variable
	 * @param {any} add_to_lookup
	 */
	add_var(node, variable, add_to_lookup = true) {
		this.vars.push(variable);
		if (add_to_lookup) {
			if (this.var_lookup.has(variable.name)) {
				const exists_var = this.var_lookup.get(variable.name);
				if (exists_var.module && exists_var.imported) {
					this.error(/** @type {any} */ (node), compiler_errors.illegal_variable_declaration);
				}
			}
			this.var_lookup.set(variable.name, variable);
		}
	}

	/**
	 * @param {import('estree').Node} node
	 * @param {string} name
	 */
	add_reference(node, name) {
		const variable = this.var_lookup.get(name);
		if (variable) {
			variable.referenced = true;
		} else if (is_reserved_keyword(name)) {
			this.add_var(node, {
				name,
				injected: true,
				referenced: true
			});
		} else if (name[0] === '$') {
			this.add_var(node, {
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
				this.add_var(node, { name, referenced: true }, false);
			}
			this.used_names.add(name);
		}
	}

	/** @param {string} name */
	alias(name) {
		if (!this.aliases.has(name)) {
			this.aliases.set(name, this.get_unique_name(name));
		}
		return this.aliases.get(name);
	}

	/** @param {import('./nodes/Element.js').default} element */
	apply_stylesheet(element) {
		this.elements.push(element);
	}

	/** @param {string} name */
	global(name) {
		const alias = this.alias(name);
		this.globals.set(name, alias);
		return alias;
	}

	/**
	 * @param {{ js: import('estree').Node[]; css: import('../interfaces.js').CssResult }} [result]
	 * @returns {import('../interfaces.js').CompileResult}
	 */
	generate(result) {
		let js = null;
		let css = null;
		if (result) {
			const { compile_options, name } = this;
			const banner = `${this.file ? `${this.file} ` : ''}generated by Svelte v${VERSION}`;

			/** @type {any} */
			const program = { type: 'Program', body: result.js };
			walk(program, {
				enter: /**
				 * @param {import('estree').Node} node
				 * @param {import('estree').Node} parent
				 * @param {any} key
				 */ (node, parent, key) => {
					if (node.type === 'Identifier') {
						if (node.name[0] === '@') {
							if (node.name[1] === '_') {
								const alias = this.global(node.name.slice(2));
								node.name = alias.name;
							} else {
								let name = node.name.slice(1);
								if (compile_options.hydratable) {
									if (internal_exports.has(`${name}_hydration`)) {
										name += '_hydration';
									} else if (internal_exports.has(`${name}Hydration`)) {
										name += 'Hydration';
									}
								}
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

							/** @type {import('estree').Literal} */
							const literal = { type: 'Literal', value: node.name };
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
				name,
				banner,
				compile_options.sveltePath,
				imported_helpers,
				referenced_globals,
				this.imports,
				this.vars
					.filter((variable) => variable.module && variable.export_name)
					.map((variable) => ({
						name: variable.name,
						as: variable.export_name
					})),
				this.exports_from
			);
			css = compile_options.customElement ? { code: null, map: null } : result.css;
			const js_sourcemap_enabled = check_enable_sourcemap(compile_options.enableSourcemap, 'js');
			if (!js_sourcemap_enabled) {
				js = print(program);
				js.map = null;
			} else {
				const sourcemap_source_filename = get_sourcemap_source_filename(compile_options);
				js = print(program, {
					sourceMapSource: sourcemap_source_filename
				});
				js.map.sources = [sourcemap_source_filename];
				js.map.sourcesContent = [this.source];
				js.map = apply_preprocessor_sourcemap(
					sourcemap_source_filename,
					js.map,
					/** @type {string | import('@ampproject/remapping').RawSourceMap | import('@ampproject/remapping').DecodedSourceMap} */ (
						compile_options.sourcemap
					)
				);
			}
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

	/**
	 * @param {string} name
	 * @param {import('./utils/scope.js').Scope} [scope]
	 * @returns {import('estree').Identifier}
	 */
	get_unique_name(name, scope) {
		let alias = name;
		for (
			let i = 1;
			reserved.has(alias) ||
			this.var_lookup.has(alias) ||
			this.used_names.has(alias) ||
			this.globally_used_names.has(alias) ||
			(scope && scope.has(alias));

		) {
			alias = `${name}_${i++}`;
		}
		this.used_names.add(alias);
		return { type: 'Identifier', name: alias };
	}
	get_unique_name_maker() {
		const local_used_names = new Set();

		/** @param {string} name */
		function add(name) {
			local_used_names.add(name);
		}
		reserved.forEach(add);
		internal_exports.forEach(add);
		this.var_lookup.forEach((_value, key) => add(key));

		/**
		 * @param {string} name
		 * @returns {import('estree').Identifier}
		 */
		return (name) => {
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

	/** @returns {import('../interfaces.js').Var[]} */
	get_vars_report() {
		const { compile_options, vars } = this;
		const vars_report =
			compile_options.varsReport === false
				? []
				: compile_options.varsReport === 'full'
				? vars
				: vars.filter((v) => !v.global && !v.internal);
		return vars_report.map((v) => ({
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
	/**
	 * @param {{
	 * 			start: number;
	 * 			end: number;
	 * 		}} pos
	 * @param {{
	 * 			code: string;
	 * 			message: string;
	 * 		}} e
	 */
	error(pos, e) {
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
	/**
	 * @param {{
	 * 			start: number;
	 * 			end: number;
	 * 		}} pos
	 * @param {{
	 * 			code: string;
	 * 			message: string;
	 * 		}} warning
	 */
	warn(pos, warning) {
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
			toString: () => `${warning.message} (${start.line}:${start.column})\n${frame}`
		});
	}

	/** @param {any} node */
	extract_imports(node) {
		this.imports.push(node);
	}

	/**
	 * @param {any} node
	 * @param {any} module_script
	 */
	extract_exports(node, module_script = false) {
		const ignores = extract_svelte_ignore_from_comments(node);
		if (ignores.length) this.push_ignores(ignores);
		const result = this._extract_exports(node, module_script);
		if (ignores.length) this.pop_ignores();
		return result;
	}

	/**
	 * @private
	 * @param {import('estree').ExportDefaultDeclaration | import('estree').ExportNamedDeclaration | import('estree').ExportAllDeclaration} node
	 * @param {boolean} module_script
	 */
	_extract_exports(node, module_script) {
		if (node.type === 'ExportDefaultDeclaration') {
			return this.error(/** @type {any} */ (node), compiler_errors.default_export);
		}
		if (node.type === 'ExportNamedDeclaration') {
			if (node.source) {
				if (module_script) {
					this.exports_from.push(node);
				} else {
					this.instance_exports_from.push(node);
				}
				return null;
			}
			if (node.declaration) {
				if (node.declaration.type === 'VariableDeclaration') {
					node.declaration.declarations.forEach((declarator) => {
						extract_names(declarator.id).forEach((name) => {
							const variable = this.var_lookup.get(name);
							variable.export_name = name;
							if (
								declarator.init?.type === 'Literal' &&
								typeof declarator.init.value === 'boolean'
							) {
								variable.is_boolean = true;
							}
							if (
								!module_script &&
								variable.writable &&
								!(variable.referenced || variable.referenced_from_script || variable.subscribable)
							) {
								this.warn(
									/** @type {any} */ (declarator),
									compiler_warnings.unused_export_let(this.name.name, name)
								);
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
				node.specifiers.forEach((specifier) => {
					const variable = this.var_lookup.get(specifier.local.name);
					if (variable) {
						variable.export_name = specifier.exported.name;
						if (
							!module_script &&
							variable.writable &&
							!(variable.referenced || variable.referenced_from_script || variable.subscribable)
						) {
							this.warn(
								/** @type {any} */ (specifier),
								compiler_warnings.unused_export_let(this.name.name, specifier.exported.name)
							);
						}
					}
				});
				return null;
			}
		}
	}

	/** @param {any} script */
	extract_javascript(script) {
		if (!script) return null;
		return script.content.body.filter((node) => {
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
			/** @param {import('estree').Node} node */
			enter(node) {
				if (node.type === 'LabeledStatement' && node.label.name === '$') {
					component.warn(
						/** @type {any} */ (node),
						compiler_warnings.module_script_reactive_declaration
					);
				}
			}
		});
		const { scope, globals } = create_scopes(script.content);
		this.module_scope = scope;
		scope.declarations.forEach((node, name) => {
			if (name[0] === '$') {
				return this.error(/** @type {any} */ (node), compiler_errors.illegal_declaration);
			}
			const writable =
				node.type === 'VariableDeclaration' && (node.kind === 'var' || node.kind === 'let');
			const imported = node.type.startsWith('Import');
			this.add_var(node, {
				name,
				module: true,
				hoistable: true,
				writable,
				imported
			});
		});
		globals.forEach((node, name) => {
			if (name[0] === '$') {
				return this.error(/** @type {any} */ (node), compiler_errors.illegal_subscription);
			} else {
				this.add_var(node, {
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
			if (regex_starts_with_term_export.test(node.type)) {
				const replacement = this.extract_exports(node, true);
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
		script.content.body.forEach((node) => {
			if (node.type !== 'LabeledStatement') return;
			if (node.body.type !== 'ExpressionStatement') return;
			const { expression } = node.body;
			if (expression.type !== 'AssignmentExpression') return;
			if (expression.left.type === 'MemberExpression') return;
			extract_names(expression.left).forEach((name) => {
				if (!this.var_lookup.has(name) && name[0] !== '$') {
					this.injected_reactive_declaration_vars.add(name);
				}
			});
		});
		const { scope: instance_scope, map, globals } = create_scopes(script.content);
		this.instance_scope = instance_scope;
		this.instance_scope_map = map;
		instance_scope.declarations.forEach((node, name) => {
			if (name[0] === '$') {
				return this.error(/** @type {any} */ (node), compiler_errors.illegal_declaration);
			}
			const writable =
				node.type === 'VariableDeclaration' && (node.kind === 'var' || node.kind === 'let');
			const imported = node.type.startsWith('Import');
			this.add_var(node, {
				name,
				initialised: instance_scope.initialised_declarations.has(name),
				writable,
				imported
			});
			this.node_for_declaration.set(name, node);
		});
		// NOTE: add store variable first, then only $store value
		// as `$store` will mark `store` variable as referenced and subscribable
		const global_keys = Array.from(globals.keys());
		const sorted_globals = [
			...global_keys.filter((key) => key[0] !== '$'),
			...global_keys.filter((key) => key[0] === '$')
		];
		sorted_globals.forEach((name) => {
			if (this.var_lookup.has(name)) return;
			const node = globals.get(name);
			if (this.injected_reactive_declaration_vars.has(name)) {
				this.add_var(node, {
					name,
					injected: true,
					writable: true,
					reassigned: true,
					initialised: true
				});
			} else if (is_reserved_keyword(name)) {
				this.add_var(node, {
					name,
					injected: true
				});
			} else if (name[0] === '$') {
				if (name === '$' || name[1] === '$') {
					return this.error(/** @type {any} */ (node), compiler_errors.illegal_global(name));
				}
				this.add_var(node, {
					name,
					injected: true,
					mutated: true,
					writable: true
				});
				this.add_reference(node, name.slice(1));
				const variable = this.var_lookup.get(name.slice(1));
				if (variable) {
					variable.subscribable = true;
					variable.referenced_from_script = true;
				}
			} else {
				this.add_var(node, {
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
		this.check_if_tags_content_dynamic();
	}
	post_template_walk() {
		const script = this.ast.instance;
		if (!script) return;
		const component = this;
		const { content } = script;
		const { instance_scope, instance_scope_map: map } = this;
		let scope = instance_scope;
		const to_remove = [];

		/**
		 * @param {any} parent
		 * @param {any} prop
		 * @param {any} index
		 */
		const remove = (parent, prop, index) => {
			to_remove.unshift([parent, prop, index]);
		};
		let scope_updated = false;
		const current_function_stack = [];

		/** @type {import('estree').FunctionDeclaration | import('estree').FunctionExpression} */
		let current_function = null;
		walk(content, {
			/** @type {import('estree-walker').SyncHandler} */
			enter(node, parent, prop, index) {
				if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
					current_function_stack.push((current_function = node));
				}
				if (map.has(node)) {
					scope = map.get(node);
				}
				let deep = false;

				/** @type {string[]} */
				let names = [];
				if (node.type === 'AssignmentExpression') {
					if (node.left.type === 'ArrayPattern') {
						walk(node.left, {
							/**
							 * @param {import('estree').Node} node
							 * @param {import('estree').Node} parent
							 */
							enter(node, parent) {
								if (
									node.type === 'Identifier' &&
									parent.type !== 'MemberExpression' &&
									(parent.type !== 'AssignmentPattern' || parent.right !== node)
								) {
									names.push(node.name);
								}
							}
						});
					} else {
						deep = node.left.type === 'MemberExpression';
						names = deep ? [get_object(node.left).name] : extract_names(node.left);
					}
				} else if (node.type === 'UpdateExpression') {
					deep = node.argument.type === 'MemberExpression';
					const { name } = get_object(node.argument);
					names.push(name);
				}
				if (names.length > 0) {
					names.forEach((name) => {
						let current_scope = scope;
						let declaration;
						while (current_scope) {
							if (current_scope.declarations.has(name)) {
								declaration = current_scope.declarations.get(name);
								break;
							}
							current_scope = current_scope.parent;
						}
						if (
							declaration &&
							/** @type {import('estree').VariableDeclaration} */ (declaration).kind === 'const' &&
							!deep
						) {
							component.error(/** @type {any} */ (node), {
								code: 'assignment-to-const',
								message: 'You are assigning to a const'
							});
						}
					});
				}
				if (node.type === 'ImportDeclaration') {
					component.extract_imports(node);
					// TODO: to use actual remove
					remove(parent, prop, index);
					return this.skip();
				}
				if (regex_starts_with_term_export.test(node.type)) {
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

			/** @param {import('estree').Node} node */
			leave(node) {
				if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
					current_function_stack.pop();
					current_function = current_function_stack[current_function_stack.length - 1];
				}
				// do it on leave, to prevent infinite loop
				if (
					component.compile_options.dev &&
					component.compile_options.loopGuardTimeout > 0 &&
					(!current_function || (!current_function.generator && !current_function.async))
				) {
					const to_replace_for_loop_protect = component.loop_protect(
						node,
						scope,
						component.compile_options.loopGuardTimeout
					);
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
			/**
			 * @param {import('estree').Node} node
			 * @param {import('estree').Node} parent
			 */
			enter(node, parent) {
				if (map.has(node)) {
					scope = map.get(node);
				}
				if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
					const assignee = node.type === 'AssignmentExpression' ? node.left : node.argument;
					const names = extract_names(/** @type {import('estree').Node} */ (assignee));
					const deep = assignee.type === 'MemberExpression';
					names.forEach((name) => {
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

			/** @param {import('estree').Node} node */
			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		});
	}

	/**
	 * @param {import('estree').Node} node
	 * @param {import('estree').Node} parent
	 * @param {string | number | symbol} prop
	 * @param {import('./utils/scope.js').Scope} scope
	 */
	warn_on_undefined_store_value_references(node, parent, prop, scope) {
		if (node.type === 'LabeledStatement' && node.label.name === '$' && parent.type !== 'Program') {
			this.warn(/** @type {any} */ (node), compiler_warnings.non_top_level_reactive_declaration);
		}
		if (
			is_reference(
				/** @type {import('is-reference').NodeWithPropertyDefinition} */ (node),
				/** @type {import('is-reference').NodeWithPropertyDefinition} */ (parent)
			)
		) {
			const object = get_object(node);
			const { name } = object;
			if (name[0] === '$') {
				if (!scope.has(name)) {
					this.warn_if_undefined(name, object, null);
				}
				if (
					name[1] !== '$' &&
					scope.has(name.slice(1)) &&
					scope.find_owner(name.slice(1)) !== this.instance_scope
				) {
					if (
						!(
							(regex_contains_term_function.test(parent.type) && prop === 'params') ||
							(parent.type === 'VariableDeclarator' && prop === 'id')
						)
					) {
						return this.error(/** @type {any} */ (node), compiler_errors.contextual_store);
					}
				}
			}
		}
	}

	/**
	 * @param {any} node
	 * @param {import('./utils/scope.js').Scope} scope
	 * @param {number} timeout
	 * @returns {import('estree').Node}
	 */
	loop_protect(node, scope, timeout) {
		if (
			node.type === 'WhileStatement' ||
			node.type === 'ForStatement' ||
			node.type === 'DoWhileStatement'
		) {
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
				body: [before[0], node]
			};
		}
		return null;
	}

	/** @param {(variable: import('../interfaces.js').Var) => import('estree').Node[]} get_insert */
	rewrite_props(get_insert) {
		if (!this.ast.instance) return;
		const component = this;
		const { instance_scope, instance_scope_map: map } = this;
		let scope = instance_scope;
		walk(this.ast.instance.content, {
			/** @param {import('estree').Node} node */
			enter(node) {
				if (regex_contains_term_function.test(node.type)) {
					return this.skip();
				}
				if (map.has(node)) {
					scope = map.get(node);
				}
				if (node.type === 'ExportNamedDeclaration' && node.declaration) {
					return this.replace(node.declaration);
				}
				if (node.type === 'VariableDeclaration') {
					// NOTE: `var` does not follow block scoping
					if (node.kind === 'var' || scope === instance_scope) {
						const inserts = [];
						const props = [];

						/**
						 * @param {import('estree').Identifier} exported
						 * @param {import('estree').Pattern} local
						 * @param {import('estree').Expression} default_value
						 */
						function add_new_props(exported, local, default_value) {
							props.push({
								type: 'Property',
								method: false,
								shorthand: false,
								computed: false,
								kind: 'init',
								key: exported,
								value: default_value
									? {
											type: 'AssignmentPattern',
											left: local,
											right: default_value
									  }
									: local
							});
						}
						// transform
						// ```
						// export let { x, y = 123 } = OBJ, z = 456
						// ```
						// into
						// ```
						// let { x: x$, y: y$ = 123 } = OBJ;
						// let { x = x$, y = y$, z = 456 } = $$props;
						// ```
						for (let index = 0; index < node.declarations.length; index++) {
							const declarator = node.declarations[index];
							if (declarator.id.type !== 'Identifier') {
								/**
								 * @param {import('estree').Identifier} local
								 * @returns {import('estree').Identifier}
								 */
								function get_new_name(local) {
									const variable = component.var_lookup.get(local.name);
									if (variable.subscribable) {
										inserts.push(get_insert(variable));
									}
									if (variable.export_name && variable.writable) {
										const alias_name = component.get_unique_name(local.name);
										add_new_props(
											{ type: 'Identifier', name: variable.export_name },
											local,
											alias_name
										);
										return alias_name;
									}
									return local;
								}

								/** @param {import('estree').Pattern} param */
								function rename_identifiers(param) {
									switch (param.type) {
										case 'ObjectPattern': {
											/** @param {import('estree').Property | import('estree').RestElement} prop */
											const handle_prop = (prop) => {
												if (prop.type === 'RestElement') {
													rename_identifiers(prop);
												} else if (prop.value.type === 'Identifier') {
													prop.value = get_new_name(prop.value);
												} else {
													rename_identifiers(/** @type {import('estree').Pattern} */ (prop.value));
												}
											};
											param.properties.forEach(handle_prop);
											break;
										}
										case 'ArrayPattern': {
											/**
											 * @param {import('estree').Pattern | null} element
											 * @param {number} index
											 * @param {Array<import('estree').Pattern | null>} array
											 */
											const handle_element = (element, index, array) => {
												if (element) {
													if (element.type === 'Identifier') {
														array[index] = get_new_name(element);
													} else {
														rename_identifiers(element);
													}
												}
											};
											param.elements.forEach(handle_element);
											break;
										}
										case 'RestElement':
											if (param.argument.type === 'Identifier') {
												param.argument = get_new_name(param.argument);
											} else {
												rename_identifiers(param.argument);
											}
											break;
										case 'AssignmentPattern':
											if (param.left.type === 'Identifier') {
												param.left = get_new_name(param.left);
											} else {
												rename_identifiers(param.left);
											}
											break;
									}
								}
								rename_identifiers(declarator.id);
							} else {
								const { name } = declarator.id;
								const variable = component.var_lookup.get(name);
								const is_props = variable.export_name && variable.writable;
								if (is_props) {
									add_new_props(
										{ type: 'Identifier', name: variable.export_name },
										declarator.id,
										declarator.init
									);
									node.declarations.splice(index--, 1);
								}
								if (variable.subscribable && (is_props || declarator.init)) {
									inserts.push(get_insert(variable));
								}
							}
						}
						this.replace(
							/** @type {any} */ (
								b`
							${node.declarations.length ? node : null}
							${props.length > 0 && b`let { ${props} } = $$props;`}
							${inserts}
						`
							)
						);
						return this.skip();
					}
				}
			},

			/** @param {import('estree').Node} node */
			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}
			}
		});
	}
	hoist_instance_declarations() {
		// we can safely hoist variable declarations that are
		// initialised to literals, and functions that don't
		// reference instance variables other than other
		// hoistable functions. TODO others?
		const { hoistable_nodes, var_lookup, injected_reactive_declaration_vars, imports } = this;
		const top_level_function_declarations = new Map();
		const { body } = this.ast.instance.content;
		for (let i = 0; i < body.length; i += 1) {
			const node = body[i];
			if (node.type === 'VariableDeclaration') {
				const all_hoistable = node.declarations.every((d) => {
					if (!d.init) return false;
					if (d.init.type !== 'Literal') return false;
					// everything except const values can be changed by e.g. svelte devtools
					// which means we can't hoist it
					if (node.kind !== 'const' && this.compile_options.dev) return false;
					for (const name of extract_names(d.id)) {
						const v = this.var_lookup.get(name);
						if (v.reassigned) return false;
						if (v.export_name) return false;

						if (this.vars.find((variable) => variable.name === name && variable.module)) {
							return false;
						}
					}
					return true;
				});
				if (all_hoistable) {
					node.declarations.forEach((d) => {
						for (const name of extract_names(d.id)) {
							this.var_lookup.get(name).hoistable = true;
						}
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

		/** @param {any} fn_declaration */
		const is_hoistable = (fn_declaration) => {
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
				/** @type {import('estree-walker').SyncHandler} */
				enter(node, parent) {
					if (!hoistable) return this.skip();
					if (map.has(node)) {
						scope = map.get(node);
					}
					if (
						is_reference(
							/** @type {import('is-reference').NodeWithPropertyDefinition} */ (node),
							/** @type {import('is-reference').NodeWithPropertyDefinition} */ (parent)
						)
					) {
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
								const other_declaration = top_level_function_declarations.get(name);
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

				/** @param {import('estree').Node} node */
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
		/**
		 * @type {Array<{
		 * 			assignees: Set<string>;
		 * 			dependencies: Set<string>;
		 * 			node: import('estree').Node;
		 * 			declaration: import('estree').Node;
		 * 		}>}
		 */
		const unsorted_reactive_declarations = [];
		this.ast.instance.content.body.forEach((node) => {
			const ignores = extract_svelte_ignore_from_comments(node);
			if (ignores.length) this.push_ignores(ignores);
			if (node.type === 'LabeledStatement' && node.label.name === '$') {
				this.reactive_declaration_nodes.add(node);
				const assignees = new Set();
				const assignee_nodes = new Set();
				const dependencies = new Set();
				const module_dependencies = new Set();
				let scope = this.instance_scope;
				const { declarations: outset_scope_decalarations } = this.instance_scope;
				const map = this.instance_scope_map;
				walk(node.body, {
					/** @type {import('estree-walker').SyncHandler} */
					enter(node, parent) {
						if (node.type === 'VariableDeclaration' && node.kind === 'var') {
							const is_var_in_outset = node.declarations.some(
								/** @param {import('estree').VariableDeclarator} declaration */ (declaration) => {
									/** @type {string[]} */
									const names = extract_names(declaration.id);
									return !!names.find(
										/** @param {string} name */ (name) => {
											const var_node = outset_scope_decalarations.get(name);
											return var_node === node;
										}
									);
								}
							);
							if (is_var_in_outset) {
								return component.error(
									/** @type {any} */ (node),
									compiler_errors.invalid_var_declaration
								);
							}
						}
						if (map.has(node)) {
							scope = map.get(node);
						}
						if (node.type === 'AssignmentExpression') {
							const left = get_object(node.left);
							extract_identifiers(left).forEach((node) => {
								assignee_nodes.add(node);
								assignees.add(node.name);
							});
							if (node.operator !== '=') {
								dependencies.add(left.name);
							}
						} else if (node.type === 'UpdateExpression') {
							const identifier = get_object(node.argument);
							assignees.add(identifier.name);
						} else if (
							is_reference(
								/** @type {import('is-reference').NodeWithPropertyDefinition} */ (node),
								/** @type {import('is-reference').NodeWithPropertyDefinition} */ (parent)
							)
						) {
							const identifier = get_object(node);
							if (!assignee_nodes.has(identifier)) {
								const { name } = identifier;
								const owner = scope.find_owner(name);
								const variable = component.var_lookup.get(name);
								let should_add_as_dependency = true;
								if (variable) {
									variable.is_reactive_dependency = true;
									if (variable.module && variable.writable) {
										should_add_as_dependency = false;
										module_dependencies.add(name);
									}
								}
								const is_writable_or_mutated = variable && (variable.writable || variable.mutated);
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

					/** @param {import('estree').Node} node */
					leave(node) {
						if (map.has(node)) {
							scope = scope.parent;
						}
					}
				});
				if (module_dependencies.size > 0 && dependencies.size === 0) {
					component.warn(
						/** @type {any} */ (node.body),
						compiler_warnings.module_script_variable_reactive_declaration(
							Array.from(module_dependencies)
						)
					);
				}
				const { expression } = /** @type {import('estree').ExpressionStatement} */ (node.body);
				const declaration =
					expression && /** @type {import('estree').AssignmentExpression} */ (expression).left;
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
		unsorted_reactive_declarations.forEach((declaration) => {
			declaration.assignees.forEach((name) => {
				if (!lookup.has(name)) {
					lookup.set(name, []);
				}
				// TODO warn or error if a name is assigned to in
				// multiple reactive declarations?
				lookup.get(name).push(declaration);
			});
		});
		const cycle = check_graph_for_cycles(
			unsorted_reactive_declarations.reduce((acc, declaration) => {
				declaration.assignees.forEach((v) => {
					declaration.dependencies.forEach((w) => {
						if (!declaration.assignees.has(w)) {
							acc.push([v, w]);
						}
					});
				});
				return acc;
			}, [])
		);
		if (cycle && cycle.length) {
			const declarationList = lookup.get(cycle[0]);
			const declaration = declarationList[0];
			return this.error(declaration.node, compiler_errors.cyclical_reactive_declaration(cycle));
		}

		/** @param {any} declaration */
		const add_declaration = (declaration) => {
			if (this.reactive_declarations.includes(declaration)) return;
			declaration.dependencies.forEach((name) => {
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
	check_if_tags_content_dynamic() {
		this.tags.forEach((tag) => {
			tag.check_if_content_dynamic();
		});
	}

	/**
	 * @param {string} name
	 * @param {any} node
	 * @param {import('./nodes/shared/TemplateScope.js').default} template_scope
	 * @param {import("./nodes/shared/Node.js").default} [owner]
	 */
	warn_if_undefined(name, node, template_scope, owner) {
		if (name[0] === '$') {
			if (name === '$' || (name[1] === '$' && !is_reserved_keyword(name))) {
				return this.error(node, compiler_errors.illegal_global(name));
			}
			this.has_reactive_assignments = true; // TODO does this belong here?
			if (is_reserved_keyword(name)) return;
			name = name.slice(1);
		}
		if (this.var_lookup.has(name) && !this.var_lookup.get(name).global) return;
		if (template_scope && template_scope.names.has(name)) return;
		if (globals.has(name) && node.type !== 'InlineComponent') return;

		function has_out_of_scope_let() {
			for (let parent = owner.parent; parent; parent = parent.parent) {
				if (parent.type === 'InlineComponent') {
					const { let_attributes } = parent;

					for (const attr of let_attributes) {
						if (
							// @ts-expect-error
							// TODO extract_names only considers patterns but let attributes return expressions
							(attr.expression && extract_names(attr.expression).includes(name)) ||
							attr.name === name
						)
							return true;
					}
				}
			}

			return false;
		}

		if (owner && has_out_of_scope_let()) {
			return this.warn(node, {
				code: 'missing-declaration',
				message: `let:${name} declared on parent component cannot be used inside named slot`
			});
		}

		this.warn(node, compiler_warnings.missing_declaration(name, !!this.ast.instance));
	}

	/** @param {any} ignores */
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
const regex_valid_tag_name = /^[a-zA-Z][a-zA-Z0-9]*-[a-zA-Z0-9-]+$/;

/**
 * @param {Component} component
 * @param {any} nodes
 */
function process_component_options(component, nodes) {
	/** @type {ComponentOptions} */
	const component_options = {
		immutable: component.compile_options.immutable || false,
		accessors:
			'accessors' in component.compile_options
				? component.compile_options.accessors
				: !!component.compile_options.customElement,
		preserveWhitespace: !!component.compile_options.preserveWhitespace,
		namespace: component.compile_options.namespace
	};
	const node = nodes.find((node) => node.name === 'svelte:options');

	/**
	 * @param {any} attribute
	 * @param {any} params_0
	 */
	function get_value(attribute, { code, message }) {
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
		node.attributes.forEach((attribute) => {
			if (attribute.type === 'Attribute') {
				const { name } = attribute;

				/**
				 * @param {import('../interfaces.js').Attribute} attribute
				 * @param {string} tag
				 */
				function parse_tag(attribute, tag) {
					if (typeof tag !== 'string' && tag !== null) {
						return component.error(attribute, compiler_errors.invalid_tag_attribute);
					}
					if (tag && !regex_valid_tag_name.test(tag)) {
						return component.error(attribute, compiler_errors.invalid_tag_property);
					}
					if (tag && !component.compile_options.customElement) {
						component.warn(attribute, compiler_warnings.missing_custom_element_compile_options);
					}
					component_options.customElement =
						component_options.customElement || /** @type {any} */ ({});
					component_options.customElement.tag = tag;
				}
				switch (name) {
					case 'tag': {
						component.warn(attribute, compiler_warnings.tag_option_deprecated);
						parse_tag(attribute, get_value(attribute, compiler_errors.invalid_tag_attribute));
						break;
					}
					case 'customElement': {
						component_options.customElement =
							component_options.customElement || /** @type {any} */ ({});
						const { value } = attribute;
						if (value[0].type === 'MustacheTag' && value[0].expression?.value === null) {
							component_options.customElement.tag = null;
							break;
						} else if (value[0].type === 'Text') {
							parse_tag(attribute, get_value(attribute, compiler_errors.invalid_tag_attribute));
							break;
						} else if (value[0].expression.type !== 'ObjectExpression') {
							return component.error(attribute, compiler_errors.invalid_customElement_attribute);
						}
						const tag = value[0].expression.properties.find((prop) => prop.key.name === 'tag');
						if (tag) {
							parse_tag(tag, tag.value?.value);
						} else {
							return component.error(attribute, compiler_errors.invalid_customElement_attribute);
						}
						const props = value[0].expression.properties.find((prop) => prop.key.name === 'props');
						if (props) {
							const error = () =>
								component.error(attribute, compiler_errors.invalid_props_attribute);
							if (props.value?.type !== 'ObjectExpression') {
								return error();
							}
							component_options.customElement.props = {};
							for (const property of /** @type {import('estree').ObjectExpression} */ (props.value)
								.properties) {
								if (
									property.type !== 'Property' ||
									property.computed ||
									property.key.type !== 'Identifier' ||
									property.value.type !== 'ObjectExpression'
								) {
									return error();
								}
								component_options.customElement.props[property.key.name] = {};
								for (const prop of property.value.properties) {
									if (
										prop.type !== 'Property' ||
										prop.computed ||
										prop.key.type !== 'Identifier' ||
										prop.value.type !== 'Literal'
									) {
										return error();
									}
									if (
										['reflect', 'attribute', 'type'].indexOf(prop.key.name) === -1 ||
										(prop.key.name === 'type' &&
											['String', 'Number', 'Boolean', 'Array', 'Object'].indexOf(
												/** @type {string} */ (prop.value.value)
											) === -1) ||
										(prop.key.name === 'reflect' && typeof prop.value.value !== 'boolean') ||
										(prop.key.name === 'attribute' && typeof prop.value.value !== 'string')
									) {
										return error();
									}
									component_options.customElement.props[property.key.name][prop.key.name] =
										prop.value.value;
								}
							}
						}
						const shadow = value[0].expression.properties.find(
							(prop) => prop.key.name === 'shadow'
						);
						if (shadow) {
							const shadowdom = shadow.value?.value;
							if (shadowdom !== 'open' && shadowdom !== 'none') {
								return component.error(shadow, compiler_errors.invalid_shadow_attribute);
							}
							component_options.customElement.shadow = shadowdom;
						}
						break;
					}
					case 'namespace': {
						const ns = get_value(attribute, compiler_errors.invalid_namespace_attribute);
						if (typeof ns !== 'string') {
							return component.error(attribute, compiler_errors.invalid_namespace_attribute);
						}
						if (valid_namespaces.indexOf(ns) === -1) {
							const match = fuzzymatch(ns, valid_namespaces);
							return component.error(
								attribute,
								compiler_errors.invalid_namespace_property(ns, match)
							);
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
						return component.error(
							attribute,
							compiler_errors.invalid_options_attribute_unknown(name)
						);
				}
			} else {
				return component.error(attribute, compiler_errors.invalid_options_attribute);
			}
		});
	}
	return component_options;
}

/**
 * @param {string} from
 * @param {string} to
 */
function get_relative_path(from, to) {
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

/** @param {string} filename */
function get_basename(filename) {
	return filename.split(/[/\\]/).pop();
}

/** @param {import('../interfaces.js').CompileOptions} compile_options */
function get_sourcemap_source_filename(compile_options) {
	if (!compile_options.filename) return null;
	return compile_options.outputFilename
		? get_relative_path(compile_options.outputFilename, compile_options.filename)
		: get_basename(compile_options.filename);
}

/** @typedef {Object} ComponentOptions
 * @property {string} [namespace]
 * @property {boolean} [immutable]
 * @property {boolean} [accessors]
 * @property {boolean} [preserveWhitespace]
 * @property {Object} [customElement]
 * @property {string|null} customElement.tag
 * @property {'open'|'none'} [customElement.shadow]
 * @property {Record<string,{attribute?:string;reflect?:boolean;type?:'String'|'Boolean'|'Number'|'Array'|'Object';}>} [customElement.props]
 */
