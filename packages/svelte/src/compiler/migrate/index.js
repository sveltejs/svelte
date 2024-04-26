import MagicString from 'magic-string';
import { walk } from 'zimmerframe';
import { parse } from '../phases/1-parse/index.js';
import { analyze_component } from '../phases/2-analyze/index.js';
import { validate_component_options } from '../validate-options.js';
import { get_rune } from '../phases/scope.js';
import { reset_warnings } from '../warnings.js';
import { extract_identifiers } from '../utils/ast.js';
import { regex_is_valid_identifier } from '../phases/patterns.js';

/**
 * Does a best-effort migration of Svelte code towards using runes, event attributes and render tags.
 * @param {string} source
 * @returns {string}
 */
export function migrate(source) {
	try {
		reset_warnings({ source, filename: 'migrate.svelte' });

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
			props_insertion_point: 0,
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
					.join(', ');

				if (analysis.uses_rest_props) {
					props += `, ...${state.rest_props_name}`;
				}
			}

			if (state.has_props_rune) {
				// some render tags or forwarded event attributes to add
				str.appendRight(state.props_insertion_point, ` ${props},`);
			} else {
				const props_declaration = `let { ${props} } = $props();`;
				if (parsed.instance) {
					if (state.props_insertion_point === 0) {
						// no regular props found, but render tags or events to forward found, $props() will be first in the script tag
						str.appendRight(
							/** @type {number} */ (parsed.instance.content.start),
							`\n${indent}${props_declaration}`
						);
					} else {
						str.appendRight(state.props_insertion_point, props_declaration);
					}
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

		return str.toString();
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
 *  props: Array<{ local: string; exported: string; init: string; bindable: boolean }>;
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
	Identifier(node, { state }) {
		handle_identifier(node, state);
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

			const bindings = state.scope.get_bindings(declarator);
			const has_state = bindings.some((binding) => binding.kind === 'state');
			const has_props = bindings.some((binding) => binding.kind === 'bindable_prop');

			if (!has_state && !has_props) {
				continue;
			}

			if (has_props) {
				nr_of_props++;

				if (declarator.id.type !== 'Identifier') {
					// TODO
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
					continue;
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
					bindable: binding.mutated || binding.reassigned
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
			state.str.update(start, end, '');
		}
	},
	LabeledStatement(node, { path, state }) {
		if (state.analysis.runes) return;
		if (path.length > 1) return;
		if (node.label.name !== '$') return;

		if (
			node.body.type === 'ExpressionStatement' &&
			node.body.expression.type === 'AssignmentExpression'
		) {
			const ids = extract_identifiers(node.body.expression.left);
			const reassigned_ids = ids.filter((id) => state.scope.get(id.name)?.reassigned);
			if (reassigned_ids.length === 0) {
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
				state.str.update(
					/** @type {number} */ (node.body.expression.right.end),
					/** @type {number} */ (node.end),
					');'
				);
				return;
			} else {
				for (const id of reassigned_ids) {
					const binding = state.scope.get(id.name);
					if (binding?.node === id) {
						// implicitly-declared variable which we need to make explicit
						state.str.prependLeft(
							/** @type {number} */ (node.start),
							`let ${id.name}${binding.kind === 'state' ? ' = $state()' : ''};\n${state.indent}`
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
	Identifier(node, { state }) {
		handle_identifier(node, state);
	},
	RegularElement(node, { state, next }) {
		handle_events(node, state);
		next();
	},
	SvelteElement(node, { state, next }) {
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
		let slot_props = '{ ';

		for (const attr of node.attributes) {
			if (attr.type === 'SpreadAttribute') {
				slot_props += `...${state.str.original.substring(/** @type {number} */ (attr.expression.start), attr.expression.end)}, `;
			} else if (attr.type === 'Attribute') {
				if (attr.name === 'name') {
					name = /** @type {any} */ (attr.value)[0].data;
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

		state.props.push({
			local: name,
			exported: name,
			init: '',
			bindable: false
		});

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
	}
};

/**
 * @param {import('#compiler').RegularElement | import('#compiler').SvelteElement | import('#compiler').SvelteWindow | import('#compiler').SvelteDocument | import('#compiler').SvelteBody} node
 * @param {State} state
 */
function handle_events(node, state) {
	/** @type {Map<string, import('#compiler').OnDirective[]>} */
	const handlers = new Map();
	for (const attribute of node.attributes) {
		if (attribute.type !== 'OnDirective') continue;

		const nodes = handlers.get(attribute.name) || [];
		nodes.push(attribute);
		handlers.set(attribute.name, nodes);
	}

	for (const [name, nodes] of handlers) {
		// turn on:click into a prop
		let exported = `on${name}`;
		if (!regex_is_valid_identifier.test(name)) {
			exported = `'${name}'`;
		}
		// Check if prop already set, could happen when on:click on different elements
		let local = state.props.find((prop) => prop.exported === exported)?.local;

		const last = nodes[nodes.length - 1];
		const payload_name =
			last.expression?.type === 'ArrowFunctionExpression' &&
			last.expression.params[0]?.type === 'Identifier'
				? last.expression.params[0].name
				: state.scope.generate('payload');
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
				prepend += `\n${state.indent}${body}\n`;
			} else {
				if (!local) {
					local = state.scope.generate(`on${node.name}`);
					state.props.push({
						local,
						exported,
						init: '',
						bindable: false
					});
				}
				prepend += `\n${state.indent}${local}?.(${payload_name});\n`;
			}

			state.str.remove(node.start, node.end);
		}

		if (last.expression) {
			// remove : from on:click
			state.str.update(last.start, last.start + 3, 'on');
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
					state.str.prependRight(
						/** @type {number} */ (pos),
						`${needs_curlies ? '{' : ''}${prepend}${state.indent}`
					);
					state.str.appendRight(
						/** @type {number} */ (last.expression.body.end),
						`\n${needs_curlies ? '}' : ''}`
					);
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
					bindable: false
				});
			}

			const event_name = `on${name}`;
			let replacement = '';
			if (!prepend) {
				if (exported === local) {
					replacement = `{${event_name}}`;
				} else {
					replacement = `${event_name}={${local}}`;
				}
			} else {
				replacement = `${event_name}={(${payload_name}) => {${prepend}\n${state.indent}${local}?.(${payload_name});\n}}`;
			}

			state.str.update(last.start, last.end, replacement);
		}
	}
}

/**
 * @param {import('estree').Identifier} node
 * @param {State} state
 */
function handle_identifier(node, state) {
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
