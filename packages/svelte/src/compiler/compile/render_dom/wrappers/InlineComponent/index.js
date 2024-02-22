import { b, p, x } from 'code-red';
import { extract_ignores_above_node } from '../../../../utils/extract_svelte_ignore.js';
import { sanitize } from '../../../../utils/names.js';
import { namespaces } from '../../../../utils/namespaces.js';
import compiler_warnings from '../../../compiler_warnings.js';
import add_to_set from '../../../utils/add_to_set.js';
import { string_to_member_expression } from '../../../utils/string_to_member_expression.js';
import BindingWrapper from '../Element/Binding.js';
import EventHandler from '../Element/EventHandler.js';
import SlotTemplateWrapper from '../SlotTemplate.js';
import Wrapper from '../shared/Wrapper.js';
import bind_this from '../shared/bind_this.js';
import is_dynamic from '../shared/is_dynamic.js';
import { is_head } from '../shared/is_head.js';
import mark_each_block_bindings from '../shared/mark_each_block_bindings.js';

const regex_invalid_variable_identifier_characters = /[^a-zA-Z_$]/g;

/** @extends Wrapper<import('../../../nodes/InlineComponent.js').default> */
export default class InlineComponentWrapper extends Wrapper {
	/**
	 * @typedef {{
	 * 	block: import('../../Block.js').default;
	 * 	scope: import('../../../nodes/shared/TemplateScope.js').default;
	 * 	get_context?: import('estree').Node;
	 * 	get_changes?: import('estree').Node;
	 * }} SlotDefinition
	 */

	/** @type {Map<string, SlotDefinition>} */
	slots = new Map();

	/** @type {import('../Fragment.js').default} */
	fragment;

	/** @type {Array<Wrapper | import('../Fragment.js').default>} */
	children = [];

	/**
	 * @param {import('../../Renderer.js').default} renderer
	 * @param {import('../../Block.js').default} block
	 * @param {import('../shared/Wrapper.js').default} parent
	 * @param {import('../../../nodes/InlineComponent.js').default} node
	 * @param {boolean} strip_whitespace
	 * @param {import('../shared/Wrapper.js').default} next_sibling
	 */
	constructor(renderer, block, parent, node, strip_whitespace, next_sibling) {
		super(renderer, block, parent, node);
		if (this.node.expression) {
			block.add_dependencies(this.node.expression.dependencies);
		}
		this.node.attributes.forEach((attr) => {
			block.add_dependencies(attr.dependencies);
		});
		this.node.bindings.forEach((binding) => {
			if (binding.is_contextual) {
				mark_each_block_bindings(this, binding);
			}
			block.add_dependencies(binding.expression.dependencies);
		});
		this.node.handlers.forEach((handler) => {
			if (handler.expression) {
				block.add_dependencies(handler.expression.dependencies);
			}
		});
		this.node.css_custom_properties.forEach((attr) => {
			block.add_dependencies(attr.dependencies);
		});
		this.var = {
			type: /** @type {const} */ ('Identifier'),
			name: (this.node.name === 'svelte:self'
				? renderer.component.name.name
				: this.node.name === 'svelte:component'
				? 'switch_instance'
				: sanitize(this.node.name)
			).toLowerCase()
		};
		if (this.node.children.length) {
			this.children = this.node.children.map(
				(child) =>
					new SlotTemplateWrapper(
						renderer,
						block,
						this,
						/** @type {import('../../../nodes/SlotTemplate.js').default} */ (child),
						strip_whitespace,
						next_sibling
					)
			);
		}
		block.add_outro();
	}

	/**
	 * @param {string} name
	 * @param {SlotDefinition} slot_definition
	 */
	set_slot(name, slot_definition) {
		if (this.slots.has(name)) {
			if (name === 'default') {
				throw new Error('Found elements without slot attribute when using slot="default"');
			}
			throw new Error(`Duplicate slot name "${name}" in <${this.node.name}>`);
		}
		this.slots.set(name, slot_definition);
	}
	warn_if_reactive() {
		let { name } = this.node;
		const top = name.split('.')[0]; // <T.foo/> etc. should check for T instead of "T.foo"
		const variable = this.renderer.component.var_lookup.get(top);
		if (!variable) {
			return;
		}
		const ignores = extract_ignores_above_node(this.node);
		this.renderer.component.push_ignores(ignores);
		if (
			variable.reassigned ||
			variable.export_name || // or a prop
			variable.mutated
		) {
			this.renderer.component.warn(this.node, compiler_warnings.reactive_component(name));
		}
		this.renderer.component.pop_ignores();
	}

