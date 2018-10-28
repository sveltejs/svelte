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
import CodeBuilder from '../../../../utils/CodeBuilder';
import getObject from '../../../../utils/getObject';
import Binding from '../../../nodes/Binding';
import getTailSnippet from '../../../../utils/getTailSnippet';

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
			block.addDependencies(this.node.expression.dependencies);
		}

		this.node.attributes.forEach(attr => {
			block.addDependencies(attr.dependencies);
		});

		this.node.bindings.forEach(binding => {
			if (binding.isContextual) {
				// we need to ensure that the each block creates a context including
				// the list and the index, if they're not otherwise referenced
				const { name } = getObject(binding.value.node);
				const eachBlock = block.contextOwners.get(name);

				eachBlock.hasBinding = true;
			}

			block.addDependencies(binding.value.dependencies);
		});

		this.node.handlers.forEach(handler => {
			block.addDependencies(handler.dependencies);
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

		if (renderer.component.options.nestedTransitions) {
			block.addOutro();
		}
	}

	render(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { renderer } = this;
		const { component } = renderer;

		const name = this.var;

		const componentInitProperties = [
			`root: #component.root`,
			`store: #component.store`
		];

		if (this.fragment) {
			const slots = Array.from(this._slots).map(name => `${quoteNameIfNecessary(name)}: @createFragment()`);
			componentInitProperties.push(`slots: { ${slots.join(', ')} }`);

			this.fragment.nodes.forEach((child: Wrapper) => {
				child.render(block, `${this.var}._slotted.default`, 'nodes');
			});
		}

		const statements: string[] = [];

		const name_initial_data = block.getUniqueName(`${name}_initial_data`);
		const name_changes = block.getUniqueName(`${name}_changes`);
		let name_updating: string;
		let beforecreate: string = null;

		const updates: string[] = [];

		const usesSpread = !!this.node.attributes.find(a => a.isSpread);

		const attributeObject = usesSpread
			? '{}'
			: stringifyProps(
				this.node.attributes.map(attr => `${quoteNameIfNecessary(attr.name)}: ${attr.getValue()}`)
			);

		if (this.node.attributes.length || this.node.bindings.length) {
			componentInitProperties.push(`data: ${name_initial_data}`);
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
						const value = attr.expression.snippet;
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
						${name_initial_data} = @assign(${name_initial_data}, ${levels}[#i]);
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

		if (this.node.bindings.length) {
			renderer.hasComplexBindings = true;

			name_updating = block.alias(`${name}_updating`);
			block.addVariable(name_updating, '{}');

			let hasLocalBindings = false;
			let hasStoreBindings = false;

			const builder = new CodeBuilder();

			this.node.bindings.forEach((binding: Binding) => {
				let { name: key } = getObject(binding.value.node);

				let setFromChild;

				if (binding.isContextual) {
					const computed = isComputed(binding.value.node);
					const tail = binding.value.node.type === 'MemberExpression' ? getTailSnippet(binding.value.node) : '';

					const head = block.bindings.get(key);

					const lhs = binding.value.node.type === 'MemberExpression'
						? binding.value.snippet
						: `${head()}${tail} = childState${quotePropIfNecessary(binding.name)}`;

					setFromChild = deindent`
						${lhs} = childState${quotePropIfNecessary(binding.name)};

						${[...binding.value.dependencies]
							.map((name: string) => {
								const isStoreProp = name[0] === '$';
								const prop = isStoreProp ? name.slice(1) : name;
								const newState = isStoreProp ? 'newStoreState' : 'newState';

								if (isStoreProp) hasStoreBindings = true;
								else hasLocalBindings = true;

								return `${newState}${quotePropIfNecessary(prop)} = ctx${quotePropIfNecessary(name)};`;
							})}
					`;
				}

				else {
					const isStoreProp = key[0] === '$';
					const prop = isStoreProp ? key.slice(1) : key;
					const newState = isStoreProp ? 'newStoreState' : 'newState';

					if (isStoreProp) hasStoreBindings = true;
					else hasLocalBindings = true;

					if (binding.value.node.type === 'MemberExpression') {
						setFromChild = deindent`
							${binding.value.snippet} = childState${quotePropIfNecessary(binding.name)};
							${newState}${quotePropIfNecessary(prop)} = ctx${quotePropIfNecessary(key)};
						`;
					}

					else {
						setFromChild = `${newState}${quotePropIfNecessary(prop)} = childState${quotePropIfNecessary(binding.name)};`;
					}
				}

				statements.push(deindent`
					if (${binding.value.snippet} !== void 0) {
						${name_initial_data}${quotePropIfNecessary(binding.name)} = ${binding.value.snippet};
						${name_updating}${quotePropIfNecessary(binding.name)} = true;
					}`
				);

				builder.addConditional(
					`!${name_updating}${quotePropIfNecessary(binding.name)} && changed${quotePropIfNecessary(binding.name)}`,
					setFromChild
				);

				updates.push(deindent`
					if (!${name_updating}${quotePropIfNecessary(binding.name)} && ${[...binding.value.dependencies].map((dependency: string) => `changed.${dependency}`).join(' || ')}) {
						${name_changes}${quotePropIfNecessary(binding.name)} = ${binding.value.snippet};
						${name_updating}${quotePropIfNecessary(binding.name)} = ${binding.value.snippet} !== void 0;
					}
				`);
			});

			block.maintainContext = true; // TODO put this somewhere more logical

			const initialisers = [
				hasLocalBindings && 'newState = {}',
				hasStoreBindings && 'newStoreState = {}',
			].filter(Boolean).join(', ');

			// TODO use component.on('state', ...) instead of _bind
			componentInitProperties.push(deindent`
				_bind(changed, childState) {
					var ${initialisers};
					${builder}
					${hasStoreBindings && `#component.store.set(newStoreState);`}
					${hasLocalBindings && `#component._set(newState);`}
					${name_updating} = {};
				}
			`);

			beforecreate = deindent`
				#component.root._beforecreate.push(() => {
					${name}._bind({ ${this.node.bindings.map(b => `${quoteNameIfNecessary(b.name)}: 1`).join(', ')} }, ${name}.get());
				});
			`;
		}

		this.node.handlers.forEach(handler => {
			handler.var = block.getUniqueName(`${this.var}_${handler.name}`); // TODO this is hacky
			handler.render(component, block, this.var, false); // TODO hoist when possible
			if (handler.usesContext) block.maintainContext = true; // TODO is there a better place to put this?
		});

		if (this.node.name === 'svelte:component') {
			const switch_value = block.getUniqueName('switch_value');
			const switch_props = block.getUniqueName('switch_props');

			const { snippet } = this.node.expression;

			block.builders.init.addBlock(deindent`
				var ${switch_value} = ${snippet};

				function ${switch_props}(ctx) {
					${(this.node.attributes.length || this.node.bindings.length) && deindent`
					var ${name_initial_data} = ${attributeObject};`}
					${statements}
					return {
						${componentInitProperties.join(',\n')}
					};
				}

				if (${switch_value}) {
					var ${name} = new ${switch_value}(${switch_props}(ctx));

					${beforecreate}
				}

				${this.node.handlers.map(handler => deindent`
					function ${handler.var}(event) {
						${handler.snippet || `#component.fire("${handler.name}", event);`}
					}

					if (${name}) ${name}.on("${handler.name}", ${handler.var});
				`)}
			`);

			block.builders.create.addLine(
				`if (${name}) ${name}._fragment.c();`
			);

			if (parentNodes) {
				block.builders.claim.addLine(
					`if (${name}) ${name}._fragment.l(${parentNodes});`
				);
			}

			block.builders.mount.addBlock(deindent`
				if (${name}) {
					${name}._mount(${parentNode || '#target'}, ${parentNode ? 'null' : 'anchor'});
					${this.node.ref && `#component.refs.${this.node.ref.name} = ${name};`}
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
						${component.options.nestedTransitions
						? deindent`
						@groupOutros();
						const old_component = ${name};
						old_component._fragment.o(() => {
							old_component.destroy();
						});`
						: `${name}.destroy();`}
					}

					if (${switch_value}) {
						${name} = new ${switch_value}(${switch_props}(ctx));

						${this.node.bindings.length > 0 && deindent`
						#component.root._beforecreate.push(() => {
							const changed = {};
							${this.node.bindings.map(binding => deindent`
							if (${binding.value.snippet} === void 0) changed.${binding.name} = 1;`)}
							${name}._bind(changed, ${name}.get());
						});`}
						${name}._fragment.c();

						${this.fragment && this.fragment.nodes.map(child => child.remount(name))}
						${name}._mount(${updateMountNode}, ${anchor});

						${this.node.handlers.map(handler => deindent`
							${name}.on("${handler.name}", ${handler.var});
						`)}

						${this.node.ref && `#component.refs.${this.node.ref.name} = ${name};`}
					} else {
						${name} = null;
						${this.node.ref && deindent`
						if (#component.refs.${this.node.ref.name} === ${name}) {
							#component.refs.${this.node.ref.name} = null;
						}`}
					}
				}
			`);

			if (updates.length) {
				block.builders.update.addBlock(deindent`
					else if (${switch_value}) {
						${name}._set(${name_changes});
						${this.node.bindings.length && `${name_updating} = {};`}
					}
				`);
			}

			block.builders.destroy.addLine(`if (${name}) ${name}.destroy(${parentNode ? '' : 'detach'});`);
		} else {
			const expression = this.node.name === 'svelte:self'
				? component.name
				: `%components-${this.node.name}`;

			block.builders.init.addBlock(deindent`
				${(this.node.attributes.length || this.node.bindings.length) && deindent`
				var ${name_initial_data} = ${attributeObject};`}
				${statements}
				var ${name} = new ${expression}({
					${componentInitProperties.join(',\n')}
				});

				${beforecreate}

				${this.node.handlers.map(handler => deindent`
					${name}.on("${handler.name}", function(event) {
						${handler.snippet || `#component.fire("${handler.name}", event);`}
					});
				`)}

				${this.node.ref && `#component.refs.${this.node.ref.name} = ${name};`}
			`);

			block.builders.create.addLine(`${name}._fragment.c();`);

			if (parentNodes) {
				block.builders.claim.addLine(
					`${name}._fragment.l(${parentNodes});`
				);
			}

			block.builders.mount.addLine(
				`${name}._mount(${parentNode || '#target'}, ${parentNode ? 'null' : 'anchor'});`
			);

			if (updates.length) {
				block.builders.update.addBlock(deindent`
					${updates}
					${name}._set(${name_changes});
					${this.node.bindings.length && `${name_updating} = {};`}
				`);
			}

			block.builders.destroy.addLine(deindent`
				${name}.destroy(${parentNode ? '' : 'detach'});
				${this.node.ref && `if (#component.refs.${this.node.ref.name} === ${name}) #component.refs.${this.node.ref.name} = null;`}
			`);
		}

		if (component.options.nestedTransitions) {
			block.builders.outro.addLine(
				`if (${name}) ${name}._fragment.o(#outrocallback);`
			);
		}
	}

	remount(name: string) {
		return `${this.var}._mount(${name}._slotted.default, null);`;
	}
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}