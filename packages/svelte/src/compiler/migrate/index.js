/** @import { VariableDeclarator, Node, Identifier, AssignmentExpression, LabeledStatement, ExpressionStatement } from 'estree' */
/** @import { Visitors } from 'zimmerframe' */
/** @import { ComponentAnalysis } from '../phases/types.js' */
/** @import { Scope } from '../phases/scope.js' */
/** @import { AST, Binding, ValidatedCompileOptions } from '#compiler' */
import MagicString from 'magic-string';
import { walk } from 'zimmerframe';
import { parse } from '../phases/1-parse/index.js';
import { regex_valid_component_name } from '../phases/1-parse/state/element.js';
import { analyze_component } from '../phases/2-analyze/index.js';
import { get_rune } from '../phases/scope.js';
import { reset, UNKNOWN_FILENAME } from '../state.js';
import {
	extract_identifiers,
	extract_all_identifiers_from_expression,
	is_text_attribute
} from '../utils/ast.js';
import { migrate_svelte_ignore } from '../utils/extract_svelte_ignore.js';
import { validate_component_options } from '../validate-options.js';
import { is_reserved, is_svg, is_void } from '../../utils.js';
import { regex_is_valid_identifier } from '../phases/patterns.js';

const regex_style_tags = /(<style[^>]+>)([\S\s]*?)(<\/style>)/g;
const style_placeholder = '/*$$__STYLE_CONTENT__$$*/';

let has_migration_task = false;

class MigrationError extends Error {
	/**
	 * @param {string} msg
	 */
	constructor(msg) {
		super(msg);
	}
}

/**
 *
 * @param {State} state
 */
function migrate_css(state) {
	if (!state.analysis.css.ast?.start) return;
	const css_contents = state.str
		.snip(state.analysis.css.ast.start, /** @type {number} */ (state.analysis.css.ast?.end))
		.toString();
	let code = css_contents;
	let starting = 0;

	// since we already blank css we can't work directly on `state.str` so we will create a copy that we can update
	const str = new MagicString(code);
	while (code) {
		if (
			code.startsWith(':has') ||
			code.startsWith(':is') ||
			code.startsWith(':where') ||
			code.startsWith(':not')
		) {
			let start = code.indexOf('(') + 1;
			let is_global = false;

			const global_str = ':global';
			const next_global = code.indexOf(global_str);
			const str_between = code.substring(start, next_global);
			if (!str_between.trim()) {
				is_global = true;
				start += global_str.length;
			} else {
				const prev_global = css_contents.lastIndexOf(global_str, starting);
				if (prev_global > -1) {
					const end =
						find_closing_parenthesis(css_contents.indexOf('(', prev_global) + 1, css_contents) -
						starting;
					if (end > start) {
						starting += end;
						code = code.substring(end);
						continue;
					}
				}
			}

			const end = find_closing_parenthesis(start, code);
			if (start && end) {
				if (!is_global && !code.startsWith(':not')) {
					str.prependLeft(starting + start, ':global(');
					str.appendRight(starting + end - 1, ')');
				}
				starting += end - 1;
				code = code.substring(end - 1);
				continue;
			}
		}
		starting++;
		code = code.substring(1);
	}
	state.str.update(state.analysis.css.ast?.start, state.analysis.css.ast?.end, str.toString());
}

/**
 * @param {number} start
 * @param {string} code
 */
function find_closing_parenthesis(start, code) {
	let parenthesis = 1;
	let end = start;
	let char = code[end];
	// find the closing parenthesis
	while (parenthesis !== 0 && char) {
		if (char === '(') parenthesis++;
		if (char === ')') parenthesis--;
		end++;
		char = code[end];
	}
	return end;
}

/**
 * Does a best-effort migration of Svelte code towards using runes, event attributes and render tags.
 * May throw an error if the code is too complex to migrate automatically.
 *
 * @param {string} source
 * @param {{ filename?: string, use_ts?: boolean }} [options]
 * @returns {{ code: string; }}
 */
