import Wrapper from '../shared/Wrapper';
import Renderer from '../../Renderer';
import Block from '../../Block';
import InlineComponent from '../../../nodes/InlineComponent';
import FragmentWrapper from '../Fragment';
import { sanitize } from '../../../../utils/names';
import add_to_set from '../../../utils/add_to_set';
import { b, x, p } from 'code-red';
import Attribute from '../../../nodes/Attribute';
import get_object from '../../../utils/get_object';
import create_debugging_comment from '../shared/create_debugging_comment';
import { get_slot_definition } from '../shared/get_slot_definition';
import EachBlock from '../../../nodes/EachBlock';
import TemplateScope from '../../../nodes/shared/TemplateScope';
import is_dynamic from '../shared/is_dynamic';
import bind_this from '../shared/bind_this';
import { Node, Identifier, ObjectExpression } from 'estree';
import EventHandler from '../Element/EventHandler';
import { extract_names } from 'periscopic';

export default class InlineComponentWrapper extends Wrapper {
	var: Identifier;
	slots: Map<string, { block: Block; scope: TemplateScope; get_context?: Node; get_changes?: Node }> = new Map();
	node: InlineComponent;
	fragment: FragmentWrapper;

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
				// we need to ensure that the each block creates a context including
				// the list and the index, if they're not otherwise referenced
				const { name } = get_object(binding.expression.node);
				const each_block = this.node.scope.get_owner(name);

