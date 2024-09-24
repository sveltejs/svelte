/** @import { VariableDeclarator, Node, Identifier } from 'estree' */
/** @import { Visitors } from 'zimmerframe' */
/** @import { ComponentAnalysis } from '../phases/types.js' */
/** @import { Scope } from '../phases/scope.js' */
/** @import { AST, Binding, SvelteNode, ValidatedCompileOptions } from '#compiler' */
import MagicString from 'magic-string';
import { walk } from 'zimmerframe';
import { parse } from '../phases/1-parse/index.js';
import { analyze_component } from '../phases/2-analyze/index.js';
import { get_rune } from '../phases/scope.js';
import { reset, reset_warning_filter } from '../state.js';
import { extract_identifiers } from '../utils/ast.js';
import { migrate_svelte_ignore } from '../utils/extract_svelte_ignore.js';
import { validate_component_options } from '../validate-options.js';

/**
 * Does a best-effort migration of Svelte code towards using runes, event attributes and render tags.
 * May throw an error if the code is too complex to migrate automatically.
 *
 * @param {string} source
 * @returns {{ code: string; }}
 */
export function migrate(source) {
	try {
		reset_warning_filter(() => false);
		reset(source, { filename: 'migrate.svelte' });

		let parsed = parse(source);

		const { customElement: customElementOptions, ...parsed_options } = parsed.options || {};

		/** @type {ValidatedCompileOptions} */
		const combined_options = {
			...validate_component_options({}, ''),
			...parsed_options,
			customElementOptions
		};

		const str = new MagicString(source);
		const analysis = analyze_component(parsed, source, combined_options);
		const indent = guess_indent(source);

		/** @type {State} */
		let state = {
			scope: analysis.instance.scope,
			analysis,
			str,
			indent,
			props: [],
			props_insertion_point: parsed.instance?.content.start ?? 0,
			has_props_rune: false,
			props_name: analysis.root.unique('props').name,
			rest_props_name: analysis.root.unique('rest').name,
			end: source.length,
			legacy_imports_names: {
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
			script_insertions: new Set()
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

		const specifiers = [...state.legacy_imports].map((imported) => {
			const local = state.legacy_imports_names[imported];
			return imported === local ? imported : `${imported} as ${local}`;
		});

		const legacy_import = `import { ${specifiers.join(', ')} } from 'svelte/legacy';`;
		let added_legacy_import = false;

		if (state.props.length > 0 || analysis.uses_rest_props || analysis.uses_props) {
			const has_many_props = state.props.length > 3;
			const newline_separator = `\n${indent}${indent}`;
			const props_separator = has_many_props ? newline_separator : ' ';
			let props = '';
			if (analysis.uses_props) {
				props = `...${state.props_name}`;
			} else {
				props = state.props
					.map((prop) => {
						let prop_str =
							prop.local === prop.exported ? prop.local : `${prop.exported}: ${prop.local}`;
						if (prop.bindable) {
							prop_str += ` = $bindable(${prop.init})`;
						} else if (prop.init) {
							prop_str += ` = ${prop.init}`;
						}
						return prop_str;
					})
					.join(`,${props_separator}`);

				if (analysis.uses_rest_props) {
					props += `${state.props.length > 0 ? `,${props_separator}` : ''}...${state.rest_props_name}`;
				}
			}

			if (state.has_props_rune) {
				// some render tags or forwarded event attributes to add
				str.appendRight(state.props_insertion_point, ` ${props},`);
			} else {
				const uses_ts = parsed.instance?.attributes.some(
					(attr) => attr.name === 'lang' && /** @type {any} */ (attr).value[0].data === 'ts'
				);
				const type_name = state.scope.root.unique('Props').name;
				let type = '';
				if (uses_ts) {
					if (analysis.uses_props || analysis.uses_rest_props) {
						type = `interface ${type_name} { [key: string]: any }`;
					} else {
						type = `interface ${type_name} {${newline_separator}${state.props
							.map((prop) => {
								const comment = prop.comment ? `${prop.comment}${newline_separator}` : '';
								return `${comment}${prop.exported}${prop.optional ? '?' : ''}: ${prop.type};`;
							})
							.join(newline_separator)}\n${indent}}`;
					}
				} else {
					if (analysis.uses_props || analysis.uses_rest_props) {
						type = `{Record<string, any>}`;
					} else {
						type = `{${state.props
							.map((prop) => {
								return `${prop.exported}${prop.optional ? '?' : ''}: ${prop.type}`;
							})
							.join(`, `)}}`;
					}
				}

				let props_declaration = `let {${props_separator}${props}${has_many_props ? `\n${indent}` : ' '}}`;
				if (uses_ts) {
					props_declaration = `${type}\n\n${indent}${props_declaration}`;
					props_declaration = `${props_declaration}${type ? `: ${type_name}` : ''} = $props();`;
				} else {
					props_declaration = `/** @type {${type}} */\n${indent}${props_declaration}`;
					props_declaration = `${props_declaration} = $props();`;
				}

				if (parsed.instance) {
					props_declaration = `\n${indent}${props_declaration}`;
					str.appendRight(state.props_insertion_point, props_declaration);
				} else {
					const imports = state.legacy_imports.size > 0 ? `${indent}${legacy_import}\n` : '';
					const script_insertions =
						state.script_insertions.size > 0
							? `\n${indent}${[...state.script_insertions].join(indent)}\n`
							: '';
					str.prepend(
						`<script>\n${imports}${indent}${props_declaration}${script_insertions}\n</script>\n\n`
					);
					added_legacy_import = true;
				}
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
						/** @type {number} */ (dep.node.start) > /** @type {number} */ (node.start)
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
				str.remove(start - (source[start - 2] === '\r' ? 2 : 1), start);
			}
		}

		const script_insertions =
			state.script_insertions.size > 0
				? `\n${indent}${[...state.script_insertions].join(indent)}`
				: '';

		if (state.legacy_imports.size > 0 && !added_legacy_import) {
			if (parsed.instance) {
				str.appendRight(
					/** @type {number} */ (parsed.instance.content.start),
					`\n${indent}${legacy_import}${script_insertions}\n`
				);
			} else {
				str.prepend(
					`<script>\n${indent}${legacy_import}\n${indent}${script_insertions}\n</script>\n\n`
				);
			}
		}

		return { code: str.toString() };
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('Error while migrating Svelte code');
		throw e;
	}
}

/**
 * @typedef {{
 *  scope: Scope;
 *  str: MagicString;
 *  analysis: ComponentAnalysis;
 *  indent: string;
 *  props: Array<{ local: string; exported: string; init: string; bindable: boolean; slot_name?: string; optional: boolean; type: string; comment?: string }>;
 *  props_insertion_point: number;
 *  has_props_rune: boolean;
 * 	props_name: string;
 * 	rest_props_name: string;
 *  end: number;
 * 	legacy_imports_names: Record<string, string>;
 * 	legacy_imports: Set<string>;
 * 	script_insertions: Set<string>
 * }} State
 */

/** @type {Visitors<SvelteNode, State>} */
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
	},
	ExportNamedDeclaration(node, { state, next }) {
		if (node.declaration) {
			next();
			return;
		}

		let count_removed = 0;
		for (const specifier of node.specifiers) {
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
	VariableDeclaration(node, { state, path }) {
		if (state.scope !== state.analysis.instance.scope) {
			return;
		}

		let nr_of_props = 0;

		for (const declarator of node.declarations) {
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
				continue;
			}
			const has_state = bindings.some((binding) => binding.kind === 'state');
			const has_props = bindings.some((binding) => binding.kind === 'bindable_prop');

			if (!has_state && !has_props) {
				continue;
			}

			if (has_props) {
				nr_of_props++;

				if (declarator.id.type !== 'Identifier') {
					// TODO invest time in this?
					throw new Error(
						'Encountered an export declaration pattern that is not supported for automigration.'
					);
					// Turn export let into props. It's really really weird because export let { x: foo, z: [bar]} = ..
					// means that foo and bar are the props (i.e. the leafs are the prop names), not x and z.
					// const tmp = state.scope.generate('tmp');
					// const paths = extract_paths(declarator.id);
					// state.props_pre.push(
					// 	b.declaration('const', b.id(tmp), visit(declarator.init!) as Expression)
					// );
					// for (const path of paths) {
					// 	const name = (path.node as Identifier).name;
					// 	const binding = state.scope.get(name)!;
					// 	const value = path.expression!(b.id(tmp));
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
					throw new Error(
						'$$props is used together with named props in a way that cannot be automatically migrated.'
					);
				}

				const prop = state.props.find((prop) => prop.exported === (binding.prop_alias || name));
				if (prop) {
					// $$Props type was used
					prop.init = declarator.init
						? state.str.original.substring(
								/** @type {number} */ (declarator.init.start),
								/** @type {number} */ (declarator.init.end)
							)
						: '';
					prop.bindable = binding.updated;
					prop.exported = binding.prop_alias || name;
				} else {
					state.props.push({
						local: name,
						exported: binding.prop_alias ? binding.prop_alias : name,
						init: declarator.init
							? state.str.original.substring(
									/** @type {number} */ (declarator.init.start),
									/** @type {number} */ (declarator.init.end)
								)
							: '',
						optional: !!declarator.init,
						bindable: binding.updated,
						...extract_type_and_comment(declarator, state.str, path)
					});
				}

				state.props_insertion_point = /** @type {number} */ (declarator.end);
				state.str.update(
					/** @type {number} */ (declarator.start),
					/** @type {number} */ (declarator.end),
					''
				);

				continue;
			}

			// state
			if (declarator.init) {
				let { start, end } = /** @type {{ start: number, end: number }} */ (declarator.init);

				if (declarator.init.type === 'SequenceExpression') {
					while (state.str.original[start] !== '(') start -= 1;
					while (state.str.original[end - 1] !== ')') end += 1;
				}

				state.str.prependLeft(start, '$state(');
				state.str.appendRight(end, ')');
			} else {
				state.str.prependLeft(
					/** @type {number} */ (declarator.id.typeAnnotation?.end ?? declarator.id.end),
					' = $state()'
				);
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

		next();

		if (
			node.body.type === 'ExpressionStatement' &&
			node.body.expression.type === 'AssignmentExpression'
		) {
			const ids = extract_identifiers(node.body.expression.left);
			const bindings = ids.map((id) => state.scope.get(id.name));
			const reassigned_bindings = bindings.filter((b) => b?.reassigned);
			if (reassigned_bindings.length === 0 && !bindings.some((b) => b?.kind === 'store_sub')) {
				let { start, end } = /** @type {{ start: number, end: number }} */ (
					node.body.expression.right
				);

				// $derived
				state.str.update(
					/** @type {number} */ (node.start),
					/** @type {number} */ (node.body.expression.start),
					'let '
				);

				if (node.body.expression.right.type === 'SequenceExpression') {
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
			} else {
				for (const binding of reassigned_bindings) {
					if (binding && ids.includes(binding.node)) {
						// implicitly-declared variable which we need to make explicit
						state.str.prependRight(
							/** @type {number} */ (node.start),
							`let ${binding.node.name}${binding.kind === 'state' ? ' = $state()' : ''};\n${state.indent}`
						);
					}
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
				`${state.legacy_imports_names.run}(() => {`
			);
			const end = /** @type {number} */ (node.body.end);
			state.str.update(end - 1, end, '});');
		} else {
			state.str.update(
				/** @type {number} */ (node.start),
				start_end,
				`${state.legacy_imports_names.run}(() => {\n${state.indent}`
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

/** @type {Visitors<SvelteNode, State>} */
const template = {
	Identifier(node, { state, path }) {
		handle_identifier(node, state, path);
	},
	RegularElement(node, { state, next }) {
		handle_events(node, state);
		next();
	},
	SvelteElement(node, { state, next }) {
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
	SlotElement(node, { state, next }) {
		let name = 'children';
		let slot_name = 'default';
		let slot_props = '{ ';

		for (const attr of node.attributes) {
			if (attr.type === 'SpreadAttribute') {
				slot_props += `...${state.str.original.substring(/** @type {number} */ (attr.expression.start), attr.expression.end)}, `;
			} else if (attr.type === 'Attribute') {
				if (attr.name === 'name') {
					slot_name = /** @type {any} */ (attr.value)[0].data;
				} else {
					const attr_value =
						attr.value === true || Array.isArray(attr.value) ? attr.value : [attr.value];
					const value =
						attr_value !== true
							? state.str.original.substring(
									attr_value[0].start,
									attr_value[attr_value.length - 1].end
								)
							: 'true';
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
		}

		if (node.fragment.nodes.length > 0) {
			next();
			state.str.update(
				node.start,
				node.fragment.nodes[0].start,
				`{#if ${name}}{@render ${name}(${slot_props})}{:else}`
			);
			state.str.update(node.fragment.nodes[node.fragment.nodes.length - 1].end, node.end, '{/if}');
		} else {
			state.str.update(node.start, node.end, `{@render ${name}?.(${slot_props})}`);
		}
	},
	Comment(node, { state }) {
		const migrated = migrate_svelte_ignore(node.data);
		if (migrated !== node.data) {
			state.str.overwrite(node.start + '<!--'.length, node.end - '-->'.length, migrated);
		}
	}
};

/**
 * @param {VariableDeclarator} declarator
 * @param {MagicString} str
 * @param {SvelteNode[]} path
 */
function extract_type_and_comment(declarator, str, path) {
	const parent = path.at(-1);

	// Try to find jsdoc above the declaration
	let comment_node = /** @type {Node} */ (parent)?.leadingComments?.at(-1);
	if (comment_node?.type !== 'Block') comment_node = undefined;

	const comment_start = /** @type {any} */ (comment_node)?.start;
	const comment_end = /** @type {any} */ (comment_node)?.end;
	const comment = comment_node && str.original.substring(comment_start, comment_end);

	if (comment_node) {
		str.update(comment_start, comment_end, '');
	}

	if (declarator.id.typeAnnotation) {
		let start = declarator.id.typeAnnotation.start + 1; // skip the colon
		while (str.original[start] === ' ') {
			start++;
		}
		return { type: str.original.substring(start, declarator.id.typeAnnotation.end), comment };
	}

	// try to find a comment with a type annotation, hinting at jsdoc
	if (parent?.type === 'ExportNamedDeclaration' && comment_node) {
		const match = /@type {(.+)}/.exec(comment_node.value);
		if (match) {
			return { type: match[1] };
		}
	}

	// try to infer it from the init
	if (declarator.init?.type === 'Literal') {
		const type = typeof declarator.init.value;
		if (type === 'string' || type === 'number' || type === 'boolean') {
			return { type, comment };
		}
	}

	return { type: 'any', comment };
}

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
		if (nodes.length > 1) {
			state.legacy_imports.add('handlers');
		}

		const handlers = [];
		const explicit_passive_handlers = [];

		for (let i = 0; i < nodes.length; i += 1) {
			const node = nodes[i];
			const indent = get_indent(state, node, element);
			const new_line_index = state.str.original.lastIndexOf('\n', node.start);
			const needs_line_delete =
				state.str.original.substring(new_line_index, node.start).trim() === '' && i !== 0;

			// always move once as the first modifier
			const sorted_modifier = [...node.modifiers].sort((a, b) =>
				a === 'once' ? 1 : b === 'once' ? -1 : 0
			);

			let body = `${state.legacy_imports_names.bubble}('${node.name}')`;

			if (node.expression) {
				body = state.str.original.substring(
					/** @type {number} */ (node.expression.start),
					/** @type {number} */ (node.expression.end)
				);
			} else {
				state.legacy_imports.add('createBubbler');
				state.script_insertions.add(
					`const ${state.legacy_imports_names.bubble} = ${state.legacy_imports_names.createBubbler}();\n`
				);
			}

			let has_passive = false;
			let has_nonpassive = false;

			for (const modifier of sorted_modifier) {
				has_passive ||= modifier === 'passive';
				has_nonpassive ||= modifier === 'nonpassive';
				if (modifier !== 'capture' && modifier !== 'passive' && modifier !== 'nonpassive') {
					state.legacy_imports.add(modifier);
					body = `${state.legacy_imports_names[modifier]}(${body})`;
				}
			}
			if (has_passive || has_nonpassive) {
				if (has_passive) {
					state.legacy_imports.add('passive');
				}
				if (has_nonpassive) {
					state.legacy_imports.add('nonpassive');
				}
				explicit_passive_handlers.push({
					handler: `use:${has_nonpassive ? state.legacy_imports_names.nonpassive : state.legacy_imports_names.passive}={['${node.name}', () => ${body}]}`,
					indent,
					needs_line_delete
				});
			} else {
				handlers.push({
					handler: body,
					indent,
					needs_line_delete
				});
			}
			state.str.remove(needs_line_delete ? new_line_index : node.start, node.end);
		}

		const first_node = nodes[0];

		if (first_node) {
			let handlers_body = '';
			for (const handler of handlers) {
				handlers_body += `${handler.needs_line_delete || nodes.length > 1 ? `\n${handler.indent}` : ''}${handler.handler},`;
			}
			handlers_body = handlers_body.substring(0, handlers_body.length - 1);
			if (handlers_body) {
				if (handlers_body === name) {
					state.str.overwrite(first_node.start, first_node.end, `{${name}}`);
				} else {
					state.str.overwrite(
						first_node.start,
						first_node.end,
						`${name}={${nodes.length > 1 ? `${state.legacy_imports_names.handlers}(` : ''}${handlers_body}${nodes.length > 1 ? ')' : ''}}`
					);
				}
			}
			for (const passive_handler of explicit_passive_handlers) {
				state.str.appendRight(
					first_node.end,
					`${passive_handler.needs_line_delete || nodes.length > 1 ? `\n${passive_handler.indent}` : ''}${passive_handler.handler}`
				);
			}
		}
	}
}

/**
 * Returns the next indentation level of the first node that has all-whitespace before it
 * @param {State} state
 * @param {Array<{start: number; end: number}>} nodes
 */
function get_indent(state, ...nodes) {
	let indent = state.indent;

	for (const node of nodes) {
		const line_start = state.str.original.lastIndexOf('\n', node.start);
		indent = state.str.original.substring(line_start + 1, node.start);

		if (indent.trim() === '') {
			indent = state.indent + indent;
			return indent;
		} else {
			indent = state.indent;
		}
	}

	return indent;
}

/**
 * Returns start and end of the node. If the start is preceeded with white-space-only before a line break,
 * the start will be the start of the line.
 * @param {string} source
 * @param {Node} node
 */
function get_node_range(source, node) {
	let start = /** @type {number} */ (node.start);
	let end = /** @type {number} */ (node.end);

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
 * @param {AST.OnDirective} last
 * @param {State} state
 */
function generate_event_name(last, state) {
	const scope =
		(last.expression && state.analysis.template.scopes.get(last.expression)) || state.scope;

	let name = 'event';
	if (!scope.get(name)) return name;

	let i = 1;
	while (scope.get(`${name}${i}`)) i += 1;
	return `${name}${i}`;
}

/**
 * @param {Identifier} node
 * @param {State} state
 * @param {any[]} path
 */
function handle_identifier(node, state, path) {
	const parent = path.at(-1);
	if (parent?.type === 'MemberExpression' && parent.property === node) return;

	if (state.analysis.uses_props) {
		if (node.name === '$$props' || node.name === '$$restProps') {
			// not 100% correct for $$restProps but it'll do
			state.str.update(
				/** @type {number} */ (node.start),
				/** @type {number} */ (node.end),
				state.props_name
			);
		} else {
			const binding = state.scope.get(node.name);
			if (binding?.kind === 'bindable_prop') {
				state.str.prependLeft(/** @type {number} */ (node.start), `${state.props_name}.`);
			}
		}
	} else if (node.name === '$$restProps' && state.analysis.uses_rest_props) {
		state.str.update(
			/** @type {number} */ (node.start),
			/** @type {number} */ (node.end),
			state.rest_props_name
		);
	} else if (node.name === '$$slots' && state.analysis.uses_slots) {
		if (parent?.type === 'MemberExpression') {
			state.str.update(/** @type {number} */ (node.start), parent.property.start, '');
			if (parent.property.name === 'default') {
				state.str.update(parent.property.start, parent.property.end, 'children');
			}
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

					if (prop) {
						prop.type = type;
						prop.optional = member.optional;
						prop.comment = comment ?? prop.comment;
					} else {
						state.props.push({
							local: member.key.name,
							exported: member.key.name,
							init: '',
							bindable: false,
							optional: member.optional,
							type,
							comment
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