export function migrate(source, { filename, use_ts } = {}) {
	let og_source = source;
	try {
		has_migration_task = false;
		// Blank CSS, could contain SCSS or similar that needs a preprocessor.
		// Since we don't care about CSS in this migration, we'll just ignore it.
		/** @type {Array<[number, string]>} */
		const style_contents = [];
		source = source.replace(regex_style_tags, (_, start, content, end, idx) => {
			style_contents.push([idx + start.length, content]);
			return start + style_placeholder + end;
		});

		reset({ warning: () => false, filename });

		let parsed = parse(source);

		const { customElement: customElementOptions, ...parsed_options } = parsed.options || {};

		/** @type {ValidatedCompileOptions} */
		const combined_options = {
			...validate_component_options({}, ''),
			...parsed_options,
			customElementOptions,
			filename: filename ?? UNKNOWN_FILENAME,
			experimental: {
				async: true
			}
		};

		const str = new MagicString(source);
		const analysis = analyze_component(parsed, source, combined_options);
		const indent = guess_indent(source);

		str.replaceAll(/(<svelte:options\s.*?\s?)accessors\s?/g, (_, $1) => $1);

		for (const content of style_contents) {
			str.overwrite(content[0], content[0] + style_placeholder.length, content[1]);
		}

		/** @type {State} */
		let state = {
			scope: analysis.instance.scope,
			analysis,
			filename,
			str,
			indent,
			props: [],
			props_insertion_point: parsed.instance?.content.start ?? 0,
			has_props_rune: false,
			has_type_or_fallback: false,
			end: source.length,
			names: {
				props: analysis.root.unique('props').name,
				rest: analysis.root.unique('rest').name,

				// event stuff
				run: analysis.root.unique('run').name,
				handlers: analysis.root.unique('handlers').name,
				stopImmediatePropagation: analysis.root.unique('stopImmediatePropagation').name,
				preventDefault: analysis.root.unique('preventDefault').name,
				stopPropagation: analysis.root.unique('stopPropagation').name,
				once: analysis.root.unique('once').name,
				self: analysis.root.unique('self').name,
				trusted: analysis.root.unique('trusted').name,
				createBubbler: analysis.root.unique('createBubbler').name,
				bubble: analysis.root.unique('bubble').name,
				passive: analysis.root.unique('passive').name,
				nonpassive: analysis.root.unique('nonpassive').name
			},
			legacy_imports: new Set(),
			script_insertions: new Set(),
			derived_components: new Map(),
			derived_conflicting_slots: new Map(),
			derived_labeled_statements: new Set(),
			has_svelte_self: false,
			uses_ts:
				// Some people could use jsdoc but have a tsconfig.json, so double-check file for jsdoc indicators
				(use_ts && !source.includes('@type {')) ||
				!!parsed.instance?.attributes.some(
					(attr) => attr.name === 'lang' && /** @type {any} */ (attr).value[0].data === 'ts'
				)
		};

		if (parsed.module) {
			const context = parsed.module.attributes.find((attr) => attr.name === 'context');
			if (context) {
				state.str.update(context.start, context.end, 'module');
			}
		}

		if (parsed.instance) {
			walk(parsed.instance.content, state, instance_script);
		}

		state = { ...state, scope: analysis.template.scope };
		walk(parsed.fragment, state, template);

		let insertion_point = parsed.instance
			? /** @type {number} */ (parsed.instance.content.start)
			: 0;

		const need_script =
			state.legacy_imports.size > 0 ||
			state.derived_components.size > 0 ||
			state.derived_conflicting_slots.size > 0 ||
			state.script_insertions.size > 0 ||
			state.props.length > 0 ||
			analysis.uses_rest_props ||
			analysis.uses_props ||
			state.has_svelte_self;

		const need_ts_tag =
			state.uses_ts &&
			(!parsed.instance || !parsed.instance.attributes.some((attr) => attr.name === 'lang'));

		if (!parsed.instance && need_script) {
			str.appendRight(0, need_ts_tag ? '<script lang="ts">' : '<script>');
		}

		if (state.has_svelte_self && filename) {
			const file = filename.split('/').pop();
			str.appendRight(
				insertion_point,
				`\n${indent}import ${state.analysis.name} from './${file}';`
			);
		}

		const specifiers = [...state.legacy_imports].map((imported) => {
			const local = state.names[imported];
			return imported === local ? imported : `${imported} as ${local}`;
		});

		const legacy_import = `import { ${specifiers.join(', ')} } from 'svelte/legacy';\n`;

		if (state.legacy_imports.size > 0) {
			str.appendRight(insertion_point, `\n${indent}${legacy_import}`);
		}

		if (state.script_insertions.size > 0) {
			str.appendRight(
				insertion_point,
				`\n${indent}${[...state.script_insertions].join(`\n${indent}`)}`
			);
		}

		insertion_point = state.props_insertion_point;

		/**
		 * @param {"derived"|"props"|"bindable"} rune
		 */
		function check_rune_binding(rune) {
			const has_rune_binding = !!state.scope.get(rune);
			if (has_rune_binding) {
				throw new MigrationError(
					`migrating this component would require adding a \`$${rune}\` rune but there's already a variable named ${rune}.\n     Rename the variable and try again or migrate by hand.`
				);
			}
		}

		if (state.props.length > 0 || analysis.uses_rest_props || analysis.uses_props) {
			const has_many_props = state.props.length > 3;
			const newline_separator = `\n${indent}${indent}`;
			const props_separator = has_many_props ? newline_separator : ' ';
			let props = '';
			if (analysis.uses_props) {
				props = `...${state.names.props}`;
			} else {
				props = state.props
					.filter((prop) => !prop.type_only)
					.map((prop) => {
						let prop_str =
							prop.local === prop.exported ? prop.local : `${prop.exported}: ${prop.local}`;
						if (prop.bindable) {
							check_rune_binding('bindable');
							prop_str += ` = $bindable(${prop.init})`;
						} else if (prop.init) {
							prop_str += ` = ${prop.init}`;
						}
						return prop_str;
					})
					.join(`,${props_separator}`);

				if (analysis.uses_rest_props) {
					props += `${state.props.length > 0 ? `,${props_separator}` : ''}...${state.names.rest}`;
				}
			}

			if (state.has_props_rune) {
				// some render tags or forwarded event attributes to add
				str.appendRight(insertion_point, ` ${props},`);
			} else {
				const type_name = state.scope.root.unique('Props').name;
				let type = '';

				// Try to infer when we don't want to add types (e.g. user doesn't use types, or this is a zero-types +page.svelte)
				if (state.has_type_or_fallback || state.props.every((prop) => prop.slot_name)) {
					if (state.uses_ts) {
						type = `interface ${type_name} {${newline_separator}${state.props
							.map((prop) => {
								const comment = prop.comment ? `${prop.comment}${newline_separator}` : '';
								return `${comment}${prop.exported}${prop.optional ? '?' : ''}: ${prop.type};${prop.trailing_comment ? ' ' + prop.trailing_comment : ''}`;
							})
							.join(newline_separator)}`;
						if (analysis.uses_props || analysis.uses_rest_props) {
							type += `${state.props.length > 0 ? newline_separator : ''}[key: string]: any`;
						}
						type += `\n${indent}}`;
					} else {
						type = `/**\n${indent} * @typedef {Object} ${type_name}${state.props
							.map((prop) => {
								return `\n${indent} * @property {${prop.type}} ${prop.optional ? `[${prop.exported}]` : prop.exported}${prop.comment ? ` - ${prop.comment}` : ''}${prop.trailing_comment ? ` - ${prop.trailing_comment.trim()}` : ''}`;
							})
							.join(``)}\n${indent} */`;
					}
				}

				let props_declaration = `let {${props_separator}${props}${has_many_props ? `\n${indent}` : ' '}}`;
				if (state.uses_ts) {
					if (type) {
						props_declaration = `${type}\n\n${indent}${props_declaration}`;
					}
					check_rune_binding('props');
					props_declaration = `${props_declaration}${type ? `: ${type_name}` : ''} = $props();`;
				} else {
					if (type) {
						props_declaration = `${state.props.length > 0 ? `${type}\n\n${indent}` : ''}/** @type {${state.props.length > 0 ? type_name : ''}${analysis.uses_props || analysis.uses_rest_props ? `${state.props.length > 0 ? ' & ' : ''}{ [key: string]: any }` : ''}} */\n${indent}${props_declaration}`;
					}
					check_rune_binding('props');
					props_declaration = `${props_declaration} = $props();`;
				}

				props_declaration = `\n${indent}${props_declaration}`;
				str.appendRight(insertion_point, props_declaration);
			}

			if (parsed.instance && need_ts_tag) {
				str.appendRight(parsed.instance.start + '<script'.length, ' lang="ts"');
			}
		}

		/**
		 * If true, then we need to move all reactive statements to the end of the script block,
		 * in their correct order. Svelte 4 reordered reactive statements, $derived/$effect.pre
		 * don't have this behavior.
		 */
		let needs_reordering = false;

		for (const [node, { dependencies }] of state.analysis.reactive_statements) {
			/** @type {Binding[]} */
			let ids = [];
			if (
				node.body.type === 'ExpressionStatement' &&
				node.body.expression.type === 'AssignmentExpression'
			) {
				ids = extract_identifiers(node.body.expression.left)
					.map((id) => state.scope.get(id.name))
					.filter((id) => !!id);
			}

			if (
				dependencies.some(
					(dep) =>
						!ids.includes(dep) &&
						(dep.kind === 'prop' || dep.kind === 'bindable_prop'
							? state.props_insertion_point
							: /** @type {number} */ (dep.node.start)) > /** @type {number} */ (node.start)
				)
			) {
				needs_reordering = true;
				break;
			}
		}

		if (needs_reordering) {
			const nodes = Array.from(state.analysis.reactive_statements.keys());
			for (const node of nodes) {
				const { start, end } = get_node_range(source, node);
				str.appendLeft(end, '\n');
				str.move(start, end, /** @type {number} */ (parsed.instance?.content.end));
				str.update(start - (source[start - 2] === '\r' ? 2 : 1), start, '');
			}
		}

		insertion_point = parsed.instance
			? /** @type {number} */ (parsed.instance.content.end)
			: insertion_point;

		if (state.derived_components.size > 0) {
			check_rune_binding('derived');
			str.appendRight(
				insertion_point,
				`\n${indent}${[...state.derived_components.entries()].map(([init, name]) => `const ${name} = $derived(${init});`).join(`\n${indent}`)}\n`
			);
		}

		if (state.derived_conflicting_slots.size > 0) {
			check_rune_binding('derived');
			str.appendRight(
				insertion_point,
				`\n${indent}${[...state.derived_conflicting_slots.entries()].map(([name, init]) => `const ${name} = $derived(${init});`).join(`\n${indent}`)}\n`
			);
		}

		if (state.props.length > 0 && state.analysis.accessors) {
			str.appendRight(
				insertion_point,
				`\n${indent}export {${state.props.reduce((acc, prop) => (prop.slot_name || prop.type_only ? acc : `${acc}\n${indent}\t${prop.local},`), '')}\n${indent}}\n`
			);
		}

		if (!parsed.instance && need_script) {
			str.appendRight(insertion_point, '\n</script>\n\n');
		}
		migrate_css(state);
		return {
			code: str.toString()
		};
	} catch (e) {
		if (!(e instanceof MigrationError)) {
			// eslint-disable-next-line no-console
			console.error('Error while migrating Svelte code', e);
		}
		has_migration_task = true;
		return {
			code: `<!-- @migration-task Error while migrating Svelte code: ${/** @type {any} */ (e).message} -->\n${og_source}`
		};
	} finally {
		if (has_migration_task) {
			// eslint-disable-next-line no-console
			console.log(
				`One or more \`@migration-task\` comments were added to ${filename ? `\`${filename}\`` : "a file (unfortunately we don't know the name)"}, please check them and complete the migration manually.`
			);
		}
	}
}

/**
 * @typedef {{
 *  scope: Scope;
 *  str: MagicString;
 *  analysis: ComponentAnalysis;
 *  filename?: string;
 *  indent: string;
 *  props: Array<{ local: string; exported: string; init: string; bindable: boolean; slot_name?: string; optional: boolean; type: string; comment?: string; trailing_comment?: string; type_only?: boolean; needs_refine_type?: boolean; }>;
 *  props_insertion_point: number;
 *  has_props_rune: boolean;
 *  has_type_or_fallback: boolean;
 *  end: number;
 * 	names: Record<string, string>;
 * 	legacy_imports: Set<string>;
 * 	script_insertions: Set<string>;
 *  derived_components: Map<string, string>;
 *  derived_conflicting_slots: Map<string, string>;
 * 	derived_labeled_statements: Set<LabeledStatement>;
 *  has_svelte_self: boolean;
 *  uses_ts: boolean;
 * }} State
 */

/** @type {Visitors<AST.SvelteNode, State>} */
const instance_script = {
	_(node, { state, next }) {
		// @ts-expect-error
		const comments = node.leadingComments;
		if (comments) {
			for (const comment of comments) {
				if (comment.type === 'Line') {
					const migrated = migrate_svelte_ignore(comment.value);
					if (migrated !== comment.value) {
						state.str.overwrite(comment.start + '//'.length, comment.end, migrated);
					}
				}
			}
		}
		next();
	},
	Identifier(node, { state, path }) {
		handle_identifier(node, state, path);
	},
	ImportDeclaration(node, { state }) {
		state.props_insertion_point = node.end ?? state.props_insertion_point;
		if (node.source.value === 'svelte') {
			let illegal_specifiers = [];
			let removed_specifiers = 0;
			for (let specifier of node.specifiers) {
				if (
					specifier.type === 'ImportSpecifier' &&
					specifier.imported.type === 'Identifier' &&
					['beforeUpdate', 'afterUpdate'].includes(specifier.imported.name)
				) {
					const references = state.scope.references.get(specifier.local.name);
					if (!references) {
						let end = /** @type {number} */ (
							state.str.original.indexOf(',', specifier.end) !== -1 &&
							state.str.original.indexOf(',', specifier.end) <
								state.str.original.indexOf('}', specifier.end)
								? state.str.original.indexOf(',', specifier.end) + 1
								: specifier.end
						);
						while (state.str.original[end].trim() === '') end++;
						state.str.remove(/** @type {number} */ (specifier.start), end);
						removed_specifiers++;
						continue;
					}
					illegal_specifiers.push(specifier.imported.name);
				}
			}
			if (removed_specifiers === node.specifiers.length) {
				state.str.remove(/** @type {number} */ (node.start), /** @type {number} */ (node.end));
			}
			if (illegal_specifiers.length > 0) {
				throw new MigrationError(
					`Can't migrate code with ${illegal_specifiers.join(' and ')}. Please migrate by hand.`
				);
			}
		}
	},
	ExportNamedDeclaration(node, { state, next }) {
		if (node.declaration) {
			next();
			return;
		}

		let count_removed = 0;
		for (const specifier of node.specifiers) {
			if (specifier.local.type !== 'Identifier') continue;

			const binding = state.scope.get(specifier.local.name);
			if (binding?.kind === 'bindable_prop') {
				state.str.remove(
					/** @type {number} */ (specifier.start),
					/** @type {number} */ (specifier.end)
				);
				count_removed++;
			}
		}
		if (count_removed === node.specifiers.length) {
			state.str.remove(/** @type {number} */ (node.start), /** @type {number} */ (node.end));
		}
	},
	VariableDeclaration(node, { state, path, visit, next }) {
		if (state.scope !== state.analysis.instance.scope) {
			return;
		}

		let nr_of_props = 0;

		for (let i = 0; i < node.declarations.length; i++) {
			const declarator = node.declarations[i];
			if (state.analysis.runes) {
				if (get_rune(declarator.init, state.scope) === '$props') {
					state.props_insertion_point = /** @type {number} */ (declarator.id.start) + 1;
					state.has_props_rune = true;
				}
				continue;
			}

			let bindings;
			try {
				bindings = state.scope.get_bindings(declarator);
			} catch (e) {
				// no bindings, so we can skip this
				next();
				continue;
			}
			const has_state = bindings.some((binding) => binding.kind === 'state');
			const has_props = bindings.some((binding) => binding.kind === 'bindable_prop');

			if (!has_state && !has_props) {
				next();
				continue;
			}

			if (has_props) {
				nr_of_props++;

				if (declarator.id.type !== 'Identifier') {
					// TODO invest time in this?
					throw new MigrationError(
						'Encountered an export declaration pattern that is not supported for automigration.'
					);
					// Turn export let into props. It's really really weird because export let { x: foo, z: [bar]} = ..
					// means that foo and bar are the props (i.e. the leafs are the prop names), not x and z.
					// const tmp = b.id(state.scope.generate('tmp'));
					// const paths = extract_paths(declarator.id, tmp);
					// state.props_pre.push(
					// 	b.declaration('const', tmp, visit(declarator.init!) as Expression)
					// );
					// for (const path of paths) {
					// 	const name = (path.node as Identifier).name;
					// 	const binding = state.scope.get(name)!;
					// 	const value = path.expression;
					// 	if (binding.kind === 'bindable_prop' || binding.kind === 'rest_prop') {
					// 		state.props.push({
					// 			local: name,
					// 			exported: binding.prop_alias ? binding.prop_alias : name,
					// 			init: value
					// 		});
					// 		state.props_insertion_point = /** @type {number} */(declarator.end);
					// 	} else {
					// 		declarations.push(b.declarator(path.node, value));
					// 	}
					// }
				}

				const name = declarator.id.name;
				const binding = /** @type {Binding} */ (state.scope.get(name));

				if (state.analysis.uses_props && (declarator.init || binding.updated)) {
					throw new MigrationError(
						'$$props is used together with named props in a way that cannot be automatically migrated.'
					);
				}

				const prop = state.props.find((prop) => prop.exported === (binding.prop_alias || name));
				if (prop) {
					next();
					// $$Props type was used
					prop.init = declarator.init
						? state.str
								.snip(
									/** @type {number} */ (declarator.init.start),
									/** @type {number} */ (declarator.init.end)
								)
								.toString()
						: '';
					prop.bindable = binding.updated;
					prop.exported = binding.prop_alias || name;
					prop.type_only = false;
				} else {
					next();
					state.props.push({
						local: name,
						exported: binding.prop_alias ? binding.prop_alias : name,
						init: declarator.init
							? state.str
									.snip(
										/** @type {number} */ (declarator.init.start),
										/** @type {number} */ (declarator.init.end)
									)
									.toString()
							: '',
						optional: !!declarator.init,
						bindable: binding.updated,
						...extract_type_and_comment(declarator, state, path)
					});
				}

				let start = /** @type {number} */ (declarator.start);
				let end = /** @type {number} */ (declarator.end);

				// handle cases like let a,b,c; where only some are exported
				if (node.declarations.length > 1) {
					// move the insertion point after the node itself;
					state.props_insertion_point = /** @type {number} */ (node.end);
					// if it's not the first declaration remove from the , of the previous declaration
					if (i !== 0) {
						start = state.str.original.indexOf(
							',',
							/** @type {number} */ (node.declarations[i - 1].end)
						);
					}
					// if it's not the last declaration remove either from up until the
					// start of the next declaration (if it's the first declaration) or
					// up until the last index of , from the next declaration
					if (i !== node.declarations.length - 1) {
						if (i === 0) {
							end = /** @type {number} */ (node.declarations[i + 1].start);
						} else {
							end = state.str.original.lastIndexOf(
								',',
								/** @type {number} */ (node.declarations[i + 1].start)
							);
						}
					}
				} else {
					state.props_insertion_point = /** @type {number} */ (declarator.end);
				}

				state.str.update(start, end, '');

				continue;
			}

			/**
			 * @param {"state"|"derived"} rune
			 */
			function check_rune_binding(rune) {
				const has_rune_binding = !!state.scope.get(rune);
				if (has_rune_binding) {
					throw new MigrationError(
						`can't migrate \`${state.str.original.substring(/** @type {number} */ (node.start), node.end)}\` to \`$${rune}\` because there's a variable named ${rune}.\n     Rename the variable and try again or migrate by hand.`
					);
				}
			}

			// state
			if (declarator.init) {
				let { start, end } = /** @type {{ start: number, end: number }} */ (declarator.init);

				if (declarator.init.type === 'SequenceExpression') {
					while (state.str.original[start] !== '(') start -= 1;
					while (state.str.original[end - 1] !== ')') end += 1;
				}

				check_rune_binding('state');

				state.str.prependLeft(start, '$state(');
				state.str.appendRight(end, ')');
			} else {
				/**
				 * @type {AssignmentExpression | undefined}
				 */
				let assignment_in_labeled;
				/**
				 * @type {LabeledStatement | undefined}
				 */
				let labeled_statement;

				// Analyze declaration bindings to see if they're exclusively updated within a single reactive statement
				const possible_derived = bindings.every((binding) =>
					binding.references.every((reference) => {
						const declaration = reference.path.find((el) => el.type === 'VariableDeclaration');
						const assignment = reference.path.find((el) => el.type === 'AssignmentExpression');
						const update = reference.path.find((el) => el.type === 'UpdateExpression');
						const labeled = /** @type {LabeledStatement | undefined} */ (
							reference.path.find((el) => el.type === 'LabeledStatement' && el.label.name === '$')
						);

						if (
							assignment &&
							labeled &&
							// ensure that $: foo = bar * 2 is not counted as a reassignment of bar
							(labeled.body.type !== 'ExpressionStatement' ||
								labeled.body.expression !== assignment ||
								(assignment.left.type === 'Identifier' &&
									assignment.left.name === binding.node.name))
						) {
							if (assignment_in_labeled) return false;
							assignment_in_labeled = /** @type {AssignmentExpression} */ (assignment);
							labeled_statement = labeled;
						}

						return (
							!update &&
							((declaration && binding.initial) ||
								(labeled && assignment) ||
								(!labeled && !assignment))
						);
					})
				);

				const labeled_has_single_assignment =
					labeled_statement?.body.type === 'BlockStatement' &&
					labeled_statement.body.body.length === 1 &&
					labeled_statement.body.body[0].type === 'ExpressionStatement';

				const is_expression_assignment =
					labeled_statement?.body.type === 'ExpressionStatement' &&
					labeled_statement.body.expression.type === 'AssignmentExpression';

				let should_be_state = false;

				if (is_expression_assignment) {
					const body = /**@type {ExpressionStatement}*/ (labeled_statement?.body);
					const expression = /**@type {AssignmentExpression}*/ (body.expression);
					const [, ids] = extract_all_identifiers_from_expression(expression.right);
					if (ids.length === 0) {
						should_be_state = true;
						state.derived_labeled_statements.add(
							/** @type {LabeledStatement} */ (labeled_statement)
						);
					}
				}

				if (
					!should_be_state &&
					possible_derived &&
					assignment_in_labeled &&
					labeled_statement &&
					(labeled_has_single_assignment || is_expression_assignment)
				) {
					const indent = state.str.original.substring(
						state.str.original.lastIndexOf('\n', /** @type {number} */ (node.start)) + 1,
						/** @type {number} */ (node.start)
					);
					// transfer all the leading comments
					if (
						labeled_statement.body.type === 'BlockStatement' &&
						labeled_statement.body.body[0].leadingComments
					) {
						for (let comment of labeled_statement.body.body[0].leadingComments) {
							state.str.prependLeft(
								/** @type {number} */ (node.start),
								comment.type === 'Block'
									? `/*${comment.value}*/\n${indent}`
									: `// ${comment.value}\n${indent}`
							);
						}
					}

					check_rune_binding('derived');

					// Someone wrote a `$: { ... }` statement which we can turn into a `$derived`
					state.str.appendRight(
						/** @type {number} */ (declarator.id.typeAnnotation?.end ?? declarator.id.end),
						' = $derived('
					);
					visit(assignment_in_labeled.right);
					state.str.appendRight(
						/** @type {number} */ (declarator.id.typeAnnotation?.end ?? declarator.id.end),
						state.str
							.snip(
								/** @type {number} */ (assignment_in_labeled.right.start),
								/** @type {number} */ (assignment_in_labeled.right.end)
							)
							.toString()
					);
					state.str.remove(
						/** @type {number} */ (labeled_statement.start),
						/** @type {number} */ (labeled_statement.end)
					);
					state.str.appendRight(
						/** @type {number} */ (declarator.id.typeAnnotation?.end ?? declarator.id.end),
						')'
					);
					state.derived_labeled_statements.add(labeled_statement);

					// transfer all the trailing comments
					if (
						labeled_statement.body.type === 'BlockStatement' &&
						labeled_statement.body.body[0].trailingComments
					) {
						for (let comment of labeled_statement.body.body[0].trailingComments) {
							state.str.appendRight(
								/** @type {number} */ (declarator.id.typeAnnotation?.end ?? declarator.id.end),
								comment.type === 'Block'
									? `\n${indent}/*${comment.value}*/`
									: `\n${indent}// ${comment.value}`
							);
						}
					}
				} else {
					check_rune_binding('state');

					state.str.prependLeft(
						/** @type {number} */ (declarator.id.typeAnnotation?.end ?? declarator.id.end),
						' = $state('
					);
					if (should_be_state) {
						// someone wrote a `$: foo = ...` statement which we can turn into `let foo = $state(...)`
						state.str.appendRight(
							/** @type {number} */ (declarator.id.typeAnnotation?.end ?? declarator.id.end),
							state.str
								.snip(
									/** @type {number} */ (
										/** @type {AssignmentExpression} */ (assignment_in_labeled).right.start
									),
									/** @type {number} */ (
										/** @type {AssignmentExpression} */ (assignment_in_labeled).right.end
									)
								)
								.toString()
						);
						state.str.remove(
							/** @type {number} */ (/** @type {LabeledStatement} */ (labeled_statement).start),
							/** @type {number} */ (/** @type {LabeledStatement} */ (labeled_statement).end)
						);
					}
					state.str.appendRight(
						/** @type {number} */ (declarator.id.typeAnnotation?.end ?? declarator.id.end),
						')'
					);
				}
			}
		}

		if (nr_of_props === node.declarations.length) {
			let start = /** @type {number} */ (node.start);
			let end = /** @type {number} */ (node.end);

			const parent = path.at(-1);
			if (parent?.type === 'ExportNamedDeclaration') {
				start = /** @type {number} */ (parent.start);
				end = /** @type {number} */ (parent.end);
			}
			while (state.str.original[start] !== '\n') start--;
			while (state.str.original[end] !== '\n') end++;
			state.str.update(start, end, '');
		}
	},
	BreakStatement(node, { state, path }) {
		if (path[1].type !== 'LabeledStatement') return;
		if (node.label?.name !== '$') return;
		state.str.update(
			/** @type {number} */ (node.start),
			/** @type {number} */ (node.end),
			'return;'
		);
	},
	LabeledStatement(node, { path, state, next }) {
		if (state.analysis.runes) return;
		if (path.length > 1) return;
		if (node.label.name !== '$') return;
		if (state.derived_labeled_statements.has(node)) return;

		next();

		/**
		 * @param {"state"|"derived"} rune
		 */
		function check_rune_binding(rune) {
			const has_rune_binding = state.scope.get(rune);
			if (has_rune_binding) {
				throw new MigrationError(
					`can't migrate \`$: ${state.str.original.substring(/** @type {number} */ (node.body.start), node.body.end)}\` to \`$${rune}\` because there's a variable named ${rune}.\n     Rename the variable and try again or migrate by hand.`
				);
			}
		}

		if (
			node.body.type === 'ExpressionStatement' &&
			node.body.expression.type === 'AssignmentExpression'
		) {
			const { left, right } = node.body.expression;

			const ids = extract_identifiers(left);
			const [, expression_ids] = extract_all_identifiers_from_expression(right);
			const bindings = ids.map((id) => /** @type {Binding} */ (state.scope.get(id.name)));

			if (bindings.every((b) => b.kind === 'legacy_reactive')) {
				if (
					right.type !== 'Literal' &&
					bindings.every((b) => b.kind !== 'store_sub') &&
					left.type !== 'MemberExpression'
				) {
					let { start, end } = /** @type {{ start: number, end: number }} */ (right);

					check_rune_binding('derived');

					// $derived
					state.str.update(
						/** @type {number} */ (node.start),
						/** @type {number} */ (node.body.expression.start),
						'let '
					);

					if (right.type === 'SequenceExpression') {
						while (state.str.original[start] !== '(') start -= 1;
						while (state.str.original[end - 1] !== ')') end += 1;
					}

					state.str.prependRight(start, `$derived(`);

					// in a case like `$: ({ a } = b())`, there's already a trailing parenthesis.
					// otherwise, we need to add one
					if (state.str.original[/** @type {number} */ (node.body.start)] !== '(') {
						state.str.appendLeft(end, `)`);
					}

					return;
				}

				for (const binding of bindings) {
					if (binding.reassigned && (ids.includes(binding.node) || expression_ids.length === 0)) {
						check_rune_binding('state');
						const init =
							binding.kind === 'state'
								? ' = $state()'
								: expression_ids.length === 0
									? ` = $state(${state.str.original.substring(/** @type {number} */ (right.start), right.end)})`
									: '';
						// implicitly-declared variable which we need to make explicit
						state.str.prependLeft(
							/** @type {number} */ (node.start),
							`let ${binding.node.name}${init};\n${state.indent}`
						);
					}
				}

				if (expression_ids.length === 0 && bindings.every((b) => b.kind !== 'store_sub')) {
					state.str.remove(/** @type {number} */ (node.start), /** @type {number} */ (node.end));
					return;
				}
			}
		}

		state.legacy_imports.add('run');
		const is_block_stmt = node.body.type === 'BlockStatement';
		const start_end = /** @type {number} */ (node.body.start);
		// TODO try to find out if we can use $derived.by instead?
		if (is_block_stmt) {
			state.str.update(
				/** @type {number} */ (node.start),
				start_end + 1,
				`${state.names.run}(() => {`
			);
			const end = /** @type {number} */ (node.body.end);
			state.str.update(end - 1, end, '});');
		} else {
			state.str.update(
				/** @type {number} */ (node.start),
				start_end,
				`${state.names.run}(() => {\n${state.indent}`
			);
			state.str.indent(state.indent, {
				exclude: [
					[0, /** @type {number} */ (node.body.start)],
					[/** @type {number} */ (node.body.end), state.end]
				]
			});
			state.str.appendLeft(/** @type {number} */ (node.end), `\n${state.indent}});`);
		}
	}
};