				(each_block as EachBlock).has_binding = true;
			}

			block.add_dependencies(binding.expression.dependencies);
		});

		this.node.handlers.forEach(handler => {
			if (handler.expression) {
				block.add_dependencies(handler.expression.dependencies);
			}
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

			const default_slot = block.child({
				comment: create_debugging_comment(node, renderer.component),
				name: renderer.component.get_unique_name(`create_default_slot`),
				type: 'slot'
			});

			this.renderer.blocks.push(default_slot);

			this.slots.set('default', get_slot_definition(default_slot, this.node.scope, this.node.lets));
			this.fragment = new FragmentWrapper(renderer, default_slot, node.children, this, strip_whitespace, next_sibling);

			const dependencies: Set<string> = new Set();

			// TODO is this filtering necessary? (I *think* so)
			default_slot.dependencies.forEach(name => {
				if (!this.node.scope.is_let(name)) {
					dependencies.add(name);
				}
			});

			block.add_dependencies(dependencies);
		}

		block.add_outro();
	}

	render(
		block: Block,
		parent_node: Identifier,
		parent_nodes: Identifier
	) {
		const { renderer } = this;
		const { component } = renderer;

		const name = this.var;

		const component_opts = x`{}` as ObjectExpression;

		const statements: Array<Node | Node[]> = [];
		const updates: Array<Node | Node[]> = [];

		let props;
		const name_changes = block.get_unique_name(`${name.name}_changes`);

		const uses_spread = !!this.node.attributes.find(a => a.is_spread);

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

		if (this.fragment) {
			this.renderer.add_to_context('$$scope', true);
			const default_slot = this.slots.get('default');

			this.fragment.nodes.forEach((child) => {
				child.render(default_slot.block, null, x`#nodes` as unknown as Identifier);
			});
		}

		if (component.compile_options.dev) {
			// TODO this is a terrible hack, but without it the component
			// will complain that options.target is missing. This would
			// work better if components had separate public and private
			// APIs
			component_opts.properties.push(p`$$inline: true`);
		}

		const fragment_dependencies = new Set(this.fragment ? ['$$scope'] : []);
		this.slots.forEach(slot => {
			slot.block.dependencies.forEach(name => {
				const is_let = slot.scope.is_let(name);
				const variable = renderer.component.var_lookup.get(name);

				if (is_let || is_dynamic(variable)) fragment_dependencies.add(name);
			});
		});

		const non_let_dependencies = Array.from(fragment_dependencies).filter(name => !this.node.scope.is_let(name));

		const dynamic_attributes = this.node.attributes.filter(a => a.get_dependencies().length > 0);

		if (!uses_spread && (dynamic_attributes.length > 0 || this.node.bindings.length > 0 || non_let_dependencies.length > 0)) {
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

					if (attr.is_spread) {
						const value = attr.expression.manipulate(block);
						initial_props.push(value);

						let value_object = value;
						if (attr.expression.node.type !== 'ObjectExpression') {
							value_object = x`@get_spread_object(${value})`;
						}
						changes.push(condition ? x`${condition} && ${value_object}` : value_object);
					} else {
						const obj = x`{ ${name}: ${attr.get_value(block)} }`;
						initial_props.push(obj);

						changes.push(condition ? x`${condition} && ${obj}` : x`${levels}[${i}]`);
					}
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

		if (non_let_dependencies.length > 0) {
			updates.push(b`
				if (${renderer.dirty(non_let_dependencies)}) {
					${name_changes}.$$scope = { dirty: #dirty, ctx: #ctx };
				}`);
		}

		const munged_bindings = this.node.bindings.map(binding => {
			component.has_reactive_assignments = true;

			if (binding.name === 'this') {
				return bind_this(component, block, binding, this.var);
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

			const value = block.get_unique_name('value');
			const params: any[] = [value];
			if (contextual_dependencies.length > 0) {
				const args = [];

				contextual_dependencies.forEach(name => {
					params.push({
						type: 'Identifier',
						name
					});

					renderer.add_to_context(name, true);
					args.push(renderer.reference(name));
				});


				block.chunks.init.push(b`
					function ${id}(${value}) {
						${callee}.call(null, ${value}, ${args});
					}
				`);

				block.maintain_context = true; // TODO put this somewhere more logical
			} else {
				block.chunks.init.push(b`
					function ${id}(${value}) {
						${callee}.call(null, ${value});
					}
				`);
			}

			const body = b`
				function ${id}(${params}) {
					${lhs} = ${value};
					${renderer.invalidate(dependencies[0])};
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

		if (this.node.name === 'svelte:component') {
			const switch_value = block.get_unique_name('switch_value');
			const switch_props = block.get_unique_name('switch_props');

			const snippet = this.node.expression.manipulate(block);

			block.chunks.init.push(b`
				var ${switch_value} = ${snippet};

				function ${switch_props}(#ctx) {
					${(this.node.attributes.length > 0 || this.node.bindings.length > 0) && b`
					${props && b`let ${props} = ${attribute_object};`}`}
					${statements}
					return ${component_opts};
				}

				if (${switch_value}) {
					var ${name} = new ${switch_value}(${switch_props}(#ctx));

					${munged_bindings}
					${munged_handlers}
				}
			`);

			block.chunks.create.push(
				b`if (${name}) @create_component(${name}.$$.fragment);`
			);

			if (parent_nodes && this.renderer.options.hydratable) {
				block.chunks.claim.push(
					b`if (${name}) @claim_component(${name}.$$.fragment, ${parent_nodes});`
				);
			}

			block.chunks.mount.push(b`
				if (${name}) {
					@mount_component(${name}, ${parent_node || '#target'}, ${parent_node ? 'null' : 'anchor'});
				}
			`);

			const anchor = this.get_or_create_anchor(block, parent_node, parent_nodes);
			const update_mount_node = this.get_update_mount_node(anchor);

			if (updates.length) {
				block.chunks.update.push(b`
					${updates}
				`);
			}

			block.chunks.update.push(b`
				if (${switch_value} !== (${switch_value} = ${snippet})) {
					if (${name}) {
						@group_outros();
						const old_component = ${name};
						@transition_out(old_component.$$.fragment, 1, 0, () => {
							@destroy_component(old_component, 1);
						});
						@check_outros();
					}

					if (${switch_value}) {
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
					${updates.length && b`${name}.$set(${name_changes});`}
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
				: this.renderer.reference(this.node.name);

			block.chunks.init.push(b`
				${(this.node.attributes.length > 0 || this.node.bindings.length > 0) && b`
				${props && b`let ${props} = ${attribute_object};`}`}
				${statements}
				const ${name} = new ${expression}(${component_opts});

				${munged_bindings}
				${munged_handlers}
			`);

			block.chunks.create.push(b`@create_component(${name}.$$.fragment);`);

			if (parent_nodes && this.renderer.options.hydratable) {
				block.chunks.claim.push(
					b`@claim_component(${name}.$$.fragment, ${parent_nodes});`
				);
			}

			block.chunks.mount.push(
				b`@mount_component(${name}, ${parent_node || '#target'}, ${parent_node ? 'null' : 'anchor'});`
			);

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
}
