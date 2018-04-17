import deindent from '../../utils/deindent';
import flattenReference from '../../utils/flattenReference';
import validCalleeObjects from '../../utils/validCalleeObjects';
import stringifyProps from '../../utils/stringifyProps';
import CodeBuilder from '../../utils/CodeBuilder';
import getTailSnippet from '../../utils/getTailSnippet';
import getObject from '../../utils/getObject';
import quoteIfNecessary from '../../utils/quoteIfNecessary';
import mungeAttribute from './shared/mungeAttribute';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';

export default class Component extends Node {
	type: 'Component';
	name: string;
	attributes: Attribute[];
	children: Node[];

	init(
		block: Block,
		stripWhitespace: boolean,
		nextSibling: Node
	) {
		this.cannotUseInnerHTML();

		this.attributes.forEach((attribute: Node) => {
			if (attribute.type === 'Attribute' && attribute.value !== true) {
				attribute.value.forEach((chunk: Node) => {
					if (chunk.type !== 'Text') {
						const dependencies = chunk.metadata.dependencies;
						block.addDependencies(dependencies);
					}
				});
			} else {
				if (attribute.type === 'EventHandler' && attribute.expression) {
					attribute.expression.arguments.forEach((arg: Node) => {
						block.addDependencies(arg.metadata.dependencies);
					});
				} else if (attribute.type === 'Binding') {
					block.addDependencies(attribute.metadata.dependencies);
				}
			}
		});

		this.var = block.getUniqueName(
			(
				this.name === 'svelte:self' ? this.generator.name :
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
		const { generator } = this;
		generator.hasComponents = true;

		const name = this.var;

		const componentInitProperties = [`root: #component.root`];

		if (this.children.length > 0) {
			const slots = Array.from(this._slots).map(name => `${quoteIfNecessary(name, generator.legacy)}: @createFragment()`);
			componentInitProperties.push(`slots: { ${slots.join(', ')} }`);

			this.children.forEach((child: Node) => {
				child.build(block, `${this.var}._slotted${generator.legacy ? `["default"]` : `.default`}`, 'nodes');
			});
		}

		const allContexts = new Set();
		const statements: string[] = [];

		const name_initial_data = block.getUniqueName(`${name}_initial_data`);
		const name_changes = block.getUniqueName(`${name}_changes`);
		let name_updating: string;
		let beforecreate: string = null;

		const attributes = this.attributes
			.filter(a => a.type === 'Attribute' || a.type === 'Spread')
			.map(a => mungeAttribute(a, block));

		const bindings = this.attributes
			.filter(a => a.type === 'Binding')
			.map(a => mungeBinding(a, block));

		const eventHandlers = this.attributes
			.filter((a: Node) => a.type === 'EventHandler')
			.map(a => mungeEventHandler(generator, this, a, block, allContexts));

		const ref = this.attributes.find((a: Node) => a.type === 'Ref');
		if (ref) generator.usesRefs = true;

		const updates: string[] = [];

		const usesSpread = !!attributes.find(a => a.spread);

		const attributeObject = usesSpread
			? '{}'
			: stringifyProps(
				attributes.map((attribute: Attribute) => `${attribute.name}: ${attribute.value}`)
			);

		if (attributes.length || bindings.length) {
			componentInitProperties.push(`data: ${name_initial_data}`);
		}

		if ((!usesSpread && attributes.filter(a => a.dynamic).length) || bindings.length) {
			updates.push(`var ${name_changes} = {};`);
		}

		if (attributes.length) {
			if (usesSpread) {
				const levels = block.getUniqueName(`${this.var}_spread_levels`);

				const initialProps = [];
				const changes = [];

				attributes
					.forEach(munged => {
						const { spread, name, dynamic, value, dependencies } = munged;

						if (spread) {
							initialProps.push(value);

							const condition = dependencies && dependencies.map(d => `changed.${d}`).join(' || ');
							changes.push(condition ? `${condition} && ${value}` : value);
						} else {
							const obj = `{ ${quoteIfNecessary(name, this.generator.legacy)}: ${value} }`;
							initialProps.push(obj);

							const condition = dependencies && dependencies.map(d => `changed.${d}`).join(' || ');
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
				attributes
					.filter((attribute: Attribute) => attribute.dynamic)
					.forEach((attribute: Attribute) => {
						if (attribute.dependencies.length) {
							updates.push(deindent`
								if (${attribute.dependencies
									.map(dependency => `changed.${dependency}`)
									.join(' || ')}) ${name_changes}.${attribute.name} = ${attribute.value};
							`);
						}

						else {
							// TODO this is an odd situation to encounter – I *think* it should only happen with
							// each block indices, in which case it may be possible to optimise this
							updates.push(`${name_changes}.${attribute.name} = ${attribute.value};`);
						}
					});
				}
		}

		if (bindings.length) {
			generator.hasComplexBindings = true;

			name_updating = block.alias(`${name}_updating`);
			block.addVariable(name_updating, '{}');

			let hasLocalBindings = false;
			let hasStoreBindings = false;

			const builder = new CodeBuilder();

			bindings.forEach((binding: Binding) => {
				let { name: key } = getObject(binding.value);

				binding.contexts.forEach(context => {
					allContexts.add(context);
				});

				let setFromChild;

				if (block.contexts.has(key)) {
					const computed = isComputed(binding.value);
					const tail = binding.value.type === 'MemberExpression' ? getTailSnippet(binding.value) : '';

					const list = block.listNames.get(key);
					const index = block.indexNames.get(key);

					setFromChild = deindent`
						${list}[${index}]${tail} = childState.${binding.name};

						${binding.dependencies
							.map((name: string) => {
								const isStoreProp = name[0] === '$';
								const prop = isStoreProp ? name.slice(1) : name;
								const newState = isStoreProp ? 'newStoreState' : 'newState';

								if (isStoreProp) hasStoreBindings = true;
								else hasLocalBindings = true;

								return `${newState}.${prop} = state.${name};`;
							})}
					`;
				}

				else {
					const isStoreProp = key[0] === '$';
					const prop = isStoreProp ? key.slice(1) : key;
					const newState = isStoreProp ? 'newStoreState' : 'newState';

					if (isStoreProp) hasStoreBindings = true;
					else hasLocalBindings = true;

					if (binding.value.type === 'MemberExpression') {
						setFromChild = deindent`
							${binding.snippet} = childState.${binding.name};
							${newState}.${prop} = state.${key};
						`;
					}

					else {
						setFromChild = `${newState}.${prop} = childState.${binding.name};`;
					}
				}

				statements.push(deindent`
					if (${binding.prop} in ${binding.obj}) {
						${name_initial_data}.${binding.name} = ${binding.snippet};
						${name_updating}.${binding.name} = true;
					}`
				);

				builder.addConditional(
					`!${name_updating}.${binding.name} && changed.${binding.name}`,
					setFromChild
				);

				updates.push(deindent`
					if (!${name_updating}.${binding.name} && ${binding.dependencies.map((dependency: string) => `changed.${dependency}`).join(' || ')}) {
						${name_changes}.${binding.name} = ${binding.snippet};
						${name_updating}.${binding.name} = true;
					}
				`);
			});

			const initialisers = [
				'state = #component.get()',
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
					${name}._bind({ ${bindings.map(b => `${b.name}: 1`).join(', ')} }, ${name}.get());
				});
			`;
		}

		if (this.name === 'svelte:component') {
			const switch_value = block.getUniqueName('switch_value');
			const switch_props = block.getUniqueName('switch_props');

			block.contextualise(this.expression);
			const { dependencies, snippet } = this.metadata;

			const anchor = this.getOrCreateAnchor(block, parentNode, parentNodes);

			block.builders.init.addBlock(deindent`
				var ${switch_value} = ${snippet};

				function ${switch_props}(state) {
					${(attributes.length || bindings.length) && deindent`
					var ${name_initial_data} = ${attributeObject};`}
					${statements}
					return {
						${componentInitProperties.join(',\n')}
					};
				}

				if (${switch_value}) {
					var ${name} = new ${switch_value}(${switch_props}(state));

					${beforecreate}
				}

				${eventHandlers.map(handler => deindent`
					function ${handler.var}(event) {
						${handler.body}
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
					${ref && `#component.refs.${ref.name} = ${name};`}
				}
			`);

			const updateMountNode = this.getUpdateMountNode(anchor);

			block.builders.update.addBlock(deindent`
				if (${switch_value} !== (${switch_value} = ${snippet})) {
					if (${name}) ${name}.destroy();

					if (${switch_value}) {
						${name} = new ${switch_value}(${switch_props}(state));
						${name}._fragment.c();

						${this.children.map(child => child.remount(name))}
						${name}._mount(${updateMountNode}, ${anchor});

						${eventHandlers.map(handler => deindent`
							${name}.on("${handler.name}", ${handler.var});
						`)}

						${ref && `#component.refs.${ref.name} = ${name};`}
					}

					${ref && deindent`
						else if (#component.refs.${ref.name} === ${name}) {
							#component.refs.${ref.name} = null;
						}`}
				}
			`);

			if (updates.length) {
				block.builders.update.addBlock(deindent`
					else {
						${updates}
						${name}._set(${name_changes});
						${bindings.length && `${name_updating} = {};`}
					}
				`);
			}

			if (!parentNode) block.builders.unmount.addLine(`if (${name}) ${name}._unmount();`);

			block.builders.destroy.addLine(`if (${name}) ${name}.destroy(false);`);
		} else {
			const expression = this.name === 'svelte:self'
				? generator.name
				: `%components-${this.name}`;

			block.builders.init.addBlock(deindent`
				${(attributes.length || bindings.length) && deindent`
				var ${name_initial_data} = ${attributeObject};`}
				${statements}
				var ${name} = new ${expression}({
					${componentInitProperties.join(',\n')}
				});

				${beforecreate}

				${eventHandlers.map(handler => deindent`
					${name}.on("${handler.name}", function(event) {
						${handler.body}
					});
				`)}

				${ref && `#component.refs.${ref.name} = ${name};`}
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
					${bindings.length && `${name_updating} = {};`}
				`);
			}

			if (!parentNode) block.builders.unmount.addLine(`${name}._unmount();`);

			block.builders.destroy.addLine(deindent`
				${name}.destroy(false);
				${ref && `if (#component.refs.${ref.name} === ${name}) #component.refs.${ref.name} = null;`}
			`);
		}
	}

	remount(name: string) {
		return `${this.var}._mount(${name}._slotted${this.generator.legacy ? `["default"]` : `.default`}, null);`;
	}
}

function mungeBinding(binding: Node, block: Block): Binding {
	const { name } = getObject(binding.value);
	const { contexts } = block.contextualise(binding.value);
	const { dependencies, snippet } = binding.metadata;

	const contextual = block.contexts.has(name);

	let obj;
	let prop;

	if (contextual) {
		obj = `state.${block.listNames.get(name)}`;
		prop = `${block.indexNames.get(name)}`;
	} else if (binding.value.type === 'MemberExpression') {
		prop = `[✂${binding.value.property.start}-${binding.value.property.end}✂]`;
		if (!binding.value.computed) prop = `'${prop}'`;
		obj = `[✂${binding.value.object.start}-${binding.value.object.end}✂]`;
	} else {
		obj = 'state';
		prop = `'${name}'`;
	}

	return {
		name: binding.name,
		value: binding.value,
		contexts,
		snippet,
		obj,
		prop,
		dependencies
	};
}

function mungeEventHandler(generator: DomGenerator, node: Node, handler: Node, block: Block, allContexts: Set<string>) {
	let body;

	if (handler.expression) {
		generator.addSourcemapLocations(handler.expression);

		// TODO try out repetition between this and element counterpart
		const flattened = flattenReference(handler.expression.callee);
			if (!validCalleeObjects.has(flattened.name)) {
				// allow event.stopPropagation(), this.select() etc
				// TODO verify that it's a valid callee (i.e. built-in or declared method)
				generator.code.prependRight(
					handler.expression.start,
					`${block.alias('component')}.`
				);
			}

		handler.expression.arguments.forEach((arg: Node) => {
			const { contexts } = block.contextualise(arg, null, true);

			contexts.forEach(context => {
				allContexts.add(context);
			});
		});

		body = deindent`
			[✂${handler.expression.start}-${handler.expression.end}✂];
		`;
	} else {
		body = deindent`
			${block.alias('component')}.fire('${handler.name}', event);
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
