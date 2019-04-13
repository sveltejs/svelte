import deindent from '../utils/deindent';
import { stringify, escape } from '../utils/stringify';
import CodeBuilder from '../utils/CodeBuilder';
import Component from '../Component';
import Renderer from './Renderer';
import { CompileOptions } from '../../interfaces';
import { walk } from 'estree-walker';
import { stringify_props } from '../utils/stringify_props';
import add_to_set from '../utils/add_to_set';
import get_object from '../utils/get_object';
import { extract_names } from '../utils/scope';
import { nodes_match } from '../../utils/nodes_match';

export default function dom(
	component: Component,
	options: CompileOptions
) {
	const { name, code } = component;

	const renderer = new Renderer(component, options);
	const { block } = renderer;

	block.has_outro_method = true;

	// prevent fragment being created twice (#1063)
	if (options.customElement) block.builders.create.add_line(`this.c = @noop;`);

	const builder = new CodeBuilder();

	if (component.compile_options.dev) {
		builder.add_line(`const ${renderer.file_var} = ${JSON.stringify(component.file)};`);
	}

	const css = component.stylesheet.render(options.filename, !options.customElement);
	const styles = component.stylesheet.has_styles && stringify(options.dev ?
		`${css.code}\n/*# sourceMappingURL=${css.map.toUrl()} */` :
		css.code, { only_escape_at_symbol: true });

	if (styles && component.compile_options.css !== false && !options.customElement) {
		builder.add_block(deindent`
			function @add_css() {
				var style = @element("style");
				style.id = '${component.stylesheet.id}-style';
				style.textContent = ${styles};
				@append(document.head, style);
			}
		`);
	}

	// fix order
	// TODO the deconflicted names of blocks are reversed... should set them here
	const blocks = renderer.blocks.slice().reverse();

	blocks.forEach(block => {
		builder.add_block(block.toString());
	});

	if (options.dev && !options.hydratable) {
		block.builders.claim.add_line(
			'throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");'
		);
	}

	// TODO injecting CSS this way is kinda dirty. Maybe it should be an
	// explicit opt-in, or something?
	const should_add_css = (
		!options.customElement &&
		component.stylesheet.has_styles &&
		options.css !== false
	);

	const uses_props = component.var_lookup.has('$$props');
	const $$props = uses_props ? `$$new_props` : `$$props`;
	const props = component.vars.filter(variable => !variable.module && variable.export_name);
	const writable_props = props.filter(variable => variable.writable);

	const set = (uses_props || writable_props.length > 0 || renderer.slots.size > 0)
		? deindent`
			${$$props} => {
				${uses_props && component.invalidate('$$props', `$$props = @assign(@assign({}, $$props), $$new_props)`)}
				${writable_props.map(prop =>
				`if ('${prop.export_name}' in $$props) ${component.invalidate(prop.name, `${prop.name} = $$props.${prop.export_name}`)};`
				)}
				${renderer.slots.size > 0 &&
				`if ('$$scope' in ${$$props}) ${component.invalidate('$$scope', `$$scope = ${$$props}.$$scope`)};`}
			}
		`
		: null;

	const body = [];

	const not_equal = component.component_options.immutable ? `@not_equal` : `@safe_not_equal`;
	let dev_props_check;

	props.forEach(x => {
		const variable = component.var_lookup.get(x.name);

		if (!variable.writable || component.component_options.accessors) {
			body.push(deindent`
				get ${x.export_name}() {
					return ${x.hoistable ? x.name : 'this.$$.ctx.' + x.name};
				}
			`);
		} else if (component.compile_options.dev) {
			body.push(deindent`
				get ${x.export_name}() {
					throw new Error("<${component.tag}>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
				}
			`);
		}

		if (component.component_options.accessors) {
			if (variable.writable && !renderer.readonly.has(x.name)) {
				body.push(deindent`
					set ${x.export_name}(${x.name}) {
						this.$set({ ${x.name === x.export_name ? x.name : `${x.export_name}: ${x.name}`} });
						@flush();
					}
				`);
			} else if (component.compile_options.dev) {
				body.push(deindent`
					set ${x.export_name}(value) {
						throw new Error("<${component.tag}>: Cannot set read-only property '${x.export_name}'");
					}
				`);
			}
		} else if (component.compile_options.dev) {
			body.push(deindent`
				set ${x.export_name}(value) {
					throw new Error("<${component.tag}>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
				}
			`);
		}
	});

	if (component.compile_options.dev) {
		// TODO check no uunexpected props were passed, as well as
		// checking that expected ones were passed
		const expected = props.filter(prop => !prop.initialised);

		if (expected.length) {
			dev_props_check = deindent`
				const { ctx } = this.$$;
				const props = ${options.customElement ? `this.attributes` : `options.props || {}`};
				${expected.map(prop => deindent`
				if (ctx.${prop.name} === undefined && !('${prop.export_name}' in props)) {
					console.warn("<${component.tag}> was created without expected prop '${prop.export_name}'");
				}`)}
			`;
		}
	}

	// instrument assignments
	if (component.ast.instance) {
		let scope = component.instance_scope;
		let map = component.instance_scope_map;

		let pending_assignments = new Set();

		walk(component.ast.instance.content, {
			enter: (node, parent) => {
				if (map.has(node)) {
					scope = map.get(node);
				}
			},

			leave(node, parent) {
				if (map.has(node)) {
					scope = scope.parent;
				}

				if (node.type === 'AssignmentExpression') {
					let names = [];

					if (node.left.type === 'MemberExpression') {
						const left_object_name = get_object(node.left).name;
						left_object_name && (names = [left_object_name]);
					} else {
						names = extract_names(node.left);
					}

					if (node.operator === '=' && nodes_match(node.left, node.right)) {
						const dirty = names.filter(name => {
							return scope.find_owner(name) === component.instance_scope;
						});

						if (dirty.length) component.has_reactive_assignments = true;

						code.overwrite(node.start, node.end, dirty.map(n => component.invalidate(n)).join('; '));
					} else {
						const single = (
							node.left.type === 'Identifier' &&
							parent.type === 'ExpressionStatement' &&
							node.left.name[0] !== '$'
						);

						names.forEach(name => {
							const owner = scope.find_owner(name);
							if (owner && owner !== component.instance_scope) return;

							const variable = component.var_lookup.get(name);
							if (variable && (variable.hoistable || variable.global || variable.module)) return;

							if (single) {
								code.prependRight(node.start, `$$invalidate('${name}', `);
								code.appendLeft(node.end, `)`);
							} else {
								pending_assignments.add(name);
							}

							component.has_reactive_assignments = true;
						});
					}
				}

				else if (node.type === 'UpdateExpression') {
					const { name } = get_object(node.argument);

					if (scope.find_owner(name) !== component.instance_scope) return;

					const variable = component.var_lookup.get(name);
					if (variable && variable.hoistable) return;

					pending_assignments.add(name);
					component.has_reactive_assignments = true;
				}

				if (pending_assignments.size > 0) {
					if (node.type === 'ArrowFunctionExpression') {
						const insert = Array.from(pending_assignments).map(name => component.invalidate(name)).join('; ');
						pending_assignments = new Set();

						code.prependRight(node.body.start, `{ const $$result = `);
						code.appendLeft(node.body.end, `; ${insert}; return $$result; }`);

						pending_assignments = new Set();
					}

					else if (/Statement/.test(node.type)) {
						const insert = Array.from(pending_assignments).map(name => component.invalidate(name)).join('; ');

						if (/^(Break|Continue|Return)Statement/.test(node.type)) {
							if (node.argument) {
								code.overwrite(node.start, node.argument.start, `var $$result = `);
								code.appendLeft(node.argument.end, `; ${insert}; return $$result`);
							} else {
								code.prependRight(node.start, `${insert}; `);
							}
						} else if (parent && /(If|For(In|Of)?|While)Statement/.test(parent.type) && node.type !== 'BlockStatement') {
							code.prependRight(node.start, '{ ');
							code.appendLeft(node.end, `${code.original[node.end - 1] === ';' ? '' : ';'} ${insert}; }`);
						} else {
							code.appendLeft(node.end, `${code.original[node.end - 1] === ';' ? '' : ';'} ${insert};`);
						}

						pending_assignments = new Set();
					}
				}
			}
		});

		if (pending_assignments.size > 0) {
			throw new Error(`TODO this should not happen!`);
		}

		component.rewrite_props(({ name, reassigned }) => {
			const value = `$${name}`;

			const callback = `$value => { ${value} = $$value; $$invalidate('${value}', ${value}) }`;

			if (reassigned) {
				return `$$subscribe_${name}()`;
			}

			const subscribe = component.helper('subscribe');

			let insert = `${subscribe}($$self, ${name}, $${callback})`;
			if (component.compile_options.dev) {
				const validate_store = component.helper('validate_store');
				insert = `${validate_store}(${name}, '${name}'); ${insert}`;
			}

			return insert;
		});
	}

	const args = ['$$self'];
	if (props.length > 0 || component.has_reactive_assignments || renderer.slots.size > 0) {
		args.push('$$props', '$$invalidate');
	}

	builder.add_block(deindent`
		function create_fragment(ctx) {
			${block.get_contents()}
		}

		${component.module_javascript}

		${component.fully_hoisted.length > 0 && component.fully_hoisted.join('\n\n')}
	`);

	const filtered_declarations = component.vars
		.filter(v => ((v.referenced || v.export_name) && !v.hoistable))
		.map(v => v.name);

	if (uses_props) filtered_declarations.push(`$$props: $$props = ${component.helper('exclude_internal_props')}($$props)`);

	const filtered_props = props.filter(prop => {
		const variable = component.var_lookup.get(prop.name);

		if (variable.hoistable) return false;
		if (prop.name[0] === '$') return false;
		return true;
	});

	const reactive_stores = component.vars.filter(variable => variable.name[0] === '$' && variable.name[1] !== '$');

	if (renderer.slots.size > 0) {
		filtered_declarations.push('$$slots', '$$scope');
	}

	if (renderer.binding_groups.length > 0) {
		filtered_declarations.push(`$$binding_groups`);
	}

	const has_definition = (
		component.javascript ||
		filtered_props.length > 0 ||
		uses_props ||
		component.partly_hoisted.length > 0 ||
		filtered_declarations.length > 0 ||
		component.reactive_declarations.length > 0
	);

	const definition = has_definition
		? component.alias('instance')
		: 'null';

	const all_reactive_dependencies = new Set();
	component.reactive_declarations.forEach(d => {
		add_to_set(all_reactive_dependencies, d.dependencies);
	});

	const reactive_store_subscriptions = reactive_stores
		.filter(store => {
			const variable = component.var_lookup.get(store.name.slice(1));
			return !variable || variable.hoistable;
		})
		.map(({ name }) => deindent`
			${component.compile_options.dev && `@validate_store(${name.slice(1)}, '${name.slice(1)}');`}
			@subscribe($$self, ${name.slice(1)}, $$value => { ${name} = $$value; $$invalidate('${name}', ${name}); });
		`);

	const resubscribable_reactive_store_unsubscribers = reactive_stores
		.filter(store => {
			const variable = component.var_lookup.get(store.name.slice(1));
			return variable && variable.reassigned;
		})
		.map(({ name }) => `$$self.$$.on_destroy.push(() => $$unsubscribe_${name.slice(1)}());`);

	if (has_definition) {
		const reactive_declarations = [];
		const fixed_reactive_declarations = []; // not really 'reactive' but whatever

		component.reactive_declarations
			.forEach(d => {
				let uses_props;

				const condition = Array.from(d.dependencies)
					.filter(n => {
						if (n === '$$props') {
							uses_props = true;
							return false;
						}

						const variable = component.var_lookup.get(n);
						return variable && variable.writable;
					})
					.map(n => `$$dirty.${n}`).join(' || ');

				let snippet = `[✂${d.node.body.start}-${d.node.end}✂]`;
				if (condition) snippet = `if (${condition}) { ${snippet} }`;

				if (condition || uses_props) {
					reactive_declarations.push(snippet);
				} else {
					fixed_reactive_declarations.push(snippet);
				}
			});

		const injected = Array.from(component.injected_reactive_declaration_vars).filter(name => {
			const variable = component.var_lookup.get(name);
			return variable.injected && variable.name[0] !== '$';
		});

		const reactive_store_declarations = reactive_stores.map(variable => {
			const $name = variable.name;
			const name = $name.slice(1);

			const store = component.var_lookup.get(name);
			if (store && store.reassigned) {
				return `${$name}, $$unsubscribe_${name} = @noop, $$subscribe_${name} = () => { $$unsubscribe_${name}(); $$unsubscribe_${name} = ${name}.subscribe($$value => { ${$name} = $$value; $$invalidate('${$name}', ${$name}); }) }`
			}

			return $name;
		});

		builder.add_block(deindent`
			function ${definition}(${args.join(', ')}) {
				${reactive_store_declarations.length > 0 && `let ${reactive_store_declarations.join(', ')};`}

				${reactive_store_subscriptions}

				${resubscribable_reactive_store_unsubscribers}

				${component.javascript}

				${renderer.slots.size && `let { $$slots = {}, $$scope } = $$props;`}

				${renderer.binding_groups.length > 0 && `const $$binding_groups = [${renderer.binding_groups.map(_ => `[]`).join(', ')}];`}

				${component.partly_hoisted.length > 0 && component.partly_hoisted.join('\n\n')}

				${set && `$$self.$set = ${set};`}

				${reactive_declarations.length > 0 && deindent`
				${injected.length && `let ${injected.join(', ')};`}
				$$self.$$.update = ($$dirty = { ${Array.from(all_reactive_dependencies).map(n => `${n}: 1`).join(', ')} }) => {
					${reactive_declarations}
				};

				${fixed_reactive_declarations}
				`}

				return ${stringify_props(filtered_declarations)};
			}
		`);
	}

	const prop_names = `[${props.map(v => JSON.stringify(v.export_name)).join(', ')}]`;

	if (options.customElement) {
		builder.add_block(deindent`
			class ${name} extends @SvelteElement {
				constructor(options) {
					super();

					${css.code && `this.shadowRoot.innerHTML = \`<style>${escape(css.code, { only_escape_at_symbol: true }).replace(/\\/g, '\\\\')}${options.dev ? `\n/*# sourceMappingURL=${css.map.toUrl()} */` : ''}</style>\`;`}

					@init(this, { target: this.shadowRoot }, ${definition}, create_fragment, ${not_equal}, ${prop_names});

					${dev_props_check}

					if (options) {
						if (options.target) {
							@insert(options.target, this, options.anchor);
						}

						${(props.length > 0 || uses_props) && deindent`
						if (options.props) {
							this.$set(options.props);
							@flush();
						}`}
					}
				}

				static get observedAttributes() {
					return ${JSON.stringify(props.map(x => x.export_name))};
				}

				${body.length > 0 && body.join('\n\n')}
			}

			customElements.define("${component.tag}", ${name});
		`);
	} else {
		const superclass = options.dev ? 'SvelteComponentDev' : 'SvelteComponent';

		builder.add_block(deindent`
			class ${name} extends @${superclass} {
				constructor(options) {
					super(${options.dev && `options`});
					${should_add_css && `if (!document.getElementById("${component.stylesheet.id}-style")) @add_css();`}
					@init(this, options, ${definition}, create_fragment, ${not_equal}, ${prop_names});

					${dev_props_check}
				}

				${body.length > 0 && body.join('\n\n')}
			}
		`);
	}

	return builder.toString();
}