/**
 *
 * @param {State} state
 * @param {number} start
 * @param {number} end
 */
function trim_block(state, start, end) {
	const original = state.str.snip(start, end).toString();
	const without_parens = original.substring(1, original.length - 1);
	if (without_parens.trim().length !== without_parens.length) {
		state.str.update(start + 1, end - 1, without_parens.trim());
	}
}

/** @type {Visitors<AST.SvelteNode, State>} */
const template = {
	Identifier(node, { state, path }) {
		handle_identifier(node, state, path);
	},
	RegularElement(node, { state, path, next }) {
		migrate_slot_usage(node, path, state);
		handle_events(node, state);
		// Strip off any namespace from the beginning of the node name.
		const node_name = node.name.replace(/[a-zA-Z-]*:/g, '');

		if (state.analysis.source[node.end - 2] === '/' && !is_void(node_name) && !is_svg(node_name)) {
			let trimmed_position = node.end - 2;
			while (state.str.original.charAt(trimmed_position - 1) === ' ') trimmed_position--;
			state.str.remove(trimmed_position, node.end - 1);
			state.str.appendRight(node.end, `</${node.name}>`);
		}
		next();
	},
	SvelteSelf(node, { state, next }) {
		const source = state.str.original.substring(node.start, node.end);
		if (!state.filename) {
			const indent = guess_indent(source);
			has_migration_task = true;
			state.str.prependRight(
				node.start,
				`<!-- @migration-task: svelte:self is deprecated, import this Svelte file into itself instead -->\n${indent}`
			);
			next();
			return;
		}
		// overwrite the open tag
		state.str.overwrite(
			node.start + 1,
			node.start + 1 + 'svelte:self'.length,
			`${state.analysis.name}`
		);
		// if it has a fragment we need to overwrite the closing tag too
		if (node.fragment.nodes.length > 0) {
			state.str.overwrite(
				state.str.original.lastIndexOf('<', node.end) + 2,
				node.end - 1,
				`${state.analysis.name}`
			);
		} else if (!source.endsWith('/>')) {
			// special case for case `<svelte:self></svelte:self>` it has no fragment but
			// we still need to overwrite the end tag
			state.str.overwrite(
				node.start + source.lastIndexOf('</', node.end) + 2,
				node.end - 1,
				`${state.analysis.name}`
			);
		}
		state.has_svelte_self = true;
		next();
	},
	SvelteElement(node, { state, path, next }) {
		migrate_slot_usage(node, path, state);
		if (node.tag.type === 'Literal') {
			let is_static = true;

			let a = /** @type {number} */ (node.tag.start);
			let b = /** @type {number} */ (node.tag.end);
			let quote_mark = state.str.original[a - 1];

			while (state.str.original[--a] !== '=') {
				if (state.str.original[a] === '{') {
					is_static = false;
					break;
				}
			}

			if (is_static && state.str.original[b] === quote_mark) {
				state.str.prependLeft(a + 1, '{');
				state.str.appendRight(/** @type {number} */ (node.tag.end) + 1, '}');
			}
		}

		handle_events(node, state);
		next();
	},
	Component(node, { state, path, next }) {
		next();
		migrate_slot_usage(node, path, state);
	},
	SvelteComponent(node, { state, next, path }) {
		next();

		migrate_slot_usage(node, path, state);

		let expression = state.str
			.snip(
				/** @type {number} */ (node.expression.start),
				/** @type {number} */ (node.expression.end)
			)
			.toString();

		if (
			(node.expression.type !== 'Identifier' && node.expression.type !== 'MemberExpression') ||
			!regex_valid_component_name.test(expression)
		) {
			let current_expression = expression;
			expression = state.scope.generate('SvelteComponent');
			let needs_derived = true;
			for (let i = path.length - 1; i >= 0; i--) {
				const part = path[i];
				if (
					part.type === 'EachBlock' ||
					part.type === 'AwaitBlock' ||
					part.type === 'IfBlock' ||
					part.type === 'SnippetBlock' ||
					part.type === 'Component' ||
					part.type === 'SvelteComponent'
				) {
					let position = node.start;
					if (i !== path.length - 1) {
						for (let modifier = 1; modifier < path.length - i; modifier++) {
							const path_part = path[i + modifier];
							if ('start' in path_part) {
								position = /** @type {number} */ (path_part.start);
								break;
							}
						}
					}
					const indent = state.str.original.substring(
						state.str.original.lastIndexOf('\n', position) + 1,
						position
					);
					state.str.appendRight(
						position,
						`{@const ${expression} = ${current_expression}}\n${indent}`
					);
					needs_derived = false;
					break;
				}
			}
			if (needs_derived) {
				if (state.derived_components.has(current_expression)) {
					expression = /** @type {string} */ (state.derived_components.get(current_expression));
				} else {
					state.derived_components.set(current_expression, expression);
				}
			}
		}

		state.str.overwrite(node.start + 1, node.start + node.name.length + 1, expression);

		if (state.str.original.substring(node.end - node.name.length - 1, node.end - 1) === node.name) {
			state.str.overwrite(node.end - node.name.length - 1, node.end - 1, expression);
		}
		let this_pos = state.str.original.lastIndexOf('this', node.expression.start);
		while (!state.str.original.charAt(this_pos - 1).trim()) this_pos--;
		const end_pos = state.str.original.indexOf('}', node.expression.end) + 1;
		state.str.remove(this_pos, end_pos);
	},
	SvelteFragment(node, { state, path, next }) {
		migrate_slot_usage(node, path, state);
		next();
	},
	SvelteWindow(node, { state, next }) {
		handle_events(node, state);
		next();
	},
	SvelteBody(node, { state, next }) {
		handle_events(node, state);
		next();
	},
	SvelteDocument(node, { state, next }) {
		handle_events(node, state);
		next();
	},
	SlotElement(node, { state, path, next, visit }) {
		migrate_slot_usage(node, path, state);

		if (state.analysis.custom_element) return;
		let name = 'children';
		let slot_name = 'default';
		let slot_props = '{ ';
		let aliased_slot_name;

		for (const attr of node.attributes) {
			if (attr.type === 'SpreadAttribute') {
				slot_props += `...${state.str.original.substring(/** @type {number} */ (attr.expression.start), attr.expression.end)}, `;
			} else if (attr.type === 'Attribute') {
				if (attr.name === 'slot') {
					continue;
				}

				if (attr.name === 'name') {
					slot_name = /** @type {any} */ (attr.value)[0].data;
					// if some of the parents or this node itself har a slot
					// attribute with the sane name of this slot
					// we want to create a derived or the migrated snippet
					// will shadow the slot prop
					if (
						path.some(
							(parent) =>
								(parent.type === 'RegularElement' ||
									parent.type === 'SvelteElement' ||
									parent.type === 'Component' ||
									parent.type === 'SvelteComponent' ||
									parent.type === 'SvelteFragment') &&
								parent.attributes.some(
									(attribute) =>
										attribute.type === 'Attribute' &&
										attribute.name === 'slot' &&
										is_text_attribute(attribute) &&
										attribute.value[0].data === slot_name
								)
						) ||
						node.attributes.some(
							(attribute) =>
								attribute.type === 'Attribute' &&
								attribute.name === 'slot' &&
								is_text_attribute(attribute) &&
								attribute.value[0].data === slot_name
						)
					) {
						aliased_slot_name = `${slot_name}_render`;
						state.derived_conflicting_slots.set(aliased_slot_name, slot_name);
					}
				} else {
					const attr_value =
						attr.value === true || Array.isArray(attr.value) ? attr.value : [attr.value];
					let value = 'true';
					if (attr_value !== true) {
						const first = attr_value[0];
						const last = attr_value[attr_value.length - 1];
						for (const attr of attr_value) {
							visit(attr);
						}
						value = state.str
							.snip(
								first.type === 'Text'
									? first.start - 1
									: /** @type {number} */ (first.expression.start),
								last.type === 'Text' ? last.end + 1 : /** @type {number} */ (last.expression.end)
							)
							.toString();
					}
					slot_props += value === attr.name ? `${value}, ` : `${attr.name}: ${value}, `;
				}
			}
		}

		slot_props += '}';
		if (slot_props === '{ }') {
			slot_props = '';
		}

		const existing_prop = state.props.find((prop) => prop.slot_name === slot_name);
		if (existing_prop) {
			name = existing_prop.local;
		} else if (slot_name !== 'default') {
			name = state.scope.generate(slot_name);
			if (name !== slot_name) {
				throw new MigrationError(
					`This migration would change the name of a slot (${slot_name} to ${name}) making the component unusable`
				);
			}
		}

		if (!existing_prop) {
			state.props.push({
				local: name,
				exported: name,
				init: '',
				bindable: false,
				optional: true,
				slot_name,
				type: `import('svelte').${slot_props ? 'Snippet<[any]>' : 'Snippet'}`
			});
		} else if (existing_prop.needs_refine_type) {
			existing_prop.type = `import('svelte').${slot_props ? 'Snippet<[any]>' : 'Snippet'}`;
			existing_prop.needs_refine_type = false;
		}

		if (
			slot_name === 'default' &&
			path.some(
				(parent) =>
					(parent.type === 'SvelteComponent' ||
						parent.type === 'Component' ||
						parent.type === 'RegularElement' ||
						parent.type === 'SvelteElement' ||
						parent.type === 'SvelteFragment') &&
					parent.attributes.some((attr) => attr.type === 'LetDirective')
			)
		) {
			aliased_slot_name = `${name}_render`;
			state.derived_conflicting_slots.set(aliased_slot_name, name);
		}
		name = aliased_slot_name ?? name;

		if (node.fragment.nodes.length > 0) {
			next();
			state.str.update(
				node.start,
				node.fragment.nodes[0].start,
				`{#if ${name}}{@render ${state.analysis.uses_props ? `${state.names.props}.` : ''}${name}(${slot_props})}{:else}`
			);
			state.str.update(node.fragment.nodes[node.fragment.nodes.length - 1].end, node.end, '{/if}');
		} else {
			state.str.update(
				node.start,
				node.end,
				`{@render ${state.analysis.uses_props ? `${state.names.props}.` : ''}${name}?.(${slot_props})}`
			);
		}
	},
	Comment(node, { state }) {
		const migrated = migrate_svelte_ignore(node.data);
		if (migrated !== node.data) {
			state.str.overwrite(node.start + '<!--'.length, node.end - '-->'.length, migrated);
		}
	},
	HtmlTag(node, { state, next }) {
		trim_block(state, node.start, node.end);
		next();
	},
	ConstTag(node, { state, next }) {
		trim_block(state, node.start, node.end);
		next();
	},
	IfBlock(node, { state, next }) {
		const start = node.start;
		const end = state.str.original.indexOf('}', node.test.end) + 1;
		trim_block(state, start, end);
		next();
	},
	AwaitBlock(node, { state, next }) {
		const start = node.start;
		const end =
			state.str.original.indexOf(
				'}',
				node.pending !== null ? node.expression.end : node.value?.end
			) + 1;
		trim_block(state, start, end);
		if (node.pending !== null) {
			const start = state.str.original.lastIndexOf('{', node.value?.start);
			const end = state.str.original.indexOf('}', node.value?.end) + 1;
			trim_block(state, start, end);
		}
		if (node.catch !== null) {
			const start = state.str.original.lastIndexOf('{', node.error?.start);
			const end = state.str.original.indexOf('}', node.error?.end) + 1;
			trim_block(state, start, end);
		}
		next();
	},
	KeyBlock(node, { state, next }) {
		const start = node.start;
		const end = state.str.original.indexOf('}', node.expression.end) + 1;
		trim_block(state, start, end);
		next();
	}
};

