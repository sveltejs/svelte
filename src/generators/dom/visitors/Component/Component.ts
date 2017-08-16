import deindent from '../../../../utils/deindent';
import CodeBuilder from '../../../../utils/CodeBuilder';
import visit from '../../visit';
import visitAttribute from './Attribute';
import visitBinding from './Binding';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import getTailSnippet from '../../../../utils/getTailSnippet';
import getObject from '../../../../utils/getObject';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

function stringifyProps(props: string[]) {
	if (!props.length) return '{}';

	const joined = props.join(', ');
	if (joined.length > 40) {
		// make larger data objects readable
		return `{\n\t${props.join(',\n\t')}\n}`;
	}

	return `{ ${joined} }`;
}

const order = {
	Attribute: 1,
	Binding: 3
};

const visitors = {
	Attribute: visitAttribute,
	Binding: visitBinding
};

export default function visitComponent(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[]
) {
	const hasChildren = node.children.length > 0;
	const name = block.getUniqueName(
		(node.name === ':Self' ? generator.name : node.name).toLowerCase()
	);

	const childState = node._state;

	const local = {
		allUsedContexts: [],
		staticAttributes: [],
		dynamicAttributes: [],
		bindings: []
	};

	const isTopLevel = !state.parentNode;

	generator.hasComponents = true;

	node.attributes
		.sort((a, b) => order[a.type] - order[b.type])
		.forEach(attribute => {
			visitors[attribute.type] && visitors[attribute.type](
				generator,
				block,
				childState,
				node,
				attribute,
				local
			);
		});

	const componentInitProperties = [`_root: #component._root`];

	// Component has children, put them in a separate {{yield}} block
	if (hasChildren) {
		const params = block.params.join(', ');

		const childBlock = node._block;

		node.children.forEach((child: Node) => {
			visit(generator, childBlock, childState, child, elementStack);
		});

		const yield_fragment = block.getUniqueName(`${name}_yield_fragment`);

		block.builders.init.addLine(
			`var ${yield_fragment} = ${childBlock.name}( ${params}, #component );`
		);

		block.builders.create.addLine(`${yield_fragment}.create();`);

		block.builders.claim.addLine(
			`${yield_fragment}.claim( ${state.parentNodes} );`
		);

		if (childBlock.hasUpdateMethod) {
			block.builders.update.addLine(
				`${yield_fragment}.update( changed, ${params} );`
			);
		}

		block.builders.destroy.addLine(`${yield_fragment}.destroy();`);

		componentInitProperties.push(`_yield: ${yield_fragment}`);
	}

	const statements: string[] = [];
	let name_updating: string;
	let name_initial_data: string;
	let beforecreate: string = null;

	if (
		local.staticAttributes.length ||
		local.dynamicAttributes.length ||
		local.bindings.length
	) {
		const initialProps = local.staticAttributes
			.concat(local.dynamicAttributes)
			.map(attribute => `${attribute.name}: ${attribute.value}`);

		const initialPropString = stringifyProps(initialProps);

		const updates: string[] = [];

		local.dynamicAttributes.forEach(attribute => {
			if (attribute.dependencies.length) {
				updates.push(deindent`
					if ( ${attribute.dependencies
						.map(dependency => `changed.${dependency}`)
						.join(' || ')} ) ${name}_changes.${attribute.name} = ${attribute.value};
				`);
			}

			else {
				// TODO this is an odd situation to encounter – I *think* it should only happen with
				// each block indices, in which case it may be possible to optimise this
				updates.push(`${name}_changes.${attribute.name} = ${attribute.value};`);
			}
		});

		if (local.bindings.length) {
			name_updating = block.alias(`${name}_updating`);
			name_initial_data = block.getUniqueName(`${name}_initial_data`);

			block.addVariable(name_updating, '{}');
			statements.push(`var ${name_initial_data} = ${initialPropString};`);

			const setParentFromChildOnChange = new CodeBuilder();
			const setParentFromChildOnInit = new CodeBuilder();

			local.bindings.forEach(binding => {
				let setParentFromChild;

				const { name: key } = getObject(binding.value);

				if (block.contexts.has(key)) {
					const prop = binding.dependencies[0];
					const computed = isComputed(binding.value);
					const tail = binding.value.type === 'MemberExpression' ? getTailSnippet(binding.value) : '';

					setParentFromChild = deindent`
						var list = ${name}._context.${block.listNames.get(key)};
						var index = ${name}._context.${block.indexNames.get(key)};
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
					if ( ${binding.prop} in ${binding.obj} ) {
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
						if ( !${name_updating}.${binding.name} && ${binding.dependencies.map((dependency: string) => `changed.${dependency}`).join(' || ')} ) {
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
					${name_updating} = changed;
					#component._set(newState);
					${name_updating} = {};
				}
			`);

			beforecreate = deindent`
				#component._root._beforecreate.push(function () {
					var state = #component.get(), childState = ${name}.get(), newState = {};
					if (!childState) return;
					${setParentFromChildOnInit}
					${name_updating} = { ${local.bindings.map(binding => `${binding.name}: true`).join(', ')} };
					#component._set(newState);
					${name_updating} = {};
				});
			`;
		} else if (initialProps.length) {
			componentInitProperties.push(`data: ${initialPropString}`);
		}

		block.builders.update.addBlock(deindent`
			var ${name}_changes = {};
			${updates.join('\n')}
			${name}._set( ${name}_changes );
			${local.bindings.length && `${name_updating} = {};`}
		`);
	}

	const expression = node.name === ':Self'
		? generator.name
		: generator.importedComponents.get(node.name) ||
				`@template.components.${node.name}`;

	block.builders.init.addBlock(deindent`
		${statements.join('\n')}
		var ${name} = new ${expression}({
			${componentInitProperties.join(',\n')}
		});

		${beforecreate}
	`);

	if (isTopLevel)
		block.builders.unmount.addLine(`${name}._fragment.unmount();`);
	block.builders.destroy.addLine(`${name}.destroy( false );`);

	const targetNode = state.parentNode || '#target';
	const anchorNode = state.parentNode ? 'null' : 'anchor';

	block.builders.create.addLine(`${name}._fragment.create();`);
	block.builders.claim.addLine(
		`${name}._fragment.claim( ${state.parentNodes} );`
	);
	block.builders.mount.addLine(
		`${name}._fragment.mount( ${targetNode}, ${anchorNode} );`
	);

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
					if (!~local.allUsedContexts.indexOf(context))
						local.allUsedContexts.push(context);
				});
			});
		}

		// TODO hoist event handlers? can do `this.__component.method(...)`
		const declarations = usedContexts.map(name => {
			if (name === 'state') return 'var state = this._context.state;';

			const listName = block.listNames.get(name);
			const indexName = block.indexNames.get(name);

			return `var ${listName} = this._context.${listName}, ${indexName} = this._context.${indexName}, ${name} = ${listName}[${indexName}]`;
		});

		const handlerBody =
			(declarations.length ? declarations.join('\n') + '\n\n' : '') +
			(handler.expression ?
				`[✂${handler.expression.start}-${handler.expression.end}✂];` :
				`${block.alias('component')}.fire('${handler.name}', event);`);

		block.builders.init.addBlock(deindent`
			${name}.on( '${handler.name}', function ( event ) {
				${handlerBody}
			});
		`);
	});

	// refs
	node.attributes.filter((a: Node) => a.type === 'Ref').forEach((ref: Node) => {
		generator.usesRefs = true;

		block.builders.init.addLine(`#component.refs.${ref.name} = ${name};`);

		block.builders.destroy.addLine(deindent`
			if ( #component.refs.${ref.name} === ${name} ) #component.refs.${ref.name} = null;
		`);
	});

	// maintain component context
	if (local.allUsedContexts.length) {
		const initialProps = local.allUsedContexts
			.map(contextName => {
				if (contextName === 'state') return `state: state`;

				const listName = block.listNames.get(contextName);
				const indexName = block.indexNames.get(contextName);

				return `${listName}: ${listName},\n${indexName}: ${indexName}`;
			})
			.join(',\n');

		const updates = local.allUsedContexts
			.map(contextName => {
				if (contextName === 'state') return `${name}._context.state = state;`;

				const listName = block.listNames.get(contextName);
				const indexName = block.indexNames.get(contextName);

				return `${name}._context.${listName} = ${listName};\n${name}._context.${indexName} = ${indexName};`;
			})
			.join('\n');

		block.builders.init.addBlock(deindent`
			${name}._context = {
				${initialProps}
			};
		`);

		block.builders.update.addBlock(updates);
	}
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}