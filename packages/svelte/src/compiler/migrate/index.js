import MagicString from 'magic-string';
import { walk } from 'zimmerframe';
import { parse } from '../phases/1-parse/index.js';
import { analyze_component } from '../phases/2-analyze/index.js';
import { validate_component_options } from '../validate-options.js';
import { get_rune } from '../phases/scope.js';
import { reset } from '../state.js';
import { extract_identifiers } from '../utils/ast.js';
import { regex_is_valid_identifier } from '../phases/patterns.js';
import { migrate_svelte_ignore } from '../utils/extract_svelte_ignore.js';

/**
 * Does a best-effort migration of Svelte code towards using runes, event attributes and render tags.
 * May throw an error if the code is too complex to migrate automatically.
 *
 * @param {string} source
 * @returns {{ code: string; }}
 */
export function migrate(source) {
	try {
		reset(source, { filename: 'migrate.svelte' });

		let parsed = parse(source);

		const { customElement: customElementOptions, ...parsed_options } = parsed.options || {};

		/** @type {import('#compiler').ValidatedCompileOptions} */
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
			run_name: analysis.root.unique('run').name,
			needs_run: false
		};

		if (parsed.instance) {
			walk(parsed.instance.content, state, instance_script);
		}

		state = { ...state, scope: analysis.template.scope };
		walk(parsed.fragment, state, template);

		const run_import = `import { run${state.run_name === 'run' ? '' : `as ${state.run_name}`} } from 'svelte/legacy';`;
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
					props += `,${props_separator}...${state.rest_props_name}`;
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
					const imports = state.needs_run ? `${indent}${run_import}\n` : '';
					str.prepend(`<script>\n${imports}${indent}${props_declaration}\n</script>\n\n`);
					added_legacy_import = true;
				}
			}
		}

		if (state.needs_run && !added_legacy_import) {
			if (parsed.instance) {
				str.appendRight(
					/** @type {number} */ (parsed.instance.content.start),
					`\n${indent}${run_import}\n`
				);
			} else {
				str.prepend(`<script>\n${indent}${run_import}\n</script>\n\n`);
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
 *  scope: import('../phases/scope.js').Scope;
 *  str: MagicString;
 *  analysis: import('../phases/types.js').ComponentAnalysis;
 *  indent: string;
 *  props: Array<{ local: string; exported: string; init: string; bindable: boolean; slot_name?: string; optional: boolean; type: string; comment?: string }>;
 *  props_insertion_point: number;
 *  has_props_rune: boolean;
 * 	props_name: string;
 * 	rest_props_name: string;
 *  end: number;
 *  run_name: string;
 *  needs_run: boolean;
 * }} State
 */

/** @type {import('zimmerframe').Visitors<import('../types/template.js').SvelteNode, State>} */
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

				const binding = /** @type {import('#compiler').Binding} */ (
					state.scope.get(declarator.id.name)
				);

				if (
					state.analysis.uses_props &&
					(declarator.init || binding.mutated || binding.reassigned)
				) {
					throw new Error(
						'$$props is used together with named props in a way that cannot be automatically migrated.'
					);
				}

				state.props.push({
					local: declarator.id.name,
					exported: binding.prop_alias ? binding.prop_alias : declarator.id.name,
					init: declarator.init
						? state.str.original.substring(
								/** @type {number} */ (declarator.init.start),
								/** @type {number} */ (declarator.init.end)
							)
						: '',
					optional: !!declarator.init,
					bindable: binding.mutated || binding.reassigned,
					...extract_type_and_comment(declarator, state.str, path)
				});
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
				state.str.prependLeft(/** @type {number} */ (declarator.init.start), '$state(');
				state.str.appendRight(/** @type {number} */ (declarator.init.end), ')');
			} else {
				state.str.prependLeft(/** @type {number} */ (declarator.id.end), ' = $state()');
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
				// $derived
				state.str.update(
					/** @type {number} */ (node.start),
					/** @type {number} */ (node.body.expression.start),
					'let '
				);
				state.str.prependLeft(
					/** @type {number} */ (node.body.expression.right.start),
					'$derived('
				);
				if (node.body.expression.right.end !== node.end) {
					state.str.update(
						/** @type {number} */ (node.body.expression.right.end),
						/** @type {number} */ (node.end),
						');'
					);
				} else {
					state.str.appendRight(/** @type {number} */ (node.end), ');');
				}
				return;
			} else {
				for (const binding of reassigned_bindings) {
					if (binding && ids.includes(binding.node)) {
						// implicitly-declared variable which we need to make explicit
						state.str.prependLeft(
							/** @type {number} */ (node.start),
							`let ${binding.node.name}${binding.kind === 'state' ? ' = $state()' : ''};\n${state.indent}`
						);
					}
				}
			}
		}

		state.needs_run = true;
		const is_block_stmt = node.body.type === 'BlockStatement';
		const start_end = /** @type {number} */ (node.body.start);
		// TODO try to find out if we can use $derived.by instead?
		if (is_block_stmt) {
			state.str.update(
				/** @type {number} */ (node.start),
				start_end + 1,
				`${state.run_name}(() => {`
			);
			const end = /** @type {number} */ (node.body.end);
			state.str.update(end - 1, end, '});');
		} else {
			state.str.update(
				/** @type {number} */ (node.start),
				start_end,
				`${state.run_name}(() => {\n${state.indent}`
			);
			state.str.indent(state.indent, {
				exclude: [
					[0, /** @type {number} */ (node.body.start)],
					[/** @type {number} */ (node.body.end), state.end]
				]
			});
			state.str.appendRight(/** @type {number} */ (node.end), `\n${state.indent}});`);
		}
	}
};