/**
 * @param {AST.RegularElement | AST.SvelteElement | AST.SvelteComponent | AST.Component | AST.SlotElement | AST.SvelteFragment} node
 * @param {AST.SvelteNode[]} path
 * @param {State} state
 */
function migrate_slot_usage(node, path, state) {
	const parent = path.at(-2);
	// Bail on custom element slot usage
	if (
		parent?.type !== 'Component' &&
		parent?.type !== 'SvelteComponent' &&
		node.type !== 'Component' &&
		node.type !== 'SvelteComponent'
	) {
		return;
	}

	let snippet_name = 'children';
	let snippet_props = [];

	// if we stop the transform because the name is not correct we don't want to
	// remove the let directive and they could come before the name
	let removal_queue = [];

	for (let attribute of node.attributes) {
		if (
			attribute.type === 'Attribute' &&
			attribute.name === 'slot' &&
			is_text_attribute(attribute)
		) {
			snippet_name = attribute.value[0].data;
			// the default slot in svelte 4 if what the children slot is for svelte 5
			if (snippet_name === 'default') {
				snippet_name = 'children';
			}
			if (!regex_is_valid_identifier.test(snippet_name) || is_reserved(snippet_name)) {
				has_migration_task = true;
				state.str.appendLeft(
					node.start,
					`<!-- @migration-task: migrate this slot by hand, \`${snippet_name}\` is an invalid identifier -->\n${state.indent}`
				);
				return;
			}
			if (parent?.type === 'Component' || parent?.type === 'SvelteComponent') {
				for (let attribute of parent.attributes) {
					if (attribute.type === 'Attribute' || attribute.type === 'BindDirective') {
						if (attribute.name === snippet_name) {
							state.str.appendLeft(
								node.start,
								`<!-- @migration-task: migrate this slot by hand, \`${snippet_name}\` would shadow a prop on the parent component -->\n${state.indent}`
							);
							return;
						}
					}
				}
			}
			// flush the queue after we found the name
			for (let remove_let of removal_queue) {
				remove_let();
			}
			state.str.remove(attribute.start, attribute.end);
		}
		if (attribute.type === 'LetDirective') {
			snippet_props.push(
				attribute.name +
					(attribute.expression
						? `: ${state.str.original.substring(/** @type {number} */ (attribute.expression.start), /** @type {number} */ (attribute.expression.end))}`
						: '')
			);
			// we just add to the queue to remove them after we found if we need to migrate or we bail
			removal_queue.push(() => state.str.remove(attribute.start, attribute.end));
		}
	}

	if (removal_queue.length > 0) {
		for (let remove_let of removal_queue) {
			remove_let();
		}
	}

	if (node.type === 'SvelteFragment' && node.fragment.nodes.length > 0) {
		// remove node itself, keep content
		state.str.remove(node.start, node.fragment.nodes[0].start);
		state.str.remove(node.fragment.nodes[node.fragment.nodes.length - 1].end, node.end);
	}

	const props = snippet_props.length > 0 ? `{ ${snippet_props.join(', ')} }` : '';

	if (snippet_name === 'children' && node.type !== 'SvelteFragment') {
		if (snippet_props.length === 0) return; // nothing to do

		let inner_start = 0;
		let inner_end = 0;
		for (let i = 0; i < node.fragment.nodes.length; i++) {
			const inner = node.fragment.nodes[i];
			const is_empty_text = inner.type === 'Text' && !inner.data.trim();

			if (
				(inner.type === 'RegularElement' ||
					inner.type === 'SvelteElement' ||
					inner.type === 'Component' ||
					inner.type === 'SvelteComponent' ||
					inner.type === 'SlotElement' ||
					inner.type === 'SvelteFragment') &&
				inner.attributes.some((attr) => attr.type === 'Attribute' && attr.name === 'slot')
			) {
				if (inner_start && !inner_end) {
					// End of default slot content
					inner_end = inner.start;
				}
			} else if (!inner_start && !is_empty_text) {
				// Start of default slot content
				inner_start = inner.start;
			} else if (inner_end && !is_empty_text) {
				// There was default slot content before, then some named slot content, now some default slot content again.
				// We're moving the last character back by one to avoid the closing {/snippet} tag inserted afterwards
				// to come before the opening {#snippet} tag of the named slot.
				state.str.update(inner_end - 1, inner_end, '');
				state.str.prependLeft(inner_end - 1, state.str.original[inner_end - 1]);
				state.str.move(inner.start, inner.end, inner_end - 1);
			}
		}

		if (!inner_end) {
			inner_end = node.fragment.nodes[node.fragment.nodes.length - 1].end;
		}

		state.str.appendLeft(
			inner_start,
			`{#snippet ${snippet_name}(${props})}\n${state.indent.repeat(path.length)}`
		);
		state.str.indent(state.indent, {
			exclude: [
				[0, inner_start],
				[inner_end, state.str.original.length]
			]
		});
		if (inner_end < node.fragment.nodes[node.fragment.nodes.length - 1].end) {
			// Named slots coming afterwards
			state.str.prependLeft(inner_end, `{/snippet}\n${state.indent.repeat(path.length)}`);
		} else {
			// No named slots coming afterwards
			state.str.prependLeft(
				inner_end,
				`${state.indent.repeat(path.length)}{/snippet}\n${state.indent.repeat(path.length - 1)}`
			);
		}
	} else {
		// Named slot or `svelte:fragment`: wrap element itself in a snippet
		state.str.prependLeft(
			node.start,
			`{#snippet ${snippet_name}(${props})}\n${state.indent.repeat(path.length - 2)}`
		);
		state.str.indent(state.indent, {
			exclude: [
				[0, node.start],
				[node.end, state.str.original.length]
			]
		});
		const str = `\n${state.indent.repeat(path.length - 2)}{/snippet}`;

		if (node.type === 'SlotElement') {
			state.str.appendRight(node.end, str);
		} else {
			state.str.appendLeft(node.end, str);
		}
	}
}

