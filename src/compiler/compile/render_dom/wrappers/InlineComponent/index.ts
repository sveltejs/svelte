import Wrapper from '../shared/Wrapper';
import BindingWrapper from '../Element/Binding';
import Renderer from '../../Renderer';
import Block from '../../Block';
import InlineComponent from '../../../nodes/InlineComponent';
import FragmentWrapper from '../Fragment';
import SlotTemplateWrapper from '../SlotTemplate';
import { sanitize } from '../../../../utils/names';
import add_to_set from '../../../utils/add_to_set';
import { b, x, p } from 'code-red';
import Attribute from '../../../nodes/Attribute';
import TemplateScope from '../../../nodes/shared/TemplateScope';
import is_dynamic from '../shared/is_dynamic';
import bind_this from '../shared/bind_this';
import { Node, Identifier, ObjectExpression } from 'estree';
import EventHandler from '../Element/EventHandler';
import { extract_names } from 'periscopic';
import mark_each_block_bindings from '../shared/mark_each_block_bindings';
import { string_to_member_expression } from '../../../utils/string_to_member_expression';
import SlotTemplate from '../../../nodes/SlotTemplate';
import { is_head } from '../shared/is_head';
import compiler_warnings from '../../../compiler_warnings';

type SlotDefinition = { block: Block; scope: TemplateScope; get_context?: Node; get_changes?: Node };

export default class InlineComponentWrapper extends Wrapper {
	var: Identifier;
	slots: Map<string, SlotDefinition> = new Map();
	node: InlineComponent;
	fragment: FragmentWrapper;
	children: Array<Wrapper | FragmentWrapper> = [];

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: InlineComponent,
		strip_whitespace: boolean,
		next_sibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.cannot_use_innerhtml();
		this.not_static_content();

		if (this.node.expression) {
			block.add_dependencies(this.node.expression.dependencies);
		}

		this.node.attributes.forEach(attr => {
			block.add_dependencies(attr.dependencies);
		});

		this.node.bindings.forEach(binding => {
			if (binding.is_contextual) {
				mark_each_block_bindings(this, binding);
			}

			block.add_dependencies(binding.expression.dependencies);
		});

		this.node.handlers.forEach(handler => {
			if (handler.expression) {
				block.add_dependencies(handler.expression.dependencies);
			}
		});

		this.node.css_custom_properties.forEach(attr => {
			block.add_dependencies(attr.dependencies);
		});

		this.var = {
			type: 'Identifier',
			name: (
				this.node.name === 'svelte:self' ? renderer.component.name.name :
					this.node.name === 'svelte:component' ? 'switch_instance' :
						sanitize(this.node.name)
			).toLowerCase()
		};

		if (this.node.children.length) {
			this.node.lets.forEach(l => {
				extract_names(l.value || l.name).forEach(name => {
					renderer.add_to_context(name, true);
				});
			});

			this.children = this.node.children.map(child => new SlotTemplateWrapper(renderer, block, this, child as SlotTemplate, strip_whitespace, next_sibling));
		}

