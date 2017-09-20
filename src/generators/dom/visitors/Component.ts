import deindent from '../../../utils/deindent';
import CodeBuilder from '../../../utils/CodeBuilder';
import visit from '../visit';
import { DomGenerator } from '../index';
import Block from '../Block';
import getTailSnippet from '../../../utils/getTailSnippet';
import getObject from '../../../utils/getObject';
import getExpressionPrecedence from '../../../utils/getExpressionPrecedence';
import { stringify } from '../../../utils/stringify';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

function stringifyProps(props: string[]) {
	if (!props.length) return '{}';

	const joined = props.join(', ');
	if (joined.length > 40) {
		// make larger data objects readable
		return `{\n\t${props.join(',\n\t')}\n}`;
	}

	return `{ ${joined} }`;
}

interface Attribute {
	name: string;
	value: any;
	dynamic: boolean;
	dependencies?: string[]
}

interface Binding {
	name: string;
	value: Node;
	contexts: Set<string>;
	snippet: string;
	obj: string;
	prop: string;
	dependencies: string[];
}

export default function visitComponent(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[],
	componentStack: Node[]
) {
	generator.hasComponents = true;

	const name = node.var;

	const componentInitProperties = [`_root: #component._root`];

	if (node.children.length > 0) {
		const slots = Array.from(node._slots).map(name => `${name}: @createFragment()`);
		componentInitProperties.push(`slots: { ${slots.join(', ')} }`);

		node.children.forEach((child: Node) => {
			visit(generator, block, node._state, child, elementStack, componentStack.concat(node));
		});
	}

	const allContexts = new Set();
	const statements: string[] = [];
	const name_context = block.getUniqueName(`${name}_context`);

	let name_updating: string;
	let name_initial_data: string;
	let beforecreate: string = null;

	const attributes = node.attributes
		.filter((a: Node) => a.type === 'Attribute')
		.map((a: Node) => mungeAttribute(a, block));

	const bindings = node.attributes
		.filter((a: Node) => a.type === 'Binding')
		.map((a: Node) => mungeBinding(a, block));

	if (attributes.length || bindings.length) {
		const initialProps = attributes
			.map((attribute: Attribute) => `${attribute.name}: ${attribute.value}`);

		const initialPropString = stringifyProps(initialProps);

		const updates: string[] = [];

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

			const setParentFromChildOnChange = new CodeBuilder();
			const setParentFromChildOnInit = new CodeBuilder();

			bindings.forEach((binding: Binding) => {
				let setParentFromChild;

				binding.contexts.forEach(context => {
					allContexts.add(context);
				});

				const { name: key } = getObject(binding.value);

				if (block.contexts.has(key)) {
					const prop = binding.dependencies[0];
					const computed = isComputed(binding.value);
					const tail = binding.value.type === 'MemberExpression' ? getTailSnippet(binding.value) : '';

					setParentFromChild = deindent`
						var list = ${name_context}.${block.listNames.get(key)};
						var index = ${name_context}.${block.indexNames.get(key)};
						list[index]${tail} = childState.${binding.name};

						${binding.dependencies
							.map((prop: string) => `newState.${prop} = state.${prop};`)
							.join('\n')}
					`;
				}

				else if (binding.value.type === 'MemberExpression') {
					setParentFromChild = deindent`
						${binding.snippet} = childState.${binding.name};
						${binding.dependencies.map((prop: string) => `newState.${prop} = state.${prop};`).join('\n')}
					`;
				}

				else {
					setParentFromChild = `newState.${binding.value.name} = childState.${binding.name};`;
				}

				statements.push(deindent`
					if (${binding.prop} in ${binding.obj}) {
						${name_initial_data}.${binding.name} = ${binding.snippet};
						${name_updating}.${binding.name} = true;
					}`
				);

				setParentFromChildOnChange.addConditional(
					`!${name_updating}.${binding.name} && changed.${binding.name}`,
					setParentFromChild
				);

				setParentFromChildOnInit.addConditional(
					`!${name_updating}.${binding.name}`,
					setParentFromChild
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

			componentInitProperties.push(deindent`
				_bind: function(changed, childState) {
					var state = #component.get(), newState = {};
					${setParentFromChildOnChange}
					${name_updating} = @assign({}, changed);
					#component._set(newState);
					${name_updating} = {};
				}
			`);

			beforecreate = deindent`
				#component._root._beforecreate.push(function () {
					var state = #component.get(), childState = ${name}.get(), newState = {};
					if (!childState) return;
					${setParentFromChildOnInit}
					${name_updating} = { ${bindings.map((binding: Binding) => `${binding.name}: true`).join(', ')} };
					#component._set(newState);
					${name_updating} = {};
				});
			`;
		} else if (initialProps.length) {
			componentInitProperties.push(`data: ${initialPropString}`);
		}

		if (updates.length) {
			block.builders.update.addBlock(deindent`
				var ${name}_changes = {};
				${updates.join('\n')}
				${name}._set( ${name}_changes );
				${bindings.length && `${name_updating} = {};`}
			`);
		}
	}

	const expression = node.name === ':Self' ? generator.name : `%components-${node.name}`;

	block.builders.init.addBlock(deindent`
		${statements.join('\n')}
		var ${name} = new ${expression}({
			${componentInitProperties.join(',\n')}
		});

		${beforecreate}
	`);

	block.builders.create.addLine(`${name}._fragment.c();`);

	block.builders.claim.addLine(
		`${name}._fragment.l( ${state.parentNodes} );`
	);

	block.builders.mount.addLine(
		`${name}._mount(${state.parentNode || '#target'}, ${state.parentNode ? 'null' : 'anchor'});`
	);

	if (!state.parentNode) block.builders.unmount.addLine(`${name}._unmount();`);

	block.builders.destroy.addLine(`${name}.destroy(false);`);

	// event handlers
	node.attributes.filter((a: Node) => a.type === 'EventHandler').forEach((handler: Node) => {
		const usedContexts: string[] = [];

		if (handler.expression) {
			generator.addSourcemapLocations(handler.expression);
			generator.code.prependRight(
				handler.expression.start,
				`${block.alias('component')}.`
			);

			handler.expression.arguments.forEach((arg: Node) => {
				const { contexts } = block.contextualise(arg, null, true);

				contexts.forEach(context => {
					if (!~usedContexts.indexOf(context)) usedContexts.push(context);
					allContexts.add(context);
				});
			});
		}

		// TODO hoist event handlers? can do `this.__component.method(...)`
		const declarations = usedContexts.map(name => {
			if (name === 'state') return `var state = ${name_context}.state;`;

			const listName = block.listNames.get(name);
			const indexName = block.indexNames.get(name);

			return `var ${listName} = ${name_context}.${listName}, ${indexName} = ${name_context}.${indexName}, ${name} = ${listName}[${indexName}]`;
		});

		const handlerBody =
			(declarations.length ? declarations.join('\n') + '\n\n' : '') +
			(handler.expression ?
				`[✂${handler.expression.start}-${handler.expression.end}✂];` :
				`${block.alias('component')}.fire('${handler.name}', event);`);

		block.builders.init.addBlock(deindent`
			${name}.on("${handler.name}", function(event) {
				${handlerBody}
			});
		`);
	});

	// refs
	node.attributes.filter((a: Node) => a.type === 'Ref').forEach((ref: Node) => {
		generator.usesRefs = true;

		block.builders.init.addLine(`#component.refs.${ref.name} = ${name};`);

		block.builders.destroy.addLine(deindent`
			if (#component.refs.${ref.name} === ${name}) #component.refs.${ref.name} = null;
		`);
	});

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
		const { dependencies, snippet } = block.contextualise(value.expression);

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
					const { dependencies, snippet } = block.contextualise(
						chunk.expression
					);

					dependencies.forEach(dependency => {
						allDependencies.add(dependency);
					});

					return getExpressionPrecedence(chunk.expression) <= 13 ? `( ${snippet} )` : snippet;
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
	const { snippet, contexts, dependencies } = block.contextualise(
		binding.value
	);

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

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}