/**
 * @param {VariableDeclarator} declarator
 * @param {State} state
 * @param {AST.SvelteNode[]} path
 */
function extract_type_and_comment(declarator, state, path) {
	const str = state.str;
	const parent = path.at(-1);

	// Try to find jsdoc above the declaration
	let comment_node = /** @type {Node} */ (parent)?.leadingComments?.at(-1);

	const comment_start = /** @type {any} */ (comment_node)?.start;
	const comment_end = /** @type {any} */ (comment_node)?.end;
	let comment = comment_node && str.original.substring(comment_start, comment_end);
	if (comment_node) {
		str.update(comment_start, comment_end, '');
	}

	// Find trailing comments
	const trailing_comment_node = /** @type {Node} */ (parent)?.trailingComments?.at(0);
	const trailing_comment_start = /** @type {any} */ (trailing_comment_node)?.start;
	const trailing_comment_end = /** @type {any} */ (trailing_comment_node)?.end;
	let trailing_comment =
		trailing_comment_node && str.original.substring(trailing_comment_start, trailing_comment_end);

	if (trailing_comment_node) {
		str.update(trailing_comment_start, trailing_comment_end, '');
	}

	if (declarator.id.typeAnnotation) {
		state.has_type_or_fallback = true;
		let start = declarator.id.typeAnnotation.start + 1; // skip the colon
		while (str.original[start] === ' ') {
			start++;
		}
		return {
			type: str.original.substring(start, declarator.id.typeAnnotation.end),
			comment,
			trailing_comment
		};
	}

	let cleaned_comment_arr = comment
		?.split('\n')
		.map((line) =>
			line
				.trim()
				// replace `// ` for one liners
				.replace(/^\/\/\s*/g, '')
				// replace `\**` for the initial JSDoc
				.replace(/^\/\*\*?\s*/g, '')
				// migrate `*/` for the end of JSDoc
				.replace(/\s*\*\/$/g, '')
				// remove any initial `* ` to clean the comment
				.replace(/^\*\s*/g, '')
		)
		.filter(Boolean);
	const first_at_comment = cleaned_comment_arr?.findIndex((line) => line.startsWith('@'));
	let cleaned_comment = cleaned_comment_arr
		?.slice(0, first_at_comment !== -1 ? first_at_comment : cleaned_comment_arr.length)
		.join('\n');

	let cleaned_comment_arr_trailing = trailing_comment
		?.split('\n')
		.map((line) =>
			line
				.trim()
				// replace `// ` for one liners
				.replace(/^\/\/\s*/g, '')
				// replace `\**` for the initial JSDoc
				.replace(/^\/\*\*?\s*/g, '')
				// migrate `*/` for the end of JSDoc
				.replace(/\s*\*\/$/g, '')
				// remove any initial `* ` to clean the comment
				.replace(/^\*\s*/g, '')
		)
		.filter(Boolean);
	const first_at_comment_trailing = cleaned_comment_arr_trailing?.findIndex((line) =>
		line.startsWith('@')
	);
	let cleaned_comment_trailing = cleaned_comment_arr_trailing
		?.slice(
			0,
			first_at_comment_trailing !== -1
				? first_at_comment_trailing
				: cleaned_comment_arr_trailing.length
		)
		.join('\n');

	// try to find a comment with a type annotation, hinting at jsdoc
	if (parent?.type === 'ExportNamedDeclaration' && comment_node) {
		state.has_type_or_fallback = true;
		const match = /@type {(.+)}/.exec(comment_node.value);
		if (match) {
			// try to find JSDoc comments after a hyphen `-`
			const jsdoc_comment = /@type {.+} (?:\w+|\[.*?\]) - (.+)/.exec(comment_node.value);
			if (jsdoc_comment) {
				cleaned_comment += jsdoc_comment[1]?.trim();
			}
			return {
				type: match[1],
				comment: cleaned_comment,
				trailing_comment: cleaned_comment_trailing
			};
		}
	}

	// try to infer it from the init
	if (declarator.init?.type === 'Literal') {
		state.has_type_or_fallback = true; // only assume type if it's trivial to infer - else someone would've added a type annotation
		const type = typeof declarator.init.value;
		if (type === 'string' || type === 'number' || type === 'boolean') {
			return {
				type,
				comment: state.uses_ts ? comment : cleaned_comment,
				trailing_comment: state.uses_ts ? trailing_comment : cleaned_comment_trailing
			};
		}
	}
	return {
		type: 'any',
		comment: state.uses_ts ? comment : cleaned_comment,
		trailing_comment: state.uses_ts ? trailing_comment : cleaned_comment_trailing
	};
}

