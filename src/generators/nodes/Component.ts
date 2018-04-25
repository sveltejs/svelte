import deindent from '../../utils/deindent';
import flattenReference from '../../utils/flattenReference';
import validCalleeObjects from '../../utils/validCalleeObjects';
import stringifyProps from '../../utils/stringifyProps';
import CodeBuilder from '../../utils/CodeBuilder';
import getTailSnippet from '../../utils/getTailSnippet';
import getObject from '../../utils/getObject';
import quoteIfNecessary from '../../utils/quoteIfNecessary';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';
import usesThisOrArguments from '../../validate/js/utils/usesThisOrArguments';
import mapChildren from './shared/mapChildren';
import Binding from './Binding';
import EventHandler from './EventHandler';
import Expression from './shared/Expression';

export default class Component extends Node {
	type: 'Component';
	name: string;
	expression: Expression;
	attributes: Attribute[];
	bindings: Binding[];
	handlers: EventHandler[];
	children: Node[];
	ref: string;

	constructor(compiler, parent, scope, info) {
		super(compiler, parent, scope, info);

		compiler.hasComponents = true;

		this.name = info.name;

		this.expression = this.name === 'svelte:component'
			? new Expression(compiler, this, scope, info.expression)
			: null;

		this.attributes = [];
		this.bindings = [];
		this.handlers = [];

		info.attributes.forEach(node => {
			switch (node.type) {
				case 'Attribute':
				case 'Spread':
					this.attributes.push(new Attribute(compiler, this, scope, node));
					break;

				case 'Binding':
					this.bindings.push(new Binding(compiler, this, scope, node));
					break;

				case 'EventHandler':
					this.handlers.push(new EventHandler(compiler, this, scope, node));
					break;

				case 'Ref':
					// TODO catch this in validation
					if (this.ref) throw new Error(`Duplicate refs`);

					compiler.usesRefs = true
					this.ref = node.name;
					break;

				default:
					throw new Error(`Not implemented: ${node.type}`);
			}
		});

		this.children = mapChildren(compiler, this, scope, info.children);
	}

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

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
				this.name === 'svelte:self' ? this.compiler.name :
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
	}

	build(
		block: Block,
		parentNode: string,
		parentNodes: string
	) {
		const { compiler } = this;

		const name = this.var;

		const componentInitProperties = [`root: #component.root`];

		if (this.children.length > 0) {
			const slots = Array.from(this._slots).map(name => `${quoteIfNecessary(name)}: @createFragment()`);
			componentInitProperties.push(`slots: { ${slots.join(', ')} }`);

			this.children.forEach((child: Node) => {
				child.build(block, `${this.var}._slotted.default`, 'nodes');
			});
		}

		const allContexts = new Set();
		const statements: string[] = [];

		const name_initial_data = block.getUniqueName(`${name}_initial_data`);
		const name_changes = block.getUniqueName(`${name}_changes`);
		let name_updating: string;
		let beforecreate: string = null;

		// const eventHandlers = this.attributes
		// 	.filter((a: Node) => a.type === 'EventHandler')
		// 	.map(a => mungeEventHandler(compiler, this, a, block, allContexts));

		const updates: string[] = [];

		const usesSpread = !!this.attributes.find(a => a.isSpread);

		const attributeObject = usesSpread
			? '{}'
			: stringifyProps(
				// this.attributes.map(attr => `${attr.name}: ${attr.value}`)
				this.attributes.map(attr => `${attr.name}: ${attr.getValue()}`)
			);

		if (this.attributes.length || this.bindings.length) {
			componentInitProperties.push(`data: ${name_initial_data}`);
		}

		if ((!usesSpread && this.attributes.filter(a => a.isDynamic).length) || this.bindings.length) {
			updates.push(`var ${name_changes} = {};`);
		}

		if (this.attributes.length) {
			if (usesSpread) {
				const levels = block.getUniqueName(`${this.var}_spread_levels`);

				const initialProps = [];
				const changes = [];

				this.attributes.forEach(attr => {
					const { name, dependencies } = attr;

					const condition = dependencies.size > 0
						? [...dependencies].map(d => `changed.${d}`).join(' || ')
						: null;

					if (attr.isSpread) {
						const value = attr.expression.snippet;
						initialProps.push(value);

						changes.push(condition ? `${condition} && ${value}` : value);
					} else {
						const obj = `{ ${quoteIfNecessary(name)}: ${attr.getValue()} }`;
						initialProps.push(obj);

						changes.push(condition ? `${condition} && ${obj}` : obj);
					}
				});

				block.addVariable(levels);

				statements.push(deindent`
					${levels} = [
						${initialProps.join(',\n')}
					];

					for (var #i = 0; #i < ${levels}.length; #i += 1) {
						${name_initial_data} = @assign(${name_initial_data}, ${levels}[#i]);
					}
				`);

				updates.push(deindent`
					var ${name_changes} = @getSpreadUpdate(${levels}, [
						${changes.join(',\n')}
					]);
				`);
			} else {
				this.attributes
					.filter((attribute: Attribute) => attribute.isDynamic)
					.forEach((attribute: Attribute) => {
						if (attribute.dependencies.size > 0) {
							updates.push(deindent`
								if (${[...attribute.dependencies]
									.map(dependency => `changed.${dependency}`)
									.join(' || ')}) ${name_changes}.${attribute.name} = ${attribute.getValue()};
							`);
						}

						else {
							// TODO this is an odd situation to encounter – I *think* it should only happen with
							// each block indices, in which case it may be possible to optimise this
							updates.push(`${name_changes}.${attribute.name} = ${attribute.getValue()};`);
						}
					});
				}
		}

		if (this.bindings.length) {
			compiler.hasComplexBindings = true;

			name_updating = block.alias(`${name}_updating`);
			block.addVariable(name_updating, '{}');

			let hasLocalBindings = false;
			let hasStoreBindings = false;

			const builder = new CodeBuilder();

			this.bindings.forEach((binding: Binding) => {
				let { name: key } = getObject(binding.value.node);

				binding.value.contexts.forEach(context => {
					allContexts.add(context);
				});

				let setFromChild;

				if (block.contexts.has(key)) {
					const computed = isComputed(binding.value.node);
					const tail = binding.value.node.type === 'MemberExpression' ? getTailSnippet(binding.value.node) : '';

					const list = block.listNames.get(key);
					const index = block.indexNames.get(key);

					setFromChild = deindent`
						${list}[${index}]${tail} = childState.${binding.name};

						${[...binding.value.dependencies]
							.map((name: string) => {
								const isStoreProp = name[0] === '$';
								const prop = isStoreProp ? name.slice(1) : name;
								const newState = isStoreProp ? 'newStoreState' : 'newState';

								if (isStoreProp) hasStoreBindings = true;
								else hasLocalBindings = true;

								return `${newState}.${prop} = ctx.${name};`;
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
							${binding.value.snippet} = childState.${binding.name};
							${newState}.${prop} = ctx.${key};
						`;
					}

					else {
						setFromChild = `${newState}.${prop} = childState.${binding.name};`;
					}
				}

				statements.push(deindent`
					if (${binding.prop} in ${binding.obj}) {
						${name_initial_data}.${binding.name} = ${binding.value.snippet};
						${name_updating}.${binding.name} = true;
					}`
				);

				builder.addConditional(
					`!${name_updating}.${binding.name} && changed.${binding.name}`,
					setFromChild
				);

				updates.push(deindent`
					if (!${name_updating}.${binding.name} && ${[...binding.value.dependencies].map((dependency: string) => `changed.${dependency}`).join(' || ')}) {
						${name_changes}.${binding.name} = ${binding.value.snippet};
						${name_updating}.${binding.name} = true;
					}
				`);
			});

			const initialisers = [
				'ctx = #component.get()',
				hasLocalBindings && 'newState = {}',
				hasStoreBindings && 'newStoreState = {}',
			].filter(Boolean).join(', ');

			// TODO use component.on('state', ...) instead of _bind
			componentInitProperties.push(deindent`
				_bind: function(changed, childState) {
					var ${initialisers};
					${builder}
					${hasStoreBindings && `#component.store.set(newStoreState);`}
					${hasLocalBindings && `#component._set(newState);`}
					${name_updating} = {};
				}
			`);

			beforecreate = deindent`
				#component.root._beforecreate.push(function() {
					${name}._bind({ ${this.bindings.map(b => `${b.name}: 1`).join(', ')} }, ${name}.get());
				});
			`;
		}

		this.handlers.forEach(handler => {
			handler.var = block.getUniqueName(`${this.var}_${handler.name}`); // TODO this is hacky
			handler.render(compiler, block);
		});

		if (this.name === 'svelte:component') {
			const switch_value = block.getUniqueName('switch_value');
			const switch_props = block.getUniqueName('switch_props');

			const { dependencies, snippet } = this.expression;

			const anchor = this.getOrCreateAnchor(block, parentNode, parentNodes);

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
						${handler.snippet}
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
					${this.ref && `#component.refs.${this.ref} = ${name};`}
				}
			`);

			const updateMountNode = this.getUpdateMountNode(anchor);

			block.builders.update.addBlock(deindent`
				if (${switch_value} !== (${switch_value} = ${snippet})) {
					if (${name}) ${name}.destroy();

					if (${switch_value}) {
						${name} = new ${switch_value}(${switch_props}(ctx));
						${name}._fragment.c();

						${this.children.map(child => child.remount(name))}
						${name}._mount(${updateMountNode}, ${anchor});

						${this.handlers.map(handler => deindent`
							${name}.on("${handler.name}", ${handler.var});
						`)}

						${this.ref && `#component.refs.${this.ref} = ${name};`}
					}

					${this.ref && deindent`
						else if (#component.refs.${this.ref} === ${name}) {
							#component.refs.${this.ref} = null;
						}`}
				}
			`);

			if (updates.length) {
				block.builders.update.addBlock(deindent`
					else {
						${updates}
						${name}._set(${name_changes});
						${this.bindings.length && `${name_updating} = {};`}
					}
				`);
			}

			if (!parentNode) block.builders.unmount.addLine(`if (${name}) ${name}._unmount();`);

			block.builders.destroy.addLine(`if (${name}) ${name}.destroy(false);`);
		} else {
			const expression = this.name === 'svelte:self'
				? compiler.name
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
						${handler.snippet}
					});
				`)}

				${this.ref && `#component.refs.${this.ref} = ${name};`}
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

			if (!parentNode) block.builders.unmount.addLine(`${name}._unmount();`);

			block.builders.destroy.addLine(deindent`
				${name}.destroy(false);
				${this.ref && `if (#component.refs.${this.ref} === ${name}) #component.refs.${this.ref} = null;`}
			`);
		}
	}

	remount(name: string) {
		return `${this.var}._mount(${name}._slotted.default, null);`;
	}
}

function mungeEventHandler(compiler: DomGenerator, node: Node, handler: Node, block: Block, allContexts: Set<string>) {
	let body;

	if (handler.expression) {
		compiler.addSourcemapLocations(handler.expression);

		// TODO try out repetition between this and element counterpart
		const flattened = flattenReference(handler.expression.callee);
			if (!validCalleeObjects.has(flattened.name)) {
				// allow event.stopPropagation(), this.select() etc
				// TODO verify that it's a valid callee (i.e. built-in or declared method)
				compiler.code.prependRight(
					handler.expression.start,
					`${block.alias('component')}.`
				);
			}

		let usesState = false;

		handler.expression.arguments.forEach((arg: Node) => {
			const { contexts } = block.contextualise(arg, null, true);
			if (contexts.has('state')) usesState = true;

			contexts.forEach(context => {
				allContexts.add(context);
			});
		});

		body = deindent`
			${usesState && `const ctx = #component.get();`}
			[✂${handler.expression.start}-${handler.expression.end}✂];
		`;
	} else {
		body = deindent`
			#component.fire('${handler.name}', event);
		`;
	}

	return {
		name: handler.name,
		var: block.getUniqueName(`${node.var}_${handler.name}`),
		body
	};
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}