		block.add_outro();
	}

	set_slot(name: string, slot_definition: SlotDefinition) {
		if (this.slots.has(name)) {
			if (name === 'default') {
				throw new Error('Found elements without slot attribute when using slot="default"');
			}
			throw new Error(`Duplicate slot name "${name}" in <${this.node.name}>`);
		}
		this.slots.set(name, slot_definition);
	}

	warn_if_reactive() {
		const { name } = this.node;
		const variable = this.renderer.component.var_lookup.get(name);
		if (!variable) {
			return;
		}

		if (variable.reassigned || variable.export_name || variable.is_reactive_dependency) {
			this.renderer.component.warn(this.node, compiler_warnings.reactive_component(name));
		}
	}

	render(
		block: Block,
		parent_node: Identifier,
		parent_nodes: Identifier
	) {
		this.warn_if_reactive();

		const { renderer } = this;
		const { component } = renderer;

		const name = this.var;
		block.add_variable(name);

		const component_opts = x`{}` as ObjectExpression;

		const statements: Array<Node | Node[]> = [];
		const updates: Array<Node | Node[]> = [];

		this.children.forEach((child) => {
			this.renderer.add_to_context('$$scope', true);
			child.render(block, null, x`#nodes` as Identifier);
		});

		let props;
		const name_changes = block.get_unique_name(`${name.name}_changes`);

		const uses_spread = !!this.node.attributes.find(a => a.is_spread);

		// removing empty slot
		for (const slot of this.slots.keys()) {
			if (!this.slots.get(slot).block.has_content()) {
				this.renderer.remove_block(this.slots.get(slot).block);
				this.slots.delete(slot);
			}
		}

		const has_css_custom_properties = this.node.css_custom_properties.length > 0;
		const css_custom_properties_wrapper = has_css_custom_properties ? block.get_unique_name('div') : null;
		if (has_css_custom_properties) {
			block.add_variable(css_custom_properties_wrapper);
		}

		const initial_props = this.slots.size > 0
			? [
				p`$$slots: {
					${Array.from(this.slots).map(([name, slot]) => {
						return p`${name}: [${slot.block.name}, ${slot.get_context || null}, ${slot.get_changes || null}]`;
					})}
				}`,
				p`$$scope: {
					ctx: #ctx
				}`
			]
			: [];

		const attribute_object = uses_spread
			? x`{ ${initial_props} }`
			: x`{
				${this.node.attributes.map(attr => p`${attr.name}: ${attr.get_value(block)}`)},
				${initial_props}
			}`;

		if (this.node.attributes.length || this.node.bindings.length || initial_props.length) {
			if (!uses_spread && this.node.bindings.length === 0) {
				component_opts.properties.push(p`props: ${attribute_object}`);
			} else {
				props = block.get_unique_name(`${name.name}_props`);
				component_opts.properties.push(p`props: ${props}`);
			}
		}

		if (component.compile_options.dev) {
			// TODO this is a terrible hack, but without it the component
			// will complain that options.target is missing. This would
			// work better if components had separate public and private
			// APIs
			component_opts.properties.push(p`$$inline: true`);
		}

		const fragment_dependencies = new Set(this.slots.size ? ['$$scope'] : []);
		this.slots.forEach(slot => {
			slot.block.dependencies.forEach(name => {
				const is_let = slot.scope.is_let(name);
				const variable = renderer.component.var_lookup.get(name);

				if (is_let || is_dynamic(variable)) fragment_dependencies.add(name);
			});
		});

		const dynamic_attributes = this.node.attributes.filter(a => a.get_dependencies().length > 0);

		if (!uses_spread && (dynamic_attributes.length > 0 || this.node.bindings.length > 0 || fragment_dependencies.size > 0)) {
			updates.push(b`const ${name_changes} = {};`);
		}

		if (this.node.attributes.length) {
			if (uses_spread) {
				const levels = block.get_unique_name(`${this.var.name}_spread_levels`);

				const initial_props = [];
				const changes = [];

				const all_dependencies: Set<string> = new Set();

				this.node.attributes.forEach(attr => {
					add_to_set(all_dependencies, attr.dependencies);
				});

				this.node.attributes.forEach((attr, i) => {
					const { name, dependencies } = attr;

					const condition = dependencies.size > 0 && (dependencies.size !== all_dependencies.size)
						? renderer.dirty(Array.from(dependencies))
						: null;
					const unchanged = dependencies.size === 0;

					let change_object;
					if (attr.is_spread) {
						const value = attr.expression.manipulate(block);
						initial_props.push(value);

						let value_object = value;
						if (attr.expression.node.type !== 'ObjectExpression') {
							value_object = x`@get_spread_object(${value})`;
						}
						change_object = value_object;
					} else {
						const obj = x`{ ${name}: ${attr.get_value(block)} }`;
						initial_props.push(obj);
						change_object = obj;
					}

					changes.push(
						unchanged
							? x`${levels}[${i}]`
							: condition
							? x`${condition} && ${change_object}`
							: change_object
					);
				});

				block.chunks.init.push(b`
					const ${levels} = [
						${initial_props}
					];
				`);

				statements.push(b`
					for (let #i = 0; #i < ${levels}.length; #i += 1) {
						${props} = @assign(${props}, ${levels}[#i]);
					}
				`);

				if (all_dependencies.size) {
					const condition = renderer.dirty(Array.from(all_dependencies));

					updates.push(b`
						const ${name_changes} = ${condition} ? @get_spread_update(${levels}, [
							${changes}
						]) : {}
					`);
				} else {
					updates.push(b`
						const ${name_changes} = {};
					`);
				}
			} else {
				dynamic_attributes.forEach((attribute: Attribute) => {
					const dependencies = attribute.get_dependencies();
					if (dependencies.length > 0) {
						const condition = renderer.dirty(dependencies);

						updates.push(b`
							if (${condition}) ${name_changes}.${attribute.name} = ${attribute.get_value(block)};
						`);
					}
				});
			}
		}

		if (fragment_dependencies.size > 0) {
			updates.push(b`
				if (${renderer.dirty(Array.from(fragment_dependencies))}) {
					${name_changes}.$$scope = { dirty: #dirty, ctx: #ctx };
				}`);
		}

		const munged_bindings = this.node.bindings.map(binding => {
			component.has_reactive_assignments = true;

			if (binding.name === 'this') {
				return bind_this(component, block, new BindingWrapper(block, binding, this), this.var);
			}

			const id = component.get_unique_name(`${this.var.name}_${binding.name}_binding`);
			renderer.add_to_context(id.name);
			const callee = renderer.reference(id);

			const updating = block.get_unique_name(`updating_${binding.name}`);
			block.add_variable(updating);

			const snippet = binding.expression.manipulate(block);

			statements.push(b`
				if (${snippet} !== void 0) {
					${props}.${binding.name} = ${snippet};
				}`
			);

			updates.push(b`
				if (!${updating} && ${renderer.dirty(Array.from(binding.expression.dependencies))}) {
					${updating} = true;
					${name_changes}.${binding.name} = ${snippet};
					@add_flush_callback(() => ${updating} = false);
				}
			`);

			const contextual_dependencies = Array.from(binding.expression.contextual_dependencies);
			const dependencies = Array.from(binding.expression.dependencies);

			let lhs = binding.raw_expression;

			if (binding.is_contextual && binding.expression.node.type === 'Identifier') {
				// bind:x={y} — we can't just do `y = x`, we need to
				// to `array[index] = x;
				const { name } = binding.expression.node;
				const { object, property, snippet } = block.bindings.get(name);
				lhs = snippet;
				contextual_dependencies.push(object.name, property.name);
			}

			const params: Identifier[] = [x`#value` as Identifier];
			const args = [x`#value`];
			if (contextual_dependencies.length > 0) {

				contextual_dependencies.forEach(name => {
					params.push({
						type: 'Identifier',
						name
					});

					renderer.add_to_context(name, true);
					args.push(renderer.reference(name));
				});


				block.maintain_context = true; // TODO put this somewhere more logical
			}

			block.chunks.init.push(b`
				function ${id}(#value) {
					${callee}(${args});
				}
			`);

			let invalidate_binding = b`
				${lhs} = #value;
				${renderer.invalidate(dependencies[0])};
			`;
			if (binding.expression.node.type === 'MemberExpression') {
				invalidate_binding = b`
					if ($$self.$$.not_equal(${lhs}, #value)) {
						${invalidate_binding}
					}
				`;
			}

			const body = b`
				function ${id}(${params}) {
					${invalidate_binding}
				}
			`;

			component.partly_hoisted.push(body);

			return b`@binding_callbacks.push(() => @bind(${this.var}, '${binding.name}', ${id}));`;
		});

		const munged_handlers = this.node.handlers.map(handler => {
			const event_handler = new EventHandler(handler, this);
			let snippet = event_handler.get_snippet(block);
			if (handler.modifiers.has('once')) snippet = x`@once(${snippet})`;

			return b`${name}.$on("${handler.name}", ${snippet});`;
		});

		const mount_target = has_css_custom_properties ? css_custom_properties_wrapper : (parent_node || '#target');
		const mount_anchor = has_css_custom_properties ? 'null' : (parent_node ? 'null' : '#anchor');
		const to_claim = parent_nodes && this.renderer.options.hydratable;
		let claim_nodes = parent_nodes;

		if (this.node.name === 'svelte:component') {
			const switch_value = block.get_unique_name('switch_value');
			const switch_props = block.get_unique_name('switch_props');

			const snippet = this.node.expression.manipulate(block);

			if (has_css_custom_properties) {
				this.set_css_custom_properties(block, css_custom_properties_wrapper);
			}

			block.chunks.init.push(b`
				var ${switch_value} = ${snippet};

				function ${switch_props}(#ctx) {
					${(this.node.attributes.length > 0 || this.node.bindings.length > 0) && b`
					${props && b`let ${props} = ${attribute_object};`}`}
					${statements}
					return ${component_opts};
				}

				if (${switch_value}) {
					${name} = new ${switch_value}(${switch_props}(#ctx));

					${munged_bindings}
					${munged_handlers}
				}
			`);

			block.chunks.create.push(
				b`if (${name}) @create_component(${name}.$$.fragment);`
			);

			if (css_custom_properties_wrapper) this.create_css_custom_properties_wrapper_mount_chunk(block, parent_node, css_custom_properties_wrapper);
			block.chunks.mount.push(b`if (${name}) @mount_component(${name}, ${mount_target}, ${mount_anchor});`);

			if (to_claim) {
				if (css_custom_properties_wrapper) claim_nodes = this.create_css_custom_properties_wrapper_claim_chunk(block, claim_nodes, css_custom_properties_wrapper);
				block.chunks.claim.push(b`if (${name}) @claim_component(${name}.$$.fragment, ${claim_nodes});`);
			}

			if (updates.length) {
				block.chunks.update.push(b`
					${updates}
				`);
			}

			const tmp_anchor = this.get_or_create_anchor(block, parent_node, parent_nodes);
			const anchor = has_css_custom_properties ? 'null' : tmp_anchor;
			const update_mount_node = has_css_custom_properties ? css_custom_properties_wrapper : this.get_update_mount_node(tmp_anchor);
			const update_insert =
				css_custom_properties_wrapper &&
				(tmp_anchor.name !== 'null'
					? b`@insert(${tmp_anchor}.parentNode, ${css_custom_properties_wrapper}, ${tmp_anchor});`
					: b`@insert(${parent_node}, ${css_custom_properties_wrapper}, ${tmp_anchor});`);

			block.chunks.update.push(b`
				if (${switch_value} !== (${switch_value} = ${snippet})) {
					if (${name}) {
						@group_outros();
						const old_component = ${name};
						@transition_out(old_component.$$.fragment, 1, 0, () => {
							@destroy_component(old_component, 1);
							${has_css_custom_properties ? b`@detach(${update_mount_node})` : null}
						});
						@check_outros();
					}

					if (${switch_value}) {
						${update_insert}
						${name} = new ${switch_value}(${switch_props}(#ctx));

						${munged_bindings}
						${munged_handlers}

						@create_component(${name}.$$.fragment);
						@transition_in(${name}.$$.fragment, 1);
						@mount_component(${name}, ${update_mount_node}, ${anchor});
					} else {
						${name} = null;
					}
				} else if (${switch_value}) {
					${updates.length > 0 && b`${name}.$set(${name_changes});`}
				}
			`);

			block.chunks.intro.push(b`
				if (${name}) @transition_in(${name}.$$.fragment, #local);
			`);

			block.chunks.outro.push(
				b`if (${name}) @transition_out(${name}.$$.fragment, #local);`
			);

			block.chunks.destroy.push(b`if (${name}) @destroy_component(${name}, ${parent_node ? null : 'detaching'});`);
		} else {
			const expression = this.node.name === 'svelte:self'
				? component.name
				: this.renderer.reference(string_to_member_expression(this.node.name));

			block.chunks.init.push(b`
				${(this.node.attributes.length > 0 || this.node.bindings.length > 0) && b`
				${props && b`let ${props} = ${attribute_object};`}`}
				${statements}
				${name} = new ${expression}(${component_opts});

				${munged_bindings}
				${munged_handlers}
			`);

			if (has_css_custom_properties) {
				this.set_css_custom_properties(block, css_custom_properties_wrapper);
			}
			block.chunks.create.push(b`@create_component(${name}.$$.fragment);`);

			if (css_custom_properties_wrapper) this.create_css_custom_properties_wrapper_mount_chunk(block, parent_node, css_custom_properties_wrapper);
			block.chunks.mount.push(b`@mount_component(${name}, ${mount_target}, ${mount_anchor});`);

			if (to_claim) {
				if (css_custom_properties_wrapper) claim_nodes = this.create_css_custom_properties_wrapper_claim_chunk(block, claim_nodes, css_custom_properties_wrapper);
				block.chunks.claim.push(b`@claim_component(${name}.$$.fragment, ${claim_nodes});`);
			}

			block.chunks.intro.push(b`
				@transition_in(${name}.$$.fragment, #local);
			`);

			if (updates.length) {
				block.chunks.update.push(b`
					${updates}
					${name}.$set(${name_changes});
				`);
			}

			block.chunks.destroy.push(b`
				@destroy_component(${name}, ${parent_node ? null : 'detaching'});
			`);

			block.chunks.outro.push(
				b`@transition_out(${name}.$$.fragment, #local);`
			);
		}
	}

	private create_css_custom_properties_wrapper_mount_chunk(
		block: Block,
		parent_node: Identifier,
		css_custom_properties_wrapper: Identifier | null
	) {
			if (parent_node) {
				block.chunks.mount.push(b`@append(${parent_node}, ${css_custom_properties_wrapper})`);
				if (is_head(parent_node)) {
					block.chunks.destroy.push(b`@detach(${css_custom_properties_wrapper});`);
				}
			} else {
				block.chunks.mount.push(b`@insert(#target, ${css_custom_properties_wrapper}, #anchor);`);
				// TODO we eventually need to consider what happens to elements
				// that belong to the same outgroup as an outroing element...
				block.chunks.destroy.push(b`if (detaching && ${this.var}) @detach(${css_custom_properties_wrapper});`);
			}
	}

	private create_css_custom_properties_wrapper_claim_chunk(
		block: Block,
		parent_nodes: Identifier,
		css_custom_properties_wrapper: Identifier | null
	) {
		const nodes = block.get_unique_name(`${css_custom_properties_wrapper.name}_nodes`);
		block.chunks.claim.push(b`
			${css_custom_properties_wrapper} = @claim_element(${parent_nodes}, "DIV", { style: true })
			var ${nodes} = @children(${css_custom_properties_wrapper});
		`);
		return nodes;
	}

	private set_css_custom_properties(
		block: Block,
		css_custom_properties_wrapper: Identifier
	) {
		block.chunks.create.push(b`${css_custom_properties_wrapper} = @element("div");`);
		block.chunks.hydrate.push(b`@set_style(${css_custom_properties_wrapper}, "display", "contents");`);
		this.node.css_custom_properties.forEach((attr) => {
			const dependencies = attr.get_dependencies();
			const should_cache = attr.should_cache();
			const last = should_cache &&	block.get_unique_name(`${attr.name.replace(/[^a-zA-Z_$]/g, '_')}_last`);
			if (should_cache) block.add_variable(last);
			const value = attr.get_value(block);
			const init = should_cache ? x`${last} = ${value}` : value;

			block.chunks.hydrate.push(
				b`@set_style(${css_custom_properties_wrapper}, "${attr.name}", ${init});`
			);
			if (dependencies.length > 0) {
				let condition = block.renderer.dirty(dependencies);
				if (should_cache) condition = x`${condition} && (${last} !== (${last} = ${value}))`;
				block.chunks.update.push(b`
					if (${condition}) {
						@set_style(${css_custom_properties_wrapper}, "${attr.name}", ${should_cache ? last : value});
					}
				`);
			}
		});
	}
}