// Ensure modifiers are applied in the same order as Svelte 4
const modifier_order = /** @type {const} */ ([
	'preventDefault',
	'stopPropagation',
	'stopImmediatePropagation',
	'self',
	'trusted',
	'once'
]);

/**
 * @param {AST.RegularElement | AST.SvelteElement | AST.SvelteWindow | AST.SvelteDocument | AST.SvelteBody} element
 * @param {State} state
 */
function handle_events(element, state) {
	/** @type {Map<string, AST.OnDirective[]>} */
	const handlers = new Map();
	for (const attribute of element.attributes) {
		if (attribute.type !== 'OnDirective') continue;

		let name = `on${attribute.name}`;
		if (attribute.modifiers.includes('capture')) {
			name += 'capture';
		}

		const nodes = handlers.get(name) || [];
		nodes.push(attribute);
		handlers.set(name, nodes);
	}

	for (const [name, nodes] of handlers) {
		const handlers = [];

		let first = null;

		for (const node of nodes) {
			/** @type {string} */
			let body;

			if (node.expression) {
				body = state.str.original.substring(
					/** @type {number} */ (node.expression.start),
					/** @type {number} */ (node.expression.end)
				);
			} else {
				body = `${state.names.bubble}('${node.name}')`;
				state.legacy_imports.add('createBubbler');
				state.script_insertions.add(
					`const ${state.names.bubble} = ${state.names.createBubbler}();`
				);
			}

			const has_passive = node.modifiers.includes('passive');
			const has_nonpassive = node.modifiers.includes('nonpassive');

			const modifiers = modifier_order.filter((modifier) => node.modifiers.includes(modifier));

			for (const modifier of modifiers) {
				state.legacy_imports.add(modifier);
				body = `${state.names[modifier]}(${body})`;
			}

			if (has_passive || has_nonpassive) {
				const action = has_passive ? 'passive' : 'nonpassive';
				state.legacy_imports.add(action);

				state.str.overwrite(
					node.start,
					node.end,
					`use:${state.names[action]}={['${node.name}', () => ${body}]}`
				);
			} else {
				if (first) {
					let start = node.start;
					let end = node.end;

					while (/[\s\n]/.test(state.str.original[start - 1])) start -= 1;
					state.str.remove(start, end);
				} else {
					first = node;
				}

				handlers.push(body);
			}
		}

		if (first) {
			/** @type {string} */
			let replacement;

			if (handlers.length > 1) {
				state.legacy_imports.add('handlers');
				replacement = `${name}={${state.names.handlers}(${handlers.join(', ')})}`;
			} else {
				const handler = handlers[0];
				replacement = handler === name ? `{${handler}}` : `${name}={${handler}}`;
			}

			state.str.overwrite(first.start, first.end, replacement);
		}
	}
}

