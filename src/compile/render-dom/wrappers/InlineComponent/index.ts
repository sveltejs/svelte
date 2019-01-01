import Wrapper from '../shared/Wrapper';
import Renderer from '../../Renderer';
import Block from '../../Block';
import Node from '../../../nodes/shared/Node';
import InlineComponent from '../../../nodes/InlineComponent';
import FragmentWrapper from '../Fragment';
import { quoteNameIfNecessary, quotePropIfNecessary } from '../../../../utils/quoteIfNecessary';
import stringifyProps from '../../../../utils/stringifyProps';
import addToSet from '../../../../utils/addToSet';
import deindent from '../../../../utils/deindent';
import Attribute from '../../../nodes/Attribute';
import getObject from '../../../../utils/getObject';
import Binding from '../../../nodes/Binding';
import flattenReference from '../../../../utils/flattenReference';

export default class InlineComponentWrapper extends Wrapper {
	var: string;
	_slots: Set<string>; // TODO lose the underscore
	node: InlineComponent;
	fragment: FragmentWrapper;

	constructor(
		renderer: Renderer,
		block: Block,
		parent: Wrapper,
		node: InlineComponent,
		stripWhitespace: boolean,
		nextSibling: Wrapper
	) {
		super(renderer, block, parent, node);

		this.cannotUseInnerHTML();

		if (this.node.expression) {
			block.addDependencies(this.node.expression.dynamic_dependencies);
		}

		this.node.attributes.forEach(attr => {
			block.addDependencies(attr.dependencies);
		});

		this.node.bindings.forEach(binding => {
			if (binding.isContextual) {
				// we need to ensure that the each block creates a context including
				// the list and the index, if they're not otherwise referenced
				const { name } = getObject(binding.expression.node);
				const eachBlock = block.contextOwners.get(name);

				eachBlock.hasBinding = true;
			}

			block.addDependencies(binding.expression.dynamic_dependencies);
		});

		this.node.handlers.forEach(handler => {
			if (handler.expression) {
				block.addDependencies(handler.expression.dynamic_dependencies);
			}
		});

		this.var = (
			this.node.name === 'svelte:self' ? renderer.component.name :
			this.node.name === 'svelte:component' ? 'switch_instance' :
			this.node.name
		).toLowerCase();

		if (this.node.children.length) {
			this._slots = new Set(['default']);
			this.fragment = new FragmentWrapper(renderer, block, node.children, this, stripWhitespace, nextSibling);
		}

		block.addOutro();
	}

