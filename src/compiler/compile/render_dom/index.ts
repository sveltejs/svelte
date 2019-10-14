import { b, x, p } from 'code-red';
import Component from '../Component';
import Renderer from './Renderer';
import { CompileOptions } from '../../interfaces';
import { walk } from 'estree-walker';
import add_to_set from '../utils/add_to_set';
import { extract_names } from '../utils/scope';
import { invalidate } from '../utils/invalidate';
import Block from './Block';
import { ClassDeclaration, FunctionExpression, Node, Statement } from 'estree';

export default function dom(
	component: Component,
	options: CompileOptions
) {
	const { name } = component;

	const renderer = new Renderer(component, options);
	const { block } = renderer;

	block.has_outro_method = true;

	// prevent fragment being created twice (#1063)
	if (options.customElement) block.chunks.create.push(b`this.c = @noop;`);

	const body = [];

	if (renderer.file_var) {
		const file = component.file ? x`"${component.file}"` : x`undefined`;
		body.push(b`const ${renderer.file_var} = ${file};`);
	}

	const css = component.stylesheet.render(options.filename, !options.customElement);
	const styles = component.stylesheet.has_styles && options.dev
		? `${css.code}\n/*# sourceMappingURL=${css.map.toUrl()} */`
		: css.code;

	const add_css = component.get_unique_name('add_css');

	const should_add_css = (
		!options.customElement &&
		!!styles &&
		options.css !== false
	);

	if (should_add_css) {
		body.push(b`
			function ${add_css}() {
				var style = @element("style");
				style.id = "${component.stylesheet.id}-style";
				style.textContent = "${styles}";
				@append(@_document.head, style);
			}
		`);
	}

	// fix order
	// TODO the deconflicted names of blocks are reversed... should set them here
	const blocks = renderer.blocks.slice().reverse();

	body.push(...blocks.map(block => {
		// TODO this is a horrible mess — renderer.blocks
		// contains a mixture of Blocks and Nodes
		if ((block as Block).render) return (block as Block).render();
		return block;
	}));

	if (options.dev && !options.hydratable) {
		block.chunks.claim.push(
			b`throw new @_Error("options.hydrate only works if the component was compiled with the \`hydratable: true\` option");`
		);
	}

	const uses_props = component.var_lookup.has('$$props');
	const $$props = uses_props ? `$$new_props` : `$$props`;
	const props = component.vars.filter(variable => !variable.module && variable.export_name);
	const writable_props = props.filter(variable => variable.writable);

	/* eslint-disable @typescript-eslint/indent,indent */
	const set = (uses_props || writable_props.length > 0 || component.slots.size > 0)
		? x`
			${$$props} => {
				${uses_props && component.invalidate('$$props', x`$$props = @assign(@assign({}, $$props), $$new_props)`)}
				${writable_props.map(prop =>
					b`if ('${prop.export_name}' in ${$$props}) ${component.invalidate(prop.name, x`${prop.name} = ${$$props}.${prop.export_name}`)};`
				)}
				${component.slots.size > 0 &&
				b`if ('$$scope' in ${$$props}) ${component.invalidate('$$scope', x`$$scope = ${$$props}.$$scope`)};`}
			}
		`
		: null;
	/* eslint-enable @typescript-eslint/indent,indent */

	const accessors = [];

	const not_equal = component.component_options.immutable ? x`@not_equal` : x`@safe_not_equal`;
	let dev_props_check; let inject_state; let capture_state;

	props.forEach(prop => {
		const variable = component.var_lookup.get(prop.name);

		if (!variable.writable || component.component_options.accessors) {
			accessors.push({
				type: 'MethodDefinition',
				kind: 'get',
				key: { type: 'Identifier', name: prop.export_name },
				value: x`function() {
					return ${prop.hoistable ? prop.name : x`this.$$.ctx.${prop.name}`}
				}`
			});
		} else if (component.compile_options.dev) {
			accessors.push({
				type: 'MethodDefinition',
				kind: 'get',
				key: { type: 'Identifier', name: prop.export_name },
				value: x`function() {
					throw new @_Error("<${component.tag}>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
				}`
			});
		}

		if (component.component_options.accessors) {
			if (variable.writable && !renderer.readonly.has(prop.name)) {
				accessors.push({
					type: 'MethodDefinition',
					kind: 'set',
					key: { type: 'Identifier', name: prop.export_name },
					value: x`function(${prop.name}) {
						this.$set({ ${prop.export_name}: ${prop.name} });
						@flush();
					}`
				});
			} else if (component.compile_options.dev) {
				accessors.push({
					type: 'MethodDefinition',
					kind: 'set',
					key: { type: 'Identifier', name: prop.export_name },
					value: x`function(value) {
						throw new @_Error("<${component.tag}>: Cannot set read-only property '${prop.export_name}'");
					}`
				});
			}
		} else if (component.compile_options.dev) {
			accessors.push({
				type: 'MethodDefinition',
				kind: 'set',
				key: { type: 'Identifier', name: prop.export_name },
				value: x`function(value) {
					throw new @_Error("<${component.tag}>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
				}`
			});
		}
	});

	if (component.compile_options.dev) {
		// checking that expected ones were passed
		const expected = props.filter(prop => !prop.initialised);

		if (expected.length) {
			dev_props_check = b`
				const { ctx: #ctx } = this.$$;
				const props = ${options.customElement ? x`this.attributes` : x`options.props || {}`};
				${expected.map(prop => b`
				if (#ctx.${prop.name} === undefined && !('${prop.export_name}' in props)) {
					@_console.warn("<${component.tag}> was created without expected prop '${prop.export_name}'");
				}`)}
			`;
		}

		capture_state = (uses_props || writable_props.length > 0) ? x`
			() => {
				return { ${component.vars.filter(prop => prop.writable).map(prop => p`${prop.name}`)} };
			}
		` : x`
			() => {
				return {};
			}
		`;

		const writable_vars = component.vars.filter(variable => !variable.module && variable.writable);
		inject_state = (uses_props || writable_vars.length > 0) ? x`
			${$$props} => {
				${uses_props && component.invalidate('$$props', x`$$props = @assign(@assign({}, $$props), $$new_props)`)}
				${writable_vars.map(prop => b`
					if ('${prop.name}' in $$props) ${component.invalidate(prop.name, x`${prop.name} = ${$$props}.${prop.name}`)};
				`)}
			}
		` : x`
			${$$props} => {}
		`;
	}

	// instrument assignments
	if (component.ast.instance) {
		let scope = component.instance_scope;
		const map = component.instance_scope_map;

		walk(component.ast.instance.content, {
			enter: (node) => {
				if (map.has(node)) {
					scope = map.get(node);
				}
			},

			leave(node) {
				if (map.has(node)) {
					scope = scope.parent;
				}

				if (node.type === 'AssignmentExpression' || node.type === 'UpdateExpression') {
					const assignee = node.type === 'AssignmentExpression' ? node.left : node.argument;

					// normally (`a = 1`, `b.c = 2`), there'll be a single name
					// (a or b). In destructuring cases (`[d, e] = [e, d]`) there
					// may be more, in which case we need to tack the extra ones
					// onto the initial function call
					const names = new Set(extract_names(assignee));

					this.replace(invalidate(component, scope, node, names));
				}
			}
		});

		component.rewrite_props(({ name, reassigned }) => {
			const value = `$${name}`;

			if (reassigned) {
				return b`${`$$subscribe_${name}`}()`;
			}

			const callback = x`$$value => { $$invalidate('${value}', ${value} = $$value) }`;

			let insert = b`@component_subscribe($$self, ${name}, $${callback})`;
			if (component.compile_options.dev) {
				insert = b`@validate_store(${name}, '${name}'); ${insert}`;
			}

			return insert;
		});
	}

	const args = [x`$$self`];
	if (props.length > 0 || component.has_reactive_assignments || component.slots.size > 0) {
		args.push(x`$$props`, x`$$invalidate`);
	}

	body.push(b`
		function create_fragment(#ctx) {
			${block.get_contents()}
		}

		${component.extract_javascript(component.ast.module)}

		${component.fully_hoisted}
	`);

	const filtered_declarations = component.vars
		.filter(v => ((v.referenced || v.export_name) && !v.hoistable))
		.map(v => p`${v.name}`);

	if (uses_props) filtered_declarations.push(p`$$props: $$props = @exclude_internal_props($$props)`);

	const filtered_props = props.filter(prop => {
		const variable = component.var_lookup.get(prop.name);

		if (variable.hoistable) return false;
		if (prop.name[0] === '$') return false;
		return true;
	});

	const reactive_stores = component.vars.filter(variable => variable.name[0] === '$' && variable.name[1] !== '$');

	if (component.slots.size > 0) {
		filtered_declarations.push(p`$$slots`, p`$$scope`);
	}

	if (renderer.binding_groups.length > 0) {
		filtered_declarations.push(p`$$binding_groups`);
	}

	const instance_javascript = component.extract_javascript(component.ast.instance);

	const has_definition = (
		(instance_javascript && instance_javascript.length > 0) ||
		filtered_props.length > 0 ||
		uses_props ||
		component.partly_hoisted.length > 0 ||
		filtered_declarations.length > 0 ||
		component.reactive_declarations.length > 0
	);

	const definition = has_definition
		? component.alias('instance')
		: { type: 'Literal', value: null };

	const all_reactive_dependencies = new Set();
	component.reactive_declarations.forEach(d => {
		add_to_set(all_reactive_dependencies, d.dependencies);
	});

	const reactive_store_subscriptions = reactive_stores
		.filter(store => {
			const variable = component.var_lookup.get(store.name.slice(1));
			return !variable || variable.hoistable;
		})
		.map(({ name }) => b`
			${component.compile_options.dev && `@validate_store(${name.slice(1)}, '${name.slice(1)}');`}
			@component_subscribe($$self, ${name.slice(1)}, $$value => { ${name} = $$value; $$invalidate('${name}', ${name}); });
		`);

	const resubscribable_reactive_store_unsubscribers = reactive_stores
		.filter(store => {
			const variable = component.var_lookup.get(store.name.slice(1));
			return variable && variable.reassigned;
		})
		.map(({ name }) => b`$$self.$$.on_destroy.push(() => ${`$$unsubscribe_${name.slice(1)}`}());`);

	if (has_definition) {
		const reactive_declarations: (Node | Node[]) = [];
		const fixed_reactive_declarations = []; // not really 'reactive' but whatever

		component.reactive_declarations.forEach(d => {
			const dependencies = Array.from(d.dependencies);
			const uses_props = !!dependencies.find(n => n === '$$props');

			const writable = dependencies.filter(n => {
				const variable = component.var_lookup.get(n);
				return variable && (variable.writable || variable.mutated);
			});

			const condition = !uses_props && writable.length > 0 && (writable
				.map(n => x`#changed.${n}`)
				.reduce((lhs, rhs) => x`${lhs} || ${rhs}`));

			let statement = d.node; // TODO remove label (use d.node.body) if it's not referenced

			if (condition) statement = b`if (${condition}) { ${statement} }`[0] as Statement;

			if (condition || uses_props) {
				reactive_declarations.push(statement);
			} else {
				fixed_reactive_declarations.push(statement);
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
				const unsubscribe = `$$unsubscribe_${name}`;
				const subscribe = `$$subscribe_${name}`;
				return b`let ${$name}, ${unsubscribe} = @noop, ${subscribe} = () => (${unsubscribe}(), ${unsubscribe} = @subscribe(${name}, $$value => { ${$name} = $$value; $$invalidate('${$name}', ${$name}); }), ${name})`;
			}

			return b`let ${$name};`;
		});

		let unknown_props_check;
		if (component.compile_options.dev && !component.var_lookup.has('$$props') && writable_props.length) {
			unknown_props_check = b`
				const writable_props = [${writable_props.map(prop => x`'${prop.export_name}'`)}];
				@_Object.keys($$props).forEach(key => {
					if (!writable_props.includes(key) && !key.startsWith('$$')) @_console.warn(\`<${component.tag}> was created with unknown prop '\${key}'\`);
				});
			`;
		}

		const return_value = {
			type: 'ObjectExpression',
			properties: filtered_declarations
		};

		const reactive_dependencies = {
			type: 'ObjectPattern',
			properties: Array.from(all_reactive_dependencies).map(name => {
				return {
					type: 'Property',
					kind: 'init',
					key: { type: 'Identifier', name },
					value: { type: 'Literal', value: 1 }
				};
			})
		};

		body.push(b`
			function ${definition}(${args}) {
				${reactive_store_declarations}

				${reactive_store_subscriptions}

				${resubscribable_reactive_store_unsubscribers}

				${instance_javascript}

				${unknown_props_check}

				${component.slots.size ? b`let { $$slots = {}, $$scope } = $$props;` : null}

				${renderer.binding_groups.length > 0 && b`const $$binding_groups = [${renderer.binding_groups.map(_ => x`[]`)}];`}

				${component.partly_hoisted}

				${set && b`$$self.$set = ${set};`}

				${capture_state && x`$$self.$capture_state = ${capture_state};`}

				${inject_state && x`$$self.$inject_state = ${inject_state};`}

				${injected.map(name => b`let ${name};`)}

				${reactive_declarations.length > 0 && b`
				$$self.$$.update = (#changed = ${reactive_dependencies}) => {
					${reactive_declarations}
				};
				`}

				${fixed_reactive_declarations}

				return ${return_value};
			}
		`);
	}

	const prop_names = x`[]`;

	// TODO find a more idiomatic way of doing this
	props.forEach(v => {
		(prop_names as any).elements.push({ type: 'Literal', value: v.export_name });
	});

	if (options.customElement) {
		const declaration = b`
			class ${name} extends @SvelteElement {
				constructor(options) {
					super();

					${css.code && b`this.shadowRoot.innerHTML = \`<style>${css.code.replace(/\\/g, '\\\\')}${options.dev ? `\n/*# sourceMappingURL=${css.map.toUrl()} */` : ''}</style>\`;`}

					@init(this, { target: this.shadowRoot }, ${definition}, create_fragment, ${not_equal}, ${prop_names});

					${dev_props_check}

					if (options) {
						if (options.target) {
							@insert(options.target, this, options.anchor);
						}

						${(props.length > 0 || uses_props) && b`
						if (options.props) {
							this.$set(options.props);
							@flush();
						}`}
					}
				}
			}
		`[0] as ClassDeclaration;

		if (props.length > 0) {
			declaration.body.body.push({
				type: 'MethodDefinition',
				kind: 'get',
				static: true,
				computed: false,
				key: { type: 'Identifier', name: 'observedAttributes' },
				value: x`function() {
					return [${props.map(prop => x`"${prop.export_name}"`)}];
				}` as FunctionExpression
			});
		}

		declaration.body.body.push(...accessors);

		body.push(declaration);

		if (component.tag != null) {
			body.push(b`
				@_customElements.define("${component.tag}", ${name});
			`);
		}
	} else {
		const superclass = {
			type: 'Identifier',
			name: options.dev ? '@SvelteComponentDev' : '@SvelteComponent'
		};

		const declaration = b`
			class ${name} extends ${superclass} {
				constructor(options) {
					super(${options.dev && `options`});
					${should_add_css && b`if (!@_document.getElementById("${component.stylesheet.id}-style")) ${add_css}();`}
					@init(this, options, ${definition}, create_fragment, ${not_equal}, ${prop_names});
					${options.dev && b`@dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "${name.name}", options, id: create_fragment.name });`}

					${dev_props_check}
				}
			}
		`[0] as ClassDeclaration;

		declaration.body.body.push(...accessors);

		body.push(declaration);
	}

	return flatten(body, []);
}

function flatten(nodes: any[], target: any[]) {
	for (let i = 0; i < nodes.length; i += 1) {
		const node = nodes[i];
		if (Array.isArray(node)) {
			flatten(node, target);
		} else {
			target.push(node);
		}
	}

	return target;
}