/**
 * Returns start and end of the node. If the start is preceeded with white-space-only before a line break,
 * the start will be the start of the line.
 * @param {string} source
 * @param {LabeledStatement} node
 */
function get_node_range(source, node) {
	const first_leading_comment = node.leadingComments?.[0];
	const last_trailing_comment = node.trailingComments?.[node.trailingComments.length - 1];

	// @ts-expect-error the type of `Comment` seems to be wrong...the node actually contains
	// start and end but the type seems to only contain a `range` (which doesn't actually exists)
	let start = /** @type {number} */ (first_leading_comment?.start ?? node.start);
	// @ts-expect-error the type of `Comment` seems to be wrong...the node actually contains
	// start and end but the type seems to only contain a `range` (which doesn't actually exists)
	let end = /** @type {number} */ (last_trailing_comment?.end ?? node.end);

	let idx = start;
	while (source[idx - 1] !== '\n' && source[idx - 1] !== '\r') {
		idx--;
		if (source[idx] !== ' ' && source[idx] !== '\t') {
			idx = start;
			break;
		}
	}

	start = idx;

	return { start, end };
}

/**
 * @param {Identifier} node
 * @param {State} state
 * @param {any[]} path
 */
function handle_identifier(node, state, path) {
	const parent = path.at(-1);
	if (parent?.type === 'MemberExpression' && parent.property === node) return;

	if (state.analysis.uses_props && node.name !== '$$slots') {
		if (node.name === '$$props' || node.name === '$$restProps') {
			// not 100% correct for $$restProps but it'll do
			state.str.update(
				/** @type {number} */ (node.start),
				/** @type {number} */ (node.end),
				state.names.props
			);
		} else {
			const binding = state.scope.get(node.name);
			if (binding?.kind === 'bindable_prop' && binding.node !== node) {
				state.str.prependLeft(/** @type {number} */ (node.start), `${state.names.props}.`);
			}
		}
	} else if (node.name === '$$restProps' && state.analysis.uses_rest_props) {
		state.str.update(
			/** @type {number} */ (node.start),
			/** @type {number} */ (node.end),
			state.names.rest
		);
	} else if (node.name === '$$slots' && state.analysis.uses_slots) {
		if (parent?.type === 'MemberExpression') {
			if (state.analysis.custom_element) return;

			let name = parent.property.type === 'Literal' ? parent.property.value : parent.property.name;
			let slot_name = name;
			const existing_prop = state.props.find((prop) => prop.slot_name === name);
			if (existing_prop) {
				name = existing_prop.local;
			} else if (name !== 'default') {
				let new_name = state.scope.generate(name);
				if (new_name !== name) {
					throw new MigrationError(
						`This migration would change the name of a slot (${name} to ${new_name}) making the component unusable`
					);
				}
			}

			name = name === 'default' ? 'children' : name;

			if (!existing_prop) {
				state.props.push({
					local: name,
					exported: name,
					init: '',
					bindable: false,
					optional: true,
					slot_name,
					// if it's the first time we encounter this slot
					// we start with any and delegate to when the slot
					// is actually rendered (it might not happen in that case)
					// any is still a safe bet
					type: `import('svelte').Snippet<[any]>`,
					needs_refine_type: true
				});
			}

			state.str.update(
				/** @type {number} */ (node.start),
				parent.property.start,
				state.analysis.uses_props ? `${state.names.props}.` : ''
			);
			state.str.update(parent.property.start, parent.end, name);
		}
		// else passed as identifier, we don't know what to do here, so let it error
	} else if (
		parent?.type === 'TSInterfaceDeclaration' ||
		parent?.type === 'TSTypeAliasDeclaration'
	) {
		const members =
			parent.type === 'TSInterfaceDeclaration' ? parent.body.body : parent.typeAnnotation?.members;
		if (Array.isArray(members)) {
			if (node.name === '$$Props') {
				state.has_type_or_fallback = true;

				for (const member of members) {
					const prop = state.props.find((prop) => prop.exported === member.key.name);

					const type = state.str.original.substring(
						member.typeAnnotation.typeAnnotation.start,
						member.typeAnnotation.typeAnnotation.end
					);

					let comment;
					const comment_node = member.leadingComments?.at(-1);
					if (comment_node?.type === 'Block') {
						comment = state.str.original.substring(comment_node.start, comment_node.end);
					}

					const trailing_comment = member.trailingComments?.at(0)?.value;

					if (prop) {
						prop.type = type;
						prop.optional = member.optional;
						prop.comment = comment ?? prop.comment;
						prop.trailing_comment = trailing_comment ?? prop.trailing_comment;
					} else {
						state.props.push({
							local: member.key.name,
							exported: member.key.name,
							init: '',
							bindable: false,
							optional: member.optional,
							type,
							comment,
							trailing_comment,
							type_only: true
						});
					}
				}

				state.str.remove(parent.start, parent.end);
			}
		}
	}
}

/** @param {string} content */
function guess_indent(content) {
	const lines = content.split('\n');

	const tabbed = lines.filter((line) => /^\t+/.test(line));
	const spaced = lines.filter((line) => /^ {2,}/.test(line));

	if (tabbed.length === 0 && spaced.length === 0) {
		return '\t';
	}

	// More lines tabbed than spaced? Assume tabs, and
	// default to tabs in the case of a tie (or nothing
	// to go on)
	if (tabbed.length >= spaced.length) {
		return '\t';
	}

	// Otherwise, we need to guess the multiple
	const min = spaced.reduce((previous, current) => {
		const count = /^ +/.exec(current)?.[0].length ?? 0;
		return Math.min(count, previous);
	}, Infinity);

	return ' '.repeat(min);
}
