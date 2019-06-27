import Wrapper from '../shared/Wrapper';
import Renderer from '../../Renderer';
import Block from '../../Block';
import InlineComponent from '../../../nodes/InlineComponent';
import FragmentWrapper from '../Fragment';
import { quote_name_if_necessary, quote_prop_if_necessary, sanitize } from '../../../../utils/names';
import { stringify_props } from '../../../utils/stringify_props';
import add_to_set from '../../../utils/add_to_set';
import deindent from '../../../utils/deindent';
import Attribute from '../../../nodes/Attribute';
import get_object from '../../../utils/get_object';
import create_debugging_comment from '../shared/create_debugging_comment';
import { get_context_merger } from '../shared/get_context_merger';
import EachBlock from '../../../nodes/EachBlock';
import TemplateScope from '../../../nodes/shared/TemplateScope';
import bind_this from '../shared/bind_this';

export default class InlineComponentWrapper extends Wrapper {
	var: string;
	slots: Map<string, { block: Block; scope: TemplateScope; fn?: string }> = new Map();
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

		this.var = (
			this.node.name === 'svelte:self' ? renderer.component.name :
				this.node.name === 'svelte:component' ? 'switch_instance' :
					sanitize(this.node.name)
		).toLowerCase();

		if (this.node.children.length) {
			const default_slot = block.child({
				comment: create_debugging_comment(node, renderer.component),
				name: renderer.component.get_unique_name(`create_default_slot`)
			});

			this.renderer.blocks.push(default_slot);

			const fn = get_context_merger(this.node.lets);

			this.slots.set('default', {
				block: default_slot,
				scope: this.node.scope,
				fn
			});
			this.fragment = new FragmentWrapper(renderer, default_slot, node.children, this, strip_whitespace, next_sibling);

			const dependencies = new Set();

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
		parent_node: string,
		parent_nodes: string
	) {
		const { renderer } = this;
		const { component } = renderer;

		const name = this.var;

		const component_opts = [];

		const statements: string[] = [];
		const updates: string[] = [];

		let props;
		const name_changes = block.get_unique_name(`${name}_changes`);

		const uses_spread = !!this.node.attributes.find(a => a.is_spread);

		const slot_props = Array.from(this.slots).map(([name, slot]) => `${quote_name_if_necessary(name)}: [${slot.block.name}${slot.fn ? `, ${slot.fn}` : ''}]`);

		const initial_props = slot_props.length > 0
			? [`$$slots: ${stringify_props(slot_props)}`, `$$scope: { ctx }`]
			: [];

		const attribute_object = uses_spread
			? stringify_props(initial_props)
			: stringify_props(
				this.node.attributes.map(attr => `${quote_name_if_necessary(attr.name)}: ${attr.get_value(block)}`).concat(initial_props)
			);

		if (this.node.attributes.length || this.node.bindings.length || initial_props.length) {
			if (!uses_spread && this.node.bindings.length === 0) {
				component_opts.push(`props: ${attribute_object}`);
			} else {
				props = block.get_unique_name(`${name}_props`);
				component_opts.push(`props: ${props}`);
			}
		}

		if (this.fragment) {
			const default_slot = this.slots.get('default');

			this.fragment.nodes.forEach((child) => {
				child.render(default_slot.block, null, 'nodes');
			});
		}

		if (component.compile_options.dev) {
			// TODO this is a terrible hack, but without it the component
			// will complain that options.target is missing. This would
			// work better if components had separate public and private
			// APIs
			component_opts.push(`$$inline: true`);
		}

		const fragment_dependencies = new Set(this.fragment ? ['$$scope'] : []);
		this.slots.forEach(slot => {
			slot.block.dependencies.forEach(name => {
				const is_let = slot.scope.is_let(name);
				const variable = renderer.component.var_lookup.get(name);

				if (is_let) fragment_dependencies.add(name);

				if (!variable) return;
				if (variable.mutated || variable.reassigned) fragment_dependencies.add(name);
				if (!variable.module && variable.writable && variable.export_name) fragment_dependencies.add(name);
			});
		});

		const non_let_dependencies = Array.from(fragment_dependencies).filter(name => !this.node.scope.is_let(name));

		if (!uses_spread && (this.node.attributes.filter(a => a.is_dynamic).length || this.node.bindings.length || non_let_dependencies.length > 0)) {
			updates.push(`var ${name_changes} = {};`);
		}

		if (this.node.attributes.length) {
			if (uses_spread) {
				const levels = block.get_unique_name(`${this.var}_spread_levels`);

				const initial_props = [];
				const changes = [];

				const all_dependencies = new Set();

				this.node.attributes.forEach(attr => {
					add_to_set(all_dependencies, attr.dependencies);
				});

				this.node.attributes.forEach(attr => {
					const { name, dependencies } = attr;

					const condition = dependencies.size > 0 && (dependencies.size !== all_dependencies.size)
						? `(${Array.from(dependencies).map(d => `changed.${d}`).join(' || ')})`
						: null;

					if (attr.is_spread) {
						const value = attr.expression.render(block);
						initial_props.push(value);

						changes.push(condition ? `${condition} && ${value}` : value);
					} else {
						const obj = `{ ${quote_name_if_necessary(name)}: ${attr.get_value(block)} }`;
						initial_props.push(obj);

						changes.push(condition ? `${condition} && ${obj}` : obj);
					}
				});

				block.builders.init.add_block(deindent`
					var ${levels} = [
						${initial_props.join(',\n')}
					];
				`);

				statements.push(deindent`
					for (var #i = 0; #i < ${levels}.length; #i += 1) {
						${props} = @assign(${props}, ${levels}[#i]);
					}
				`);

				const conditions = Array.from(all_dependencies).map(dep => `changed.${dep}`).join(' || ');

				updates.push(deindent`
					var ${name_changes} = ${all_dependencies.size === 1 ? `${conditions}` : `(${conditions})`} ? @get_spread_update(${levels}, [
						${changes.join(',\n')}
					]) : {};
				`);
			} else {
				this.node.attributes
					.filter((attribute: Attribute) => attribute.is_dynamic)
					.forEach((attribute: Attribute) => {
						if (attribute.dependencies.size > 0) {
							/* eslint-disable @typescript-eslint/indent,indent */
							updates.push(deindent`
								if (${[...attribute.dependencies]
									.map(dependency => `changed.${dependency}`)
									.join(' || ')}) ${name_changes}${quote_prop_if_necessary(attribute.name)} = ${attribute.get_value(block)};
							`);
							/* eslint-enable @typescript-eslint/indent,indent */
						}
					});
			}
		}

		if (non_let_dependencies.length > 0) {
			updates.push(`if (${non_let_dependencies.map(n => `changed.${n}`).join(' || ')}) ${name_changes}.$$scope = { changed, ctx };`);
		}

		const munged_bindings = this.node.bindings.map(binding => {
			component.has_reactive_assignments = true;

			if (binding.name === 'this') {
				return bind_this(component, block, binding, this.var);
			}

			const name = component.get_unique_name(`${this.var}_${binding.name}_binding`);

			component.add_var({
				name,
				internal: true,
				referenced: true
			});

			const updating = block.get_unique_name(`updating_${binding.name}`);
			block.add_variable(updating);

			const snippet = binding.expression.render(block);

			statements.push(deindent`
				if (${snippet} !== void 0) {
					${props}${quote_prop_if_necessary(binding.name)} = ${snippet};
				}`
			);

			updates.push(deindent`
				if (!${updating} && ${[...binding.expression.dependencies].map((dependency: string) => `changed.${dependency}`).join(' || ')}) {
					${name_changes}${quote_prop_if_necessary(binding.name)} = ${snippet};
				}
			`);

			const contextual_dependencies = Array.from(binding.expression.contextual_dependencies);
			const dependencies = Array.from(binding.expression.dependencies);

			let lhs = component.source.slice(binding.expression.node.start, binding.expression.node.end).trim();

			if (binding.is_contextual && binding.expression.node.type === 'Identifier') {
				// bind:x={y} — we can't just do `y = x`, we need to
				// to `array[index] = x;
				const { name } = binding.expression.node;
				const { object, property, snippet } = block.bindings.get(name);
				lhs = snippet;
				contextual_dependencies.push(object, property);
			}

			const value = block.get_unique_name('value');
			const args = [value];
			if (contextual_dependencies.length > 0) {
				args.push(`{ ${contextual_dependencies.join(', ')} }`);

				block.builders.init.add_block(deindent`
					function ${name}(${value}) {
						ctx.${name}.call(null, ${value}, ctx);
						${updating} = true;
						@add_flush_callback(() => ${updating} = false);
					}
				`);

				block.maintain_context = true; // TODO put this somewhere more logical
			} else {
				block.builders.init.add_block(deindent`
					function ${name}(${value}) {
						ctx.${name}.call(null, ${value});
						${updating} = true;
						@add_flush_callback(() => ${updating} = false);
					}
				`);
			}

			const body = deindent`
				function ${name}(${args.join(', ')}) {
					${lhs} = ${value};
					${component.invalidate(dependencies[0])};
				}
			`;

			component.partly_hoisted.push(body);

			return `@add_binding_callback(() => @bind(${this.var}, '${binding.name}', ${name}));`;
		});

		const munged_handlers = this.node.handlers.map(handler => {
			let snippet = handler.render(block);
			if (handler.modifiers.has('once')) snippet = `@once(${snippet})`;

			return `${name}.$on("${handler.name}", ${snippet});`;
		});

		if (this.node.name === 'svelte:component') {
			const switch_value = block.get_unique_name('switch_value');
			const switch_props = block.get_unique_name('switch_props');

			const snippet = this.node.expression.render(block);

			block.builders.init.add_block(deindent`
				var ${switch_value} = ${snippet};

				function ${switch_props}(ctx) {
					${(this.node.attributes.length || this.node.bindings.length) && deindent`
					${props && `let ${props} = ${attribute_object};`}`}
					${statements}
					return ${stringify_props(component_opts)};
				}

				if (${switch_value}) {
					var ${name} = new ${switch_value}(${switch_props}(ctx));

					${munged_bindings}
					${munged_handlers}
				}
			`);

			block.builders.create.add_line(
				`if (${name}) ${name}.$$.fragment.c();`
			);

			if (parent_nodes && this.renderer.options.hydratable) {
				block.builders.claim.add_line(
					`if (${name}) ${name}.$$.fragment.l(${parent_nodes});`
				);
			}

			block.builders.mount.add_block(deindent`
				if (${name}) {
					@mount_component(${name}, ${parent_node || '#target'}, ${parent_node ? 'null' : 'anchor'});
				}
			`);

			const anchor = this.get_or_create_anchor(block, parent_node, parent_nodes);
			const update_mount_node = this.get_update_mount_node(anchor);

			if (updates.length) {
				block.builders.update.add_block(deindent`
					${updates}
				`);
			}

			block.builders.update.add_block(deindent`
				if (${switch_value} !== (${switch_value} = ${snippet})) {
					if (${name}) {
						@group_outros();
						const old_component = ${name};
						@transition_out(old_component.$$.fragment, 1, () => {
							@destroy_component(old_component);
						});
						@check_outros();
					}

					if (${switch_value}) {
						${name} = new ${switch_value}(${switch_props}(ctx));

						${munged_bindings}
						${munged_handlers}

						${name}.$$.fragment.c();
						@transition_in(${name}.$$.fragment, 1);
						@mount_component(${name}, ${update_mount_node}, ${anchor});
					} else {
						${name} = null;
					}
				}
			`);

			block.builders.intro.add_block(deindent`
				if (${name}) @transition_in(${name}.$$.fragment, #local);
			`);

			if (updates.length) {
				block.builders.update.add_block(deindent`
					else if (${switch_value}) {
						${name}.$set(${name_changes});
					}
				`);
			}

			block.builders.outro.add_line(
				`if (${name}) @transition_out(${name}.$$.fragment, #local);`
			);

			block.builders.destroy.add_line(`if (${name}) @destroy_component(${name}, ${parent_node ? '' : 'detaching'});`);
		} else {
			const expression = this.node.name === 'svelte:self'
				? '__svelte:self__' // TODO conflict-proof this
				: component.qualify(this.node.name);

			block.builders.init.add_block(deindent`
				${(this.node.attributes.length || this.node.bindings.length) && deindent`
				${props && `let ${props} = ${attribute_object};`}`}
				${statements}
				var ${name} = new ${expression}(${stringify_props(component_opts)});

				${munged_bindings}
				${munged_handlers}
			`);

			block.builders.create.add_line(`${name}.$$.fragment.c();`);

			if (parent_nodes && this.renderer.options.hydratable) {
				block.builders.claim.add_line(
					`${name}.$$.fragment.l(${parent_nodes});`
				);
			}

			block.builders.mount.add_line(
				`@mount_component(${name}, ${parent_node || '#target'}, ${parent_node ? 'null' : 'anchor'});`
			);

			block.builders.intro.add_block(deindent`
				@transition_in(${name}.$$.fragment, #local);
			`);

			if (updates.length) {
				block.builders.update.add_block(deindent`
					${updates}
					${name}.$set(${name_changes});
				`);
			}

			block.builders.destroy.add_block(deindent`
				@destroy_component(${name}, ${parent_node ? '' : 'detaching'});
			`);

			block.builders.outro.add_line(
				`@transition_out(${name}.$$.fragment, #local);`
			);
		}
	}
}
