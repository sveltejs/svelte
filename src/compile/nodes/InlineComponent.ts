import deindent from '../../utils/deindent';
import stringifyProps from '../../utils/stringifyProps';
import CodeBuilder from '../../utils/CodeBuilder';
import getTailSnippet from '../../utils/getTailSnippet';
import getObject from '../../utils/getObject';
import { quoteNameIfNecessary, quotePropIfNecessary } from '../../utils/quoteIfNecessary';
import { escape, escapeTemplate, stringify } from '../../utils/stringify';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';
import mapChildren from './shared/mapChildren';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Expression from './shared/Expression';
import { AppendTarget } from '../../interfaces';
import addToSet from '../../utils/addToSet';
import Component from '../Component';
import isValidIdentifier from '../../utils/isValidIdentifier';
import Ref from './Ref';

export default class InlineComponent extends Node {
	type: 'InlineComponent';
	name: string;
	expression: Expression;
	attributes: Attribute[];
	bindings: Binding[];
	handlers: EventHandler[];
	children: Node[];
	ref: Ref;

	constructor(component: Component, parent, scope, info) {
		super(component, parent, scope, info);

		component.hasComponents = true;

		this.name = info.name;

		if (this.name !== 'svelte:self' && this.name !== 'svelte:component') {
			if (!component.components.has(this.name)) {
				component.error(this, {
					code: `missing-component`,
					message: `${this.name} component is not defined`
				});
			}

			component.used.components.add(this.name);
		}

		this.expression = this.name === 'svelte:component'
			? new Expression(component, this, scope, info.expression)
			: null;

		this.attributes = [];
		this.bindings = [];
		this.handlers = [];

		info.attributes.forEach(node => {
			switch (node.type) {
				case 'Action':
					component.error(node, {
						code: `invalid-action`,
						message: `Actions can only be applied to DOM elements, not components`
					});

				case 'Attribute':
				case 'Spread':
					this.attributes.push(new Attribute(component, this, scope, node));
					break;

				case 'Binding':
					this.bindings.push(new Binding(component, this, scope, node));
					break;

				case 'Class':
					component.error(node, {
						code: `invalid-class`,
						message: `Classes can only be applied to DOM elements, not components`
					});

				case 'EventHandler':
					this.handlers.push(new EventHandler(component, this, scope, node));
					break;

				case 'Ref':
					this.ref = new Ref(component, this, scope, node);
					break;

				case 'Transition':
					component.error(node, {
						code: `invalid-transition`,
						message: `Transitions can only be applied to DOM elements, not components`
					});

				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
		});

		this.children = mapChildren(component, this, scope, info.children);
	}

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

		if (this.expression) {
			block.addDependencies(this.expression.dependencies);
		}

		this.attributes.forEach(attr => {
			block.addDependencies(attr.dependencies);
		});

		this.bindings.forEach(binding => {
			block.addDependencies(binding.value.dependencies);
		});

		this.handlers.forEach(handler => {
			block.addDependencies(handler.dependencies);
		});

		this.var = block.getUniqueName(
			(
				this.name === 'svelte:self' ? this.component.name :
				this.name === 'svelte:component' ? 'switch_instance' :
				this.name
			).toLowerCase()
		);

		if (this.children.length) {
			this._slots = new Set(['default']);

			this.children.forEach(child => {
				child.init(block, stripWhitespace, nextSibling);
			});
		}

		if (this.component.options.nestedTransitions) {
			block.addOutro();
		}
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { component } = this;

		const name = this.var;

		const componentInitProperties = [`root: #component.root`, `store: #component.store`];

		if (this.children.length > 0) {
			const slots = Array.from(this._slots).map(name => `${quoteNameIfNecessary(name)}: @createFragment()`);
			componentInitProperties.push(`slots: { ${slots.join(', ')} }`);

			this.children.forEach((child: Node) => {
				child.build(block, `${this.var}._slotted.default`, 'nodes');
			});
		}

		const statements: string[] = [];

		const name_initial_data = block.getUniqueName(`${name}_initial_data`);
		const name_changes = block.getUniqueName(`${name}_changes`);
		let name_updating: string;
		let beforecreate: string = null;

		const updates: string[] = [];

		const usesSpread = !!this.attributes.find(a => a.isSpread);

		const attributeObject = usesSpread
			? '{}'
			: stringifyProps(
				this.attributes.map(attr => `${quoteNameIfNecessary(attr.name)}: ${attr.getValue()}`)
			);

		if (this.attributes.length || this.bindings.length) {
			componentInitProperties.push(`data: ${name_initial_data}`);
		}

		if (!usesSpread && (this.attributes.filter(a => a.isDynamic).length || this.bindings.length)) {
			updates.push(`var ${name_changes} = {};`);
		}

		if (this.attributes.length) {
			if (usesSpread) {
				const levels = block.getUniqueName(`${this.var}_spread_levels`);

				const initialProps = [];
				const changes = [];

				const allDependencies = new Set();

				this.attributes.forEach(attr => {
					addToSet(allDependencies, attr.dependencies);
				});

				this.attributes.forEach(attr => {
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
				this.attributes
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

		if (this.bindings.length) {
			component.target.hasComplexBindings = true;

			name_updating = block.alias(`${name}_updating`);
			block.addVariable(name_updating, '{}');

			let hasLocalBindings = false;
			let hasStoreBindings = false;

			const builder = new CodeBuilder();

			this.bindings.forEach((binding: Binding) => {
				let { name: key } = getObject(binding.value.node);

				let setFromChild;

				if (binding.isContextual) {
					const computed = isComputed(binding.value.node);
					const tail = binding.value.node.type === 'MemberExpression' ? getTailSnippet(binding.value.node) : '';

					const head = block.bindings.get(key);

					const lhs = binding.value.node.type === 'MemberExpression'
						? binding.value.snippet
						: `${head}${tail} = childState${quotePropIfNecessary(binding.name)}`;

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
					${name}._bind({ ${this.bindings.map(b => `${quoteNameIfNecessary(b.name)}: 1`).join(', ')} }, ${name}.get());
				});
			`;
		}

		this.handlers.forEach(handler => {
			handler.var = block.getUniqueName(`${this.var}_${handler.name}`); // TODO this is hacky
			handler.render(component, block, false); // TODO hoist when possible
			if (handler.usesContext) block.maintainContext = true; // TODO is there a better place to put this?
		});

		if (this.name === 'svelte:component') {
			const switch_value = block.getUniqueName('switch_value');
			const switch_props = block.getUniqueName('switch_props');

			const { snippet } = this.expression;

			block.builders.init.addBlock(deindent`
				var ${switch_value} = ${snippet};

				function ${switch_props}(ctx) {
					${(this.attributes.length || this.bindings.length) && deindent`
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

				${this.handlers.map(handler => deindent`
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
					${this.ref && `#component.refs.${this.ref.name} = ${name};`}
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
						${this.component.options.nestedTransitions
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

						${this.bindings.length > 0 && deindent`
						#component.root._beforecreate.push(() => {
							const changed = {};
							${this.bindings.map(binding => deindent`
							if (${binding.value.snippet} === void 0) changed.${binding.name} = 1;`)}
							${name}._bind(changed, ${name}.get());
						});`}
						${name}._fragment.c();

						${this.children.map(child => child.remount(name))}
						${name}._mount(${updateMountNode}, ${anchor});

						${this.handlers.map(handler => deindent`
							${name}.on("${handler.name}", ${handler.var});
						`)}

						${this.ref && `#component.refs.${this.ref.name} = ${name};`}
					} else {
						${name} = null;
						${this.ref && deindent`
						if (#component.refs.${this.ref.name} === ${name}) {
							#component.refs.${this.ref.name} = null;
						}`}
					}
				}
			`);

			if (updates.length) {
				block.builders.update.addBlock(deindent`
					else if (${switch_value}) {
						${name}._set(${name_changes});
						${this.bindings.length && `${name_updating} = {};`}
					}
				`);
			}

			block.builders.destroy.addLine(`if (${name}) ${name}.destroy(${parentNode ? '' : 'detach'});`);
		} else {
			const expression = this.name === 'svelte:self'
				? component.name
				: `%components-${this.name}`;

			block.builders.init.addBlock(deindent`
				${(this.attributes.length || this.bindings.length) && deindent`
				var ${name_initial_data} = ${attributeObject};`}
				${statements}
				var ${name} = new ${expression}({
					${componentInitProperties.join(',\n')}
				});

				${beforecreate}

				${this.handlers.map(handler => deindent`
					${name}.on("${handler.name}", function(event) {
						${handler.snippet || `#component.fire("${handler.name}", event);`}
					});
				`)}

				${this.ref && `#component.refs.${this.ref.name} = ${name};`}
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
					${this.bindings.length && `${name_updating} = {};`}
				`);
			}

			block.builders.destroy.addLine(deindent`
				${name}.destroy(${parentNode ? '' : 'detach'});
				${this.ref && `if (#component.refs.${this.ref.name} === ${name}) #component.refs.${this.ref.name} = null;`}
			`);
		}

		if (this.component.options.nestedTransitions) {
			block.builders.outro.addLine(
				`if (${name}) ${name}._fragment.o(#outrocallback);`
			);
		}
	}

	remount(name: string) {
		return `${this.var}._mount(${name}._slotted.default, null);`;
	}

	ssr() {
		function stringifyAttribute(chunk: Node) {
			if (chunk.type === 'Text') {
				return escapeTemplate(escape(chunk.data));
			}

			return '${@escape( ' + chunk.snippet + ')}';
		}

		const bindingProps = this.bindings.map(binding => {
			const { name } = getObject(binding.value.node);
			const tail = binding.value.node.type === 'MemberExpression'
				? getTailSnippet(binding.value.node)
				: '';

			return `${quoteNameIfNecessary(binding.name)}: ctx${quotePropIfNecessary(name)}${tail}`;
		});

		function getAttributeValue(attribute) {
			if (attribute.isTrue) return `true`;
			if (attribute.chunks.length === 0) return `''`;

			if (attribute.chunks.length === 1) {
				const chunk = attribute.chunks[0];
				if (chunk.type === 'Text') {
					return stringify(chunk.data);
				}

				return chunk.snippet;
			}

			return '`' + attribute.chunks.map(stringifyAttribute).join('') + '`';
		}

		const usesSpread = this.attributes.find(attr => attr.isSpread);

		const props = usesSpread
			? `Object.assign(${
				this.attributes
					.map(attribute => {
						if (attribute.isSpread) {
							return attribute.expression.snippet;
						} else {
							return `{ ${quoteNameIfNecessary(attribute.name)}: ${getAttributeValue(attribute)} }`;
						}
					})
					.concat(bindingProps.map(p => `{ ${p} }`))
					.join(', ')
			})`
			: `{ ${this.attributes
				.map(attribute => `${quoteNameIfNecessary(attribute.name)}: ${getAttributeValue(attribute)}`)
				.concat(bindingProps)
				.join(', ')} }`;

		const expression = (
			this.name === 'svelte:self'
				? this.component.name
				: this.name === 'svelte:component'
					? `((${this.expression.snippet}) || @missingComponent)`
					: `%components-${this.name}`
		);

		this.bindings.forEach(binding => {
			const conditions = [];

			let node = this;
			while (node = node.parent) {
				if (node.type === 'IfBlock') {
					// TODO handle contextual bindings...
					conditions.push(`(${node.expression.snippet})`);
				}
			}

			conditions.push(
				`!('${binding.name}' in ctx)`,
				`${expression}.data`
			);

			const { name } = getObject(binding.value.node);

			this.component.target.bindings.push(deindent`
				if (${conditions.reverse().join('&&')}) {
					tmp = ${expression}.data();
					if ('${name}' in tmp) {
						ctx${quotePropIfNecessary(binding.name)} = tmp.${name};
						settled = false;
					}
				}
			`);
		});

		let open = `\${@validateSsrComponent(${expression}, '${this.name}')._render(__result, ${props}`;

		const options = [];
		options.push(`store: options.store`);

		if (this.children.length) {
			const appendTarget: AppendTarget = {
				slots: { default: '' },
				slotStack: ['default']
			};

			this.component.target.appendTargets.push(appendTarget);

			this.children.forEach((child: Node) => {
				child.ssr();
			});

			const slotted = Object.keys(appendTarget.slots)
				.map(name => `${quoteNameIfNecessary(name)}: () => \`${appendTarget.slots[name]}\``)
				.join(', ');

			options.push(`slotted: { ${slotted} }`);

			this.component.target.appendTargets.pop();
		}

		if (options.length) {
			open += `, { ${options.join(', ')} }`;
		}

		this.component.target.append(open);
		this.component.target.append(')}');
	}
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}
