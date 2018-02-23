import deindent from '../../utils/deindent';
import { stringify } from '../../utils/stringify';
import stringifyProps from '../../utils/stringifyProps';
import CodeBuilder from '../../utils/CodeBuilder';
import getTailSnippet from '../../utils/getTailSnippet';
import getObject from '../../utils/getObject';
import getExpressionPrecedence from '../../utils/getExpressionPrecedence';
import isValidIdentifier from '../../utils/isValidIdentifier';
import reservedNames from '../../utils/reservedNames';
import Node from './shared/Node';
import Block from '../dom/Block';
import Attribute from './Attribute';

function quoteIfNecessary(name, legacy) {
	if (!isValidIdentifier || (legacy && reservedNames.has(name))) return `"${name}"`;
	return name;
}

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
				this.name === ':Self' ? this.generator.name :
				this.name === ':Component' ? 'switch_instance' :
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
		const name_context = block.getUniqueName(`${name}_context`);

		let name_updating: string;
		let name_initial_data: string;
		let beforecreate: string = null;

		const attributes = this.attributes
			.filter(a => a.type === 'Attribute')
			.map(a => mungeAttribute(a, block));

		const bindings = this.attributes
			.filter(a => a.type === 'Binding')
			.map(a => mungeBinding(a, block));

		const eventHandlers = this.attributes
			.filter((a: Node) => a.type === 'EventHandler')
			.map(a => mungeEventHandler(generator, this, a, block, name_context, allContexts));

		const ref = this.attributes.find((a: Node) => a.type === 'Ref');
		if (ref) generator.usesRefs = true;

		const updates: string[] = [];

		if (attributes.length || bindings.length) {
			const initialProps = attributes
				.map((attribute: Attribute) => `${attribute.name}: ${attribute.value}`);

			const initialPropString = stringifyProps(initialProps);

			attributes
				.filter((attribute: Attribute) => attribute.dynamic)
				.forEach((attribute: Attribute) => {
					if (attribute.dependencies.length) {
						updates.push(deindent`
							if (${attribute.dependencies
								.map(dependency => `changed.${dependency}`)
								.join(' || ')}) ${name}_changes.${attribute.name} = ${attribute.value};
						`);
					}

					else {
						// TODO this is an odd situation to encounter – I *think* it should only happen with
						// each block indices, in which case it may be possible to optimise this
						updates.push(`${name}_changes.${attribute.name} = ${attribute.value};`);
					}
				});

			if (bindings.length) {
				generator.hasComplexBindings = true;

				name_updating = block.alias(`${name}_updating`);
				name_initial_data = block.getUniqueName(`${name}_initial_data`);

				block.addVariable(name_updating, '{}');
				statements.push(`var ${name_initial_data} = ${initialPropString};`);

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

						setFromChild = deindent`
							var list = ${name_context}.${block.listNames.get(key)};
							var index = ${name_context}.${block.indexNames.get(key)};
							list[index]${tail} = childState.${binding.name};

							${binding.dependencies
								.map((name: string) => {
									const isStoreProp = generator.options.store && name[0] === '$';
									const prop = isStoreProp ? name.slice(1) : name;
									const newState = isStoreProp ? 'newStoreState' : 'newState';

									if (isStoreProp) hasStoreBindings = true;
									else hasLocalBindings = true;

									return `${newState}.${prop} = state.${name};`;
								})
								.join('\n')}
						`;
					}

					else {
						const isStoreProp = generator.options.store && key[0] === '$';
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

					// TODO could binding.dependencies.length ever be 0?
					if (binding.dependencies.length) {
						updates.push(deindent`
							if (!${name_updating}.${binding.name} && ${binding.dependencies.map((dependency: string) => `changed.${dependency}`).join(' || ')}) {
								${name}_changes.${binding.name} = ${binding.snippet};
								${name_updating}.${binding.name} = true;
							}
						`);
					}
				});

				componentInitProperties.push(`data: ${name_initial_data}`);

				const initialisers = [
					'state = #component.get()',
					hasLocalBindings && 'newState = {}',
					hasStoreBindings && 'newStoreState = {}',
				].filter(Boolean).join(', ');

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
			} else if (initialProps.length) {
				componentInitProperties.push(`data: ${initialPropString}`);
			}
		}

		const isDynamicComponent = this.name === ':Component';

		const switch_vars = isDynamicComponent && {
			value: block.getUniqueName('switch_value'),
			props: block.getUniqueName('switch_props')
		};

		const expression = (
			this.name === ':Self' ? generator.name :
			isDynamicComponent ? switch_vars.value :
			`%components-${this.name}`
		);

		if (isDynamicComponent) {
			block.contextualise(this.expression);
			const { dependencies, snippet } = this.metadata;

			const anchor = this.getOrCreateAnchor(block, parentNode, parentNodes);

			const params = block.params.join(', ');

			block.builders.init.addBlock(deindent`
				var ${switch_vars.value} = ${snippet};

				function ${switch_vars.props}(${params}) {
					${statements.length > 0 && statements.join('\n')}
					return {
						${componentInitProperties.join(',\n')}
					};
				}

				if (${switch_vars.value}) {
					var ${name} = new ${expression}(${switch_vars.props}(${params}));

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

			block.builders.mount.addLine(
				`if (${name}) ${name}._mount(${parentNode || '#target'}, ${parentNode ? 'null' : 'anchor'});`
			);

			const updateMountNode = this.getUpdateMountNode(anchor);

			block.builders.update.addBlock(deindent`
				if (${switch_vars.value} !== (${switch_vars.value} = ${snippet})) {
					if (${name}) ${name}.destroy();

					if (${switch_vars.value}) {
						${name} = new ${switch_vars.value}(${switch_vars.props}(${params}));
						${name}._fragment.c();

						${this.children.map(child => remount(generator, child, name))}
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
						var ${name}_changes = {};
						${updates.join('\n')}
						${name}._set(${name}_changes);
						${bindings.length && `${name_updating} = {};`}
					}
				`);
			}

			if (!parentNode) block.builders.unmount.addLine(`if (${name}) ${name}._unmount();`);

			block.builders.destroy.addLine(`if (${name}) ${name}.destroy(false);`);
		} else {
			block.builders.init.addBlock(deindent`
				${statements.join('\n')}
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
					var ${name}_changes = {};
					${updates.join('\n')}
					${name}._set(${name}_changes);
					${bindings.length && `${name_updating} = {};`}
				`);
			}

			if (!parentNode) block.builders.unmount.addLine(`${name}._unmount();`);

			block.builders.destroy.addLine(deindent`
				${name}.destroy(false);
				${ref && `if (#component.refs.${ref.name} === ${name}) #component.refs.${ref.name} = null;`}
			`);
		}

		// maintain component context
		if (allContexts.size) {
			const contexts = Array.from(allContexts);

			const initialProps = contexts
				.map(contextName => {
					if (contextName === 'state') return `state: state`;

					const listName = block.listNames.get(contextName);
					const indexName = block.indexNames.get(contextName);

					return `${listName}: ${listName},\n${indexName}: ${indexName}`;
				})
				.join(',\n');

			const updates = contexts
				.map(contextName => {
					if (contextName === 'state') return `${name_context}.state = state;`;

					const listName = block.listNames.get(contextName);
					const indexName = block.indexNames.get(contextName);

					return `${name_context}.${listName} = ${listName};\n${name_context}.${indexName} = ${indexName};`;
				})
				.join('\n');

			block.builders.init.addBlock(deindent`
				var ${name_context} = {
					${initialProps}
				};
			`);

			block.builders.update.addBlock(updates);
		}
	}
}

function mungeAttribute(attribute: Node, block: Block): Attribute {
	if (attribute.value === true) {
		// attributes without values, e.g. <textarea readonly>
		return {
			name: attribute.name,
			value: true,
			dynamic: false
		};
	}

	if (attribute.value.length === 0) {
		return {
			name: attribute.name,
			value: `''`,
			dynamic: false
		};
	}

	if (attribute.value.length === 1) {
		const value = attribute.value[0];

		if (value.type === 'Text') {
			// static attributes
			return {
				name: attribute.name,
				value: isNaN(value.data) ? stringify(value.data) : value.data,
				dynamic: false
			};
		}

		// simple dynamic attributes
		block.contextualise(value.expression); // TODO remove
		const { dependencies, snippet } = value.metadata;

		// TODO only update attributes that have changed
		return {
			name: attribute.name,
			value: snippet,
			dependencies,
			dynamic: true
		};
	}

	// otherwise we're dealing with a complex dynamic attribute
	const allDependencies = new Set();

	const value =
		(attribute.value[0].type === 'Text' ? '' : `"" + `) +
		attribute.value
			.map((chunk: Node) => {
				if (chunk.type === 'Text') {
					return stringify(chunk.data);
				} else {
					block.contextualise(chunk.expression); // TODO remove
					const { dependencies, snippet } = chunk.metadata;

					dependencies.forEach((dependency: string) => {
						allDependencies.add(dependency);
					});

					return getExpressionPrecedence(chunk.expression) <= 13 ? `(${snippet})` : snippet;
				}
			})
			.join(' + ');

	return {
		name: attribute.name,
		value,
		dependencies: Array.from(allDependencies),
		dynamic: true
	};
}

function mungeBinding(binding: Node, block: Block): Binding {
	const { name } = getObject(binding.value);
	const { contexts } = block.contextualise(binding.value);
	const { dependencies, snippet } = binding.metadata;

	const contextual = block.contexts.has(name);

	let obj;
	let prop;

	if (contextual) {
		obj = block.listNames.get(name);
		prop = block.indexNames.get(name);
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

function mungeEventHandler(generator: DomGenerator, node: Node, handler: Node, block: Block, name_context: string, allContexts: Set<string>) {
	let body;

	if (handler.expression) {
		generator.addSourcemapLocations(handler.expression);
		generator.code.prependRight(
			handler.expression.start,
			`${block.alias('component')}.`
		);

		const usedContexts: string[] = [];

		handler.expression.arguments.forEach((arg: Node) => {
			const { contexts } = block.contextualise(arg, null, true);

			contexts.forEach(context => {
				if (!~usedContexts.indexOf(context)) usedContexts.push(context);
				allContexts.add(context);
			});
		});

		// TODO hoist event handlers? can do `this.__component.method(...)`
		const declarations = usedContexts.map(name => {
			if (name === 'state') return `var state = ${name_context}.state;`;

			const listName = block.listNames.get(name);
			const indexName = block.indexNames.get(name);

			return `var ${listName} = ${name_context}.${listName}, ${indexName} = ${name_context}.${indexName}, ${name} = ${listName}[${indexName}]`;
		});

		body = deindent`
			${declarations}

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

function remount(generator: DomGenerator, node: Node, name: string) {
	// TODO make this a method of the nodes

	if (node.type === 'Component') {
		return `${node.var}._mount(${name}._slotted${generator.legacy ? `["default"]` : `.default`}, null);`;
	}

	if (node.type === 'Element') {
		const slot = node.attributes.find(attribute => attribute.name === 'slot');
		if (slot) {
			return `@appendNode(${node.var}, ${name}._slotted.${node.getStaticAttributeValue('slot')});`;
		}

		return `@appendNode(${node.var}, ${name}._slotted${generator.legacy ? `["default"]` : `.default`});`;
	}

	if (node.type === 'Text' || node.type === 'MustacheTag' || node.type === 'RawMustacheTag') {
		return `@appendNode(${node.var}, ${name}._slotted${generator.legacy ? `["default"]` : `.default`});`;
	}

	if (node.type === 'EachBlock') {
		// TODO consider keyed blocks
		return `for (var #i = 0; #i < ${node.iterations}.length; #i += 1) ${node.iterations}[#i].m(${name}._slotted${generator.legacy ? `["default"]` : `.default`}, null);`;
	}

	return `${node.var}.m(${name}._slotted${generator.legacy ? `["default"]` : `.default`}, null);`;
}