	render(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { renderer } = this;
		const { component } = renderer;

		const name = this.var;

		const component_opts = [];

		if (this.fragment) {
			const slots = Array.from(this._slots).map(name => `${quoteNameIfNecessary(name)}: @createFragment()`);
			component_opts.push(`slots: { ${slots.join(', ')} }`);

			this.fragment.nodes.forEach((child: Wrapper) => {
				child.render(block, `${this.var}.$$.slotted.default`, 'nodes');
			});
		}

		const statements: string[] = [];
		const updates: string[] = [];
		const postupdates: string[] = [];

		let props;
		const name_changes = block.getUniqueName(`${name}_changes`);

		const usesSpread = !!this.node.attributes.find(a => a.isSpread);

		const attributeObject = usesSpread
			? '{}'
			: stringifyProps(
				this.node.attributes.map(attr => `${quoteNameIfNecessary(attr.name)}: ${attr.getValue()}`)
			);

		if (this.node.attributes.length || this.node.bindings.length) {
			if (!usesSpread && this.node.bindings.length === 0) {
				component_opts.push(`props: ${attributeObject}`);
			} else {
				props = block.getUniqueName(`${name}_props`);
				component_opts.push(`props: ${props}`);
			}
		}

		if (component.options.dev) {
			// TODO this is a terrible hack, but without it the component
			// will complain that options.target is missing. This would
			// work better if components had separate public and private
			// APIs
			component_opts.push(`$$inline: true`);
		}

		if (!usesSpread && (this.node.attributes.filter(a => a.isDynamic).length || this.node.bindings.length)) {
			updates.push(`var ${name_changes} = {};`);
		}

		if (this.node.attributes.length) {
			if (usesSpread) {
				const levels = block.getUniqueName(`${this.var}_spread_levels`);

				const initialProps = [];
				const changes = [];

				const allDependencies = new Set();

				this.node.attributes.forEach(attr => {
					addToSet(allDependencies, attr.dependencies);
				});

				this.node.attributes.forEach(attr => {
					const { name, dependencies } = attr;

					const condition = dependencies.size > 0 && (dependencies.size !== allDependencies.size)
						? `(${[...dependencies].map(d => `changed.${d}`).join(' || ')})`
						: null;

					if (attr.isSpread) {
						const value = attr.expression.render();
						initialProps.push(value);

						changes.push(condition ? `${condition} && ${value}` : value);
					} else {
						const obj = `{ ${quoteNameIfNecessary(name)}: ${attr.getValue()} }`;
						initialProps.push(obj);

						changes.push(condition ? `${condition} && ${obj}` : obj);
					}
				});

				block.builders.init.addBlock(deindent`
					var ${levels} = [
						${initialProps.join(',\n')}
					];
				`);

				statements.push(deindent`
					for (var #i = 0; #i < ${levels}.length; #i += 1) {
						${props} = @assign(${props}, ${levels}[#i]);
					}
				`);

				const conditions = [...allDependencies].map(dep => `changed.${dep}`).join(' || ');

				updates.push(deindent`
					var ${name_changes} = ${allDependencies.size === 1 ? `${conditions}` : `(${conditions})`} ? @getSpreadUpdate(${levels}, [
						${changes.join(',\n')}
					]) : {};
				`);
			} else {
				this.node.attributes
					.filter((attribute: Attribute) => attribute.isDynamic)
					.forEach((attribute: Attribute) => {
						if (attribute.dependencies.size > 0) {
							updates.push(deindent`
								if (${[...attribute.dependencies]
									.map(dependency => `changed.${dependency}`)
									.join(' || ')}) ${name_changes}${quotePropIfNecessary(attribute.name)} = ${attribute.getValue()};
							`);
						}
					});
				}
		}

		const munged_bindings = this.node.bindings.map(binding => {
			component.has_reactive_assignments = true;

			if (binding.name === 'this') {
				const fn = component.getUniqueName(`${this.var}_binding`);
				component.declarations.push(fn);
				component.template_references.add(fn);

				let lhs;
				let object;

				if (binding.isContextual && binding.expression.node.type === 'Identifier') {
					// bind:x={y} — we can't just do `y = x`, we need to
					// to `array[index] = x;
					const { name } = binding.expression.node;
					const { object, property, snippet } = block.bindings.get(name);
					lhs = snippet;

					// TODO we need to invalidate... something
				} else {
					object = flattenReference(binding.expression.node).name;
					lhs = component.source.slice(binding.expression.node.start, binding.expression.node.end).trim();
				}

				component.partly_hoisted.push(deindent`
					function ${fn}($$component) {
						${lhs} = $$component;
						${object && `$$invalidate('${object}', ${object});`}
					}
				`);

				block.builders.destroy.addLine(`ctx.${fn}(null);`);
				return `@add_binding_callback(() => ctx.${fn}(${this.var}));`;
			}

			const name = component.getUniqueName(`${this.var}_${binding.name}_binding`);
			component.declarations.push(name);
			component.template_references.add(name);

			const updating = block.getUniqueName(`updating_${binding.name}`);
			block.addVariable(updating);

			const snippet = binding.expression.render();

			statements.push(deindent`
				if (${snippet} !== void 0) {
					${props}${quotePropIfNecessary(binding.name)} = ${snippet};
				}`
			);

			updates.push(deindent`
				if (!${updating} && ${[...binding.expression.dynamic_dependencies].map((dependency: string) => `changed.${dependency}`).join(' || ')}) {
					${name_changes}${quotePropIfNecessary(binding.name)} = ${snippet};
				}
			`);

			postupdates.push(updating);

			const contextual_dependencies = Array.from(binding.expression.contextual_dependencies);
			const dependencies = Array.from(binding.expression.dependencies);

			let lhs = component.source.slice(binding.expression.node.start, binding.expression.node.end).trim();

			if (binding.isContextual && binding.expression.node.type === 'Identifier') {
				// bind:x={y} — we can't just do `y = x`, we need to
				// to `array[index] = x;
				const { name } = binding.expression.node;
				const { object, property, snippet } = block.bindings.get(name);
				lhs = snippet;
				contextual_dependencies.push(object, property);
			}

			const args = ['value'];
			if (contextual_dependencies.length > 0) {
				args.push(`{ ${contextual_dependencies.join(', ')} }`);

				block.builders.init.addBlock(deindent`
					function ${name}(value) {
						if (ctx.${name}.call(null, value, ctx)) {
							${updating} = true;
						}
					}
				`);

				block.maintainContext = true; // TODO put this somewhere more logical
			} else {
				block.builders.init.addBlock(deindent`
					function ${name}(value) {
						if (ctx.${name}.call(null, value)) {
							${updating} = true;
						}
					}
				`);
			}

			const body = deindent`
				function ${name}(${args.join(', ')}) {
					${lhs} = value;
					return $$invalidate('${dependencies[0]}', ${dependencies[0]});
				}
			`;

			component.partly_hoisted.push(body);

			return `@add_binding_callback(() => @bind(${this.var}, '${binding.name}', ${name}));`;
		});

		const munged_handlers = this.node.handlers.map(handler => {
			// TODO return declarations from handler.render()?
			const snippet = handler.render();

			if (handler.expression) {
				handler.expression.declarations.forEach(declaration => {
					block.builders.init.addBlock(declaration);
				});
			}

			return `${name}.$on("${handler.name}", ${snippet});`;
		});

		if (this.node.name === 'svelte:component') {
			const switch_value = block.getUniqueName('switch_value');
			const switch_props = block.getUniqueName('switch_props');

			const snippet = this.node.expression.render();

			block.builders.init.addBlock(deindent`
				var ${switch_value} = ${snippet};

				function ${switch_props}(ctx) {
					${(this.node.attributes.length || this.node.bindings.length) && deindent`
					${props && `let ${props} = ${attributeObject};`}`}
					${statements}
					return ${stringifyProps(component_opts)};
				}

				if (${switch_value}) {
					var ${name} = new ${switch_value}(${switch_props}(ctx));

					${munged_bindings}
					${munged_handlers}
				}
			`);

			block.builders.create.addLine(
				`if (${name}) ${name}.$$.fragment.c();`
			);

			if (parentNodes && this.renderer.options.hydratable) {
				block.builders.claim.addLine(
					`if (${name}) ${name}.$$.fragment.l(${parentNodes});`
				);
			}

			block.builders.mount.addBlock(deindent`
				if (${name}) {
					@mount_component(${name}, ${parentNode || '#target'}, ${parentNode ? 'null' : 'anchor'});
				}
			`);

			const anchor = this.getOrCreateAnchor(block, parentNode, parentNodes);
			const updateMountNode = this.getUpdateMountNode(anchor);

			if (updates.length) {
				block.builders.update.addBlock(deindent`
					${updates}
				`);
			}

			block.builders.update.addBlock(deindent`
				if (${switch_value} !== (${switch_value} = ${snippet})) {
					if (${name}) {
						@group_outros();
						const old_component = ${name};
						old_component.$$.fragment.o(() => {
							old_component.$destroy();
						});
					}

					if (${switch_value}) {
						${name} = new ${switch_value}(${switch_props}(ctx));

						${munged_bindings}
						${munged_handlers}

						${this.fragment && this.fragment.nodes.map(child => child.remount(name))}
						${name}.$$.fragment.c();
						@mount_component(${name}, ${updateMountNode}, ${anchor});

						${this.node.handlers.map(handler => deindent`
							${name}.$on("${handler.name}", ${handler.var});
						`)}
					} else {
						${name} = null;
					}
				}
			`);

			if (updates.length) {
				block.builders.update.addBlock(deindent`
					else if (${switch_value}) {
						${name}.$set(${name_changes});
					}

					${postupdates.length > 0 && `${postupdates.join(' = ')} = false;`}
				`);
			}

			block.builders.destroy.addLine(`if (${name}) ${name}.$destroy(${parentNode ? '' : 'detach'});`);
		} else {
			const expression = this.node.name === 'svelte:self'
				? component.name
				: component.qualify(this.node.name);

			block.builders.init.addBlock(deindent`
				${(this.node.attributes.length || this.node.bindings.length) && deindent`
				${props && `let ${props} = ${attributeObject};`}`}
				${statements}
				var ${name} = new ${expression}(${stringifyProps(component_opts)});

				${munged_bindings}
				${munged_handlers}
			`);

			block.builders.create.addLine(`${name}.$$.fragment.c();`);

			if (parentNodes && this.renderer.options.hydratable) {
				block.builders.claim.addLine(
					`${name}.$$.fragment.l(${parentNodes});`
				);
			}

			block.builders.mount.addLine(
				`@mount_component(${name}, ${parentNode || '#target'}, ${parentNode ? 'null' : 'anchor'});`
			);

			if (updates.length) {
				block.builders.update.addBlock(deindent`
					${updates}
					${name}.$set(${name_changes});
					${postupdates.length > 0 && `${postupdates.join(' = ')} = false;`}
				`);
			}

			block.builders.destroy.addBlock(deindent`
				${name}.$destroy(${parentNode ? '' : 'detach'});
			`);
		}

		block.builders.outro.addLine(
			`if (${name}) ${name}.$$.fragment.o(#outrocallback);`
		);
	}

	remount(name: string) {
		return `${this.var}.$$.fragment.m(${name}.$$.slotted.default, null);`;
	}
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}