/** @type {import('zimmerframe').Visitors<import('../types/template.js').SvelteNode, State>} */
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
					const value =
						attr.value !== true
							? state.str.original.substring(
									attr.value[0].start,
									attr.value[attr.value.length - 1].end
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
 * @param {import('estree').VariableDeclarator} declarator
 * @param {MagicString} str
 * @param {import('#compiler').SvelteNode[]} path
 */
function extract_type_and_comment(declarator, str, path) {
	const parent = path.at(-1);

	// Try to find jsdoc above the declaration
	let comment_node = /** @type {import('estree').Node} */ (parent)?.leadingComments?.at(-1);
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
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement | import('#compiler').SvelteWindow | import('#compiler').SvelteDocument | import('#compiler').SvelteBody} node
 * @param {State} state
 */
function handle_events(node, state) {
	/** @type {Map<string, import('#compiler').OnDirective[]>} */
	const handlers = new Map();
	for (const attribute of node.attributes) {
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
		// turn on:click into a prop
		let exported = name;
		if (!regex_is_valid_identifier.test(name)) {
			exported = `'${exported}'`;
		}
		// Check if prop already set, could happen when on:click on different elements
		let local = state.props.find((prop) => prop.exported === exported)?.local;

		const last = nodes[nodes.length - 1];
		const payload_name =
			last.expression?.type === 'ArrowFunctionExpression' &&
			last.expression.params[0]?.type === 'Identifier'
				? last.expression.params[0].name
				: generate_event_name(last, state);
		let prepend = '';

		for (let i = 0; i < nodes.length - 1; i += 1) {
			const node = nodes[i];
			if (node.expression) {
				let body = '';
				if (node.expression.type === 'ArrowFunctionExpression') {
					body = state.str.original.substring(
						/** @type {number} */ (node.expression.body.start),
						/** @type {number} */ (node.expression.body.end)
					);
				} else {
					body = `${state.str.original.substring(
						/** @type {number} */ (node.expression.start),
						/** @type {number} */ (node.expression.end)
					)}();`;
				}
				// TODO check how many indents needed
				for (const modifier of node.modifiers) {
					if (modifier === 'stopPropagation') {
						body = `\n${state.indent}${payload_name}.stopPropagation();\n${body}`;
					} else if (modifier === 'preventDefault') {
						body = `\n${state.indent}${payload_name}.preventDefault();\n${body}`;
					} else if (modifier === 'stopImmediatePropagation') {
						body = `\n${state.indent}${payload_name}.stopImmediatePropagation();\n${body}`;
					} else {
						body = `\n${state.indent}// @migration-task: incorporate ${modifier} modifier\n${body}`;
					}
				}
				prepend += `\n${state.indent}${body}\n`;
			} else {
				if (!local) {
					local = state.scope.generate(`on${node.name}`);
					state.props.push({
						local,
						exported,
						init: '',
						bindable: false,
						optional: true,
						type: '(event: any) => void'
					});
				}
				prepend += `\n${state.indent}${local}?.(${payload_name});\n`;
			}

			state.str.remove(node.start, node.end);
		}

		if (last.expression) {
			// remove : from on:click
			state.str.remove(last.start + 2, last.start + 3);
			// remove modifiers
			if (last.modifiers.length > 0) {
				state.str.remove(
					last.start + last.name.length + 3,
					state.str.original.indexOf('=', last.start)
				);
			}
			if (last.modifiers.includes('capture')) {
				state.str.appendRight(last.start + last.name.length + 3, 'capture');
			}

			for (const modifier of last.modifiers) {
				if (modifier === 'stopPropagation') {
					prepend += `\n${state.indent}${payload_name}.stopPropagation();\n`;
				} else if (modifier === 'preventDefault') {
					prepend += `\n${state.indent}${payload_name}.preventDefault();\n`;
				} else if (modifier === 'stopImmediatePropagation') {
					prepend += `\n${state.indent}${payload_name}.stopImmediatePropagation();\n`;
				} else if (modifier !== 'capture') {
					prepend += `\n${state.indent}// @migration-task: incorporate ${modifier} modifier\n`;
				}
			}

			if (prepend) {
				let pos = last.expression.start;
				if (last.expression.type === 'ArrowFunctionExpression') {
					pos = last.expression.body.start;
					if (
						last.expression.params.length > 0 &&
						last.expression.params[0].type !== 'Identifier'
					) {
						const start = /** @type {number} */ (last.expression.params[0].start);
						const end = /** @type {number} */ (last.expression.params[0].end);
						// replace event payload with generated one that others use,
						// then destructure generated payload param into what the user wrote
						state.str.overwrite(start, end, payload_name);
						prepend = `let ${state.str.original.substring(
							start,
							end
						)} = ${payload_name};\n${prepend}`;
					} else if (last.expression.params.length === 0) {
						// add generated payload param to arrow function
						const pos = state.str.original.lastIndexOf(')', last.expression.body.start);
						state.str.prependLeft(pos, payload_name);
					}

					const needs_curlies = last.expression.body.type !== 'BlockStatement';
					const end = /** @type {number} */ (last.expression.body.end) - (needs_curlies ? 0 : 1);
					pos = /** @type {number} */ (pos) + (needs_curlies ? 0 : 1);
					if (needs_curlies && state.str.original[pos - 1] === '(') {
						// Prettier does something like on:click={() => (foo = true)}, we need to remove the braces in this case
						state.str.update(pos - 1, pos, `{${prepend}${state.indent}`);
						state.str.update(end, end + 1, '\n}');
					} else {
						state.str.prependRight(pos, `${needs_curlies ? '{' : ''}${prepend}${state.indent}`);
						state.str.appendRight(end, `\n${needs_curlies ? '}' : ''}`);
					}
				} else {
					state.str.update(
						/** @type {number} */ (last.expression.start),
						/** @type {number} */ (last.expression.end),
						`(${payload_name}) => {${prepend}\n${state.indent}${state.str.original.substring(
							/** @type {number} */ (last.expression.start),
							/** @type {number} */ (last.expression.end)
						)}?.(${payload_name});\n}`
					);
				}
			}
		} else {
			// turn on:click into a prop
			// Check if prop already set, could happen when on:click on different elements
			if (!local) {
				local = state.scope.generate(`on${last.name}`);
				state.props.push({
					local,
					exported,
					init: '',
					bindable: false,
					optional: true,
					type: '(event: any) => void'
				});
			}

			let replacement = '';
			if (!prepend) {
				if (exported === local) {
					replacement = `{${name}}`;
				} else {
					replacement = `${name}={${local}}`;
				}
			} else {
				replacement = `${name}={(${payload_name}) => {${prepend}\n${state.indent}${local}?.(${payload_name});\n}}`;
			}

			state.str.update(last.start, last.end, replacement);
		}
	}
}

/**
 * @param {import('#compiler').OnDirective} last
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
 * @param {import('estree').Identifier} node
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
		}
		// else passed as identifier, we don't know what to do here, so let it error
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