	/**
	 * @param {import('../../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier} parent_nodes
	 */
	render(block, parent_node, parent_nodes) {
		this.warn_if_reactive();
		const { renderer } = this;
		const { component } = renderer;
		const name = this.var;
		block.add_variable(name);
		const component_opts = /** @type {import('estree').ObjectExpression} */ (x`{}`);

		/** @type {Array<import('estree').Node | import('estree').Node[]>} */
		const statements = [];

		/** @type {Array<import('estree').Node | import('estree').Node[]>} */
		const updates = [];
		this.children.forEach((child) => {
			this.renderer.add_to_context('$$scope', true);
			child.render(block, null, /** @type {import('estree').Identifier} */ (x`#nodes`));
		});

		/** @type {import('estree').Identifier | undefined} */
		let props;
		const name_changes = block.get_unique_name(`${name.name}_changes`);
		const uses_spread = !!this.node.attributes.find((a) => a.is_spread);
		// removing empty slot
		for (const slot of this.slots.keys()) {
			if (!this.slots.get(slot).block.has_content()) {
				this.renderer.remove_block(this.slots.get(slot).block);
				this.slots.delete(slot);
			}
		}
		const has_css_custom_properties = this.node.css_custom_properties.length > 0;
		const is_svg_namespace = this.node.namespace === namespaces.svg;
		const css_custom_properties_wrapper_element = is_svg_namespace ? 'g' : 'div';
		const css_custom_properties_wrapper = has_css_custom_properties
			? block.get_unique_name(css_custom_properties_wrapper_element)
			: null;
		if (has_css_custom_properties) {
			block.add_variable(css_custom_properties_wrapper);
		}
		const initial_props =
			this.slots.size > 0
				? [
						p`$$slots: {
					${Array.from(this.slots).map(([name, slot]) => {
						return p`${name}: [${slot.block.name}, ${slot.get_context || null}, ${
							slot.get_changes || null
						}]`;
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
				${this.node.attributes.map((attr) => p`${attr.name}: ${attr.get_value(block)}`)},
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
		this.slots.forEach((slot) => {
			slot.block.dependencies.forEach((name) => {
				const is_let = slot.scope.is_let(name);
				const variable = renderer.component.var_lookup.get(name);
				if (is_let || is_dynamic(variable)) fragment_dependencies.add(name);
			});
		});
		const dynamic_attributes = this.node.attributes.filter((a) => a.get_dependencies().length > 0);
		if (
			!uses_spread &&
			(dynamic_attributes.length > 0 ||
				this.node.bindings.length > 0 ||
				fragment_dependencies.size > 0)
		) {
			updates.push(b`const ${name_changes} = {};`);
		}
		if (this.node.attributes.length) {
			if (uses_spread) {
				const levels = block.get_unique_name(`${this.var.name}_spread_levels`);
				const initial_props = [];
				const changes = [];

				/** @type {Set<string>} */
				const all_dependencies = new Set();
				this.node.attributes.forEach((attr) => {
					add_to_set(all_dependencies, attr.dependencies);
				});
				this.node.attributes.forEach((attr, i) => {
					const { name, dependencies } = attr;
					const condition =
						dependencies.size > 0 && dependencies.size !== all_dependencies.size
							? renderer.dirty(Array.from(dependencies))
							: null;
					const unchanged = dependencies.size === 0;

					/** @type {import('estree').Node | ReturnType<typeof x>} */
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
					if (this.node.name === 'svelte:component') {
						// statements will become switch_props function body
						// rewrite last statement, add props update logic
						statements[statements.length - 1] = b`
							for (let #i = 0; #i < ${levels}.length; #i += 1) {
								${props} = @assign(${props}, ${levels}[#i]);
							}
							if (#dirty !== undefined && ${condition}) {
								${props} = @assign(${props}, @get_spread_update(${levels}, [
									${changes}
								]));
							}
						`;
					}
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
				dynamic_attributes.forEach((attribute) => {
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
		const munged_bindings = this.node.bindings.map((binding) => {
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
				}`);
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

			/** @type {import('estree').Identifier[]} */
			const params = [/** @type {import('estree').Identifier} */ (x`#value`)];
			const args = [x`#value`];
			if (contextual_dependencies.length > 0) {
				contextual_dependencies.forEach((name) => {
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
		const munged_handlers = this.node.handlers.map((handler) => {
			const event_handler = new EventHandler(handler, this);
			let snippet = event_handler.get_snippet(block);
			if (handler.modifiers.has('once')) snippet = x`@once(${snippet})`;
			return b`${name}.$on("${handler.name}", ${snippet});`;
		});
		const mount_target = has_css_custom_properties
			? css_custom_properties_wrapper
			: parent_node || '#target';
		const mount_anchor = has_css_custom_properties ? 'null' : parent_node ? 'null' : '#anchor';
		const to_claim = parent_nodes && this.renderer.options.hydratable;
		let claim_nodes = parent_nodes;
		if (this.node.name === 'svelte:component') {
			const switch_value = block.get_unique_name('switch_value');
			const switch_props = block.get_unique_name('switch_props');
			const snippet = this.node.expression.manipulate(block);
			const dependencies = this.node.expression.dynamic_dependencies();
			if (has_css_custom_properties) {
				this.set_css_custom_properties(
					block,
					css_custom_properties_wrapper,
					css_custom_properties_wrapper_element,
					is_svg_namespace
				);
			}
			block.chunks.init.push(b`
				var ${switch_value} = ${snippet};

				function ${switch_props}(#ctx, #dirty) {
					${
						(this.node.attributes.length > 0 || this.node.bindings.length > 0) &&
						b`
					${props && b`let ${props} = ${attribute_object};`}`
					}
					${statements}
					return ${component_opts};
				}

				if (${switch_value}) {
					${name} = @construct_svelte_component(${switch_value}, ${switch_props}(#ctx));

					${munged_bindings}
					${munged_handlers}
				}
			`);
			block.chunks.create.push(b`if (${name}) @create_component(${name}.$$.fragment);`);
			if (css_custom_properties_wrapper)
				this.create_css_custom_properties_wrapper_mount_chunk(
					block,
					parent_node,
					css_custom_properties_wrapper
				);
			block.chunks.mount.push(
				b`if (${name}) @mount_component(${name}, ${mount_target}, ${mount_anchor});`
			);
			if (to_claim) {
				if (css_custom_properties_wrapper)
					claim_nodes = this.create_css_custom_properties_wrapper_claim_chunk(
						block,
						claim_nodes,
						css_custom_properties_wrapper,
						css_custom_properties_wrapper_element,
						is_svg_namespace
					);
				block.chunks.claim.push(
					b`if (${name}) @claim_component(${name}.$$.fragment, ${claim_nodes});`
				);
			}
			const tmp_anchor = this.get_or_create_anchor(block, parent_node, parent_nodes);
			const anchor = has_css_custom_properties ? 'null' : tmp_anchor;
			const update_mount_node = has_css_custom_properties
				? css_custom_properties_wrapper
				: this.get_update_mount_node(tmp_anchor);
			const update_insert =
				css_custom_properties_wrapper &&
				(tmp_anchor.name !== 'null'
					? b`@insert(${tmp_anchor}.parentNode, ${css_custom_properties_wrapper}, ${tmp_anchor});`
					: b`@insert(${parent_node}, ${css_custom_properties_wrapper}, ${tmp_anchor});`);
			let update_condition = x`${switch_value} !== (${switch_value} = ${snippet})`;
			if (dependencies.length > 0) {
				update_condition = x`${block.renderer.dirty(dependencies)} && ${update_condition}`;
			}
			block.chunks.update.push(b`
				if (${update_condition}) {
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
						${name} = @construct_svelte_component(${switch_value}, ${switch_props}(#ctx, #dirty));

						${munged_bindings}
						${munged_handlers}

						@create_component(${name}.$$.fragment);
						@transition_in(${name}.$$.fragment, 1);
						@mount_component(${name}, ${update_mount_node}, ${anchor});
					} else {
						${name} = null;
					}
				} else if (${switch_value}) {
					${updates}
					${updates.length > 0 && b`${name}.$set(${name_changes});`}
				}
			`);
			block.chunks.intro.push(b`
				if (${name}) @transition_in(${name}.$$.fragment, #local);
			`);
			block.chunks.outro.push(b`if (${name}) @transition_out(${name}.$$.fragment, #local);`);
			block.chunks.destroy.push(
				b`if (${name}) @destroy_component(${name}, ${parent_node ? null : 'detaching'});`
			);
		} else {
			const expression =
				this.node.name === 'svelte:self'
					? component.name
					: this.renderer.reference(string_to_member_expression(this.node.name));
			block.chunks.init.push(b`
				${
					(this.node.attributes.length > 0 || this.node.bindings.length > 0) &&
					b`
				${props && b`let ${props} = ${attribute_object};`}`
				}
				${statements}
				${name} = new ${expression}(${component_opts});

				${munged_bindings}
				${munged_handlers}
			`);
			if (has_css_custom_properties) {
				this.set_css_custom_properties(
					block,
					css_custom_properties_wrapper,
					css_custom_properties_wrapper_element,
					is_svg_namespace
				);
			}
			block.chunks.create.push(b`@create_component(${name}.$$.fragment);`);
			if (css_custom_properties_wrapper)
				this.create_css_custom_properties_wrapper_mount_chunk(
					block,
					parent_node,
					css_custom_properties_wrapper
				);
			block.chunks.mount.push(b`@mount_component(${name}, ${mount_target}, ${mount_anchor});`);
			if (to_claim) {
				if (css_custom_properties_wrapper)
					claim_nodes = this.create_css_custom_properties_wrapper_claim_chunk(
						block,
						claim_nodes,
						css_custom_properties_wrapper,
						css_custom_properties_wrapper_element,
						is_svg_namespace
					);
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
			block.chunks.outro.push(b`@transition_out(${name}.$$.fragment, #local);`);
		}
	}

	/**
	 * @private
	 * @param {import('../../Block.js').default} block
	 * @param {import('estree').Identifier} parent_node
	 * @param {import('estree').Identifier | null} css_custom_properties_wrapper
	 */
	create_css_custom_properties_wrapper_mount_chunk(
		block,
		parent_node,
		css_custom_properties_wrapper
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
			block.chunks.destroy.push(
				b`if (detaching && ${this.var}) @detach(${css_custom_properties_wrapper});`
			);
		}
	}

	/**
	 * @private
	 * @param {import('../../Block.js').default} block
	 * @param {import('estree').Identifier} parent_nodes
	 * @param {import('estree').Identifier | null} css_custom_properties_wrapper
	 * @param {string} css_custom_properties_wrapper_element
	 * @param {boolean} is_svg_namespace
	 */
	create_css_custom_properties_wrapper_claim_chunk(
		block,
		parent_nodes,
		css_custom_properties_wrapper,
		css_custom_properties_wrapper_element,
		is_svg_namespace
	) {
		const nodes = block.get_unique_name(`${css_custom_properties_wrapper.name}_nodes`);
		const claim_element = is_svg_namespace ? x`@claim_svg_element` : x`@claim_element`;
		block.chunks.claim.push(b`
			${css_custom_properties_wrapper} = ${claim_element}(${parent_nodes}, "${css_custom_properties_wrapper_element.toUpperCase()}", { style: true })
			var ${nodes} = @children(${css_custom_properties_wrapper});
		`);
		return nodes;
	}

	/**
	 * @private
	 * @param {import('../../Block.js').default} block
	 * @param {import('estree').Identifier} css_custom_properties_wrapper
	 * @param {string} css_custom_properties_wrapper_element
	 * @param {boolean} is_svg_namespace
	 */
	set_css_custom_properties(
		block,
		css_custom_properties_wrapper,
		css_custom_properties_wrapper_element,
		is_svg_namespace
	) {
		const element = is_svg_namespace ? x`@svg_element` : x`@element`;
		block.chunks.create.push(
			b`${css_custom_properties_wrapper} = ${element}("${css_custom_properties_wrapper_element}");`
		);
		if (!is_svg_namespace)
			block.chunks.hydrate.push(
				b`@set_style(${css_custom_properties_wrapper}, "display", "contents");`
			);
		this.node.css_custom_properties.forEach((attr) => {
			const dependencies = attr.get_dependencies();
			const should_cache = attr.should_cache();
			const last =
				should_cache &&
				block.get_unique_name(
					`${attr.name.replace(regex_invalid_variable_identifier_characters, '_')}_last`
				);
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
