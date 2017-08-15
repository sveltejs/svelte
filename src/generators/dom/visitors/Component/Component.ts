import deindent from '../../../../utils/deindent';
import CodeBuilder from '../../../../utils/CodeBuilder';
import visit from '../../visit';
import visitAttribute from './Attribute';
import visitEventHandler from './EventHandler';
import visitBinding from './Binding';
import visitRef from './Ref';
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
	EventHandler: 2,
	Binding: 3,
	Ref: 4,
};

const visitors = {
	Attribute: visitAttribute,
	EventHandler: visitEventHandler,
	Binding: visitBinding,
	Ref: visitRef,
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
		name,
		namespace: state.namespace,
		isComponent: true,

		allUsedContexts: [],
		staticAttributes: [],
		dynamicAttributes: [],
		bindings: [],

		create: new CodeBuilder(),
		update: new CodeBuilder(),
	};

	const isTopLevel = !state.parentNode;

	generator.hasComponents = true;

	node.attributes
		.sort((a, b) => order[a.type] - order[b.type])
		.forEach(attribute => {
			visitors[attribute.type](
				generator,
				block,
				childState,
				node,
				attribute,
				local
			);
		});

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

		local.create.addBlock(deindent`
			${name}._context = {
				${initialProps}
			};
		`);

		local.update.addBlock(updates);
	}

	const componentInitProperties = [`_root: #component._root`];

	// Component has children, put them in a separate {{yield}} block
	if (hasChildren) {
		const params = block.params.join(', ');

		const childBlock = node._block;

		node.children.forEach((child: Node) => {
			visit(generator, childBlock, childState, child, elementStack);
		});

		const yieldFragment = block.getUniqueName(`${name}_yield_fragment`);

		block.builders.init.addLine(
			`var ${yieldFragment} = ${childBlock.name}( ${params}, #component );`
		);

		block.builders.create.addLine(`${yieldFragment}.create();`);

		block.builders.claim.addLine(
			`${yieldFragment}.claim( ${state.parentNodes} );`
		);

		if (childBlock.hasUpdateMethod) {
			block.builders.update.addLine(
				`${yieldFragment}.update( changed, ${params} );`
			);
		}

		block.builders.destroy.addLine(`${yieldFragment}.destroy();`);

		componentInitProperties.push(`_yield: ${yieldFragment}`);
	}

	const statements: string[] = [];
	let name_updating: string;
	let initialData: string;
	let bindings = [];

	if (local.bindings.length) {
		name_updating = block.alias(`${name}_updating`);
		initialData = block.getUniqueName(`${name}_initial_data`);

		block.addVariable(name_updating, '{}');

		bindings = local.bindings.map(binding => {
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

			return {
				init: deindent`
					if ( ${binding.prop} in ${binding.obj} ) {
						${initialData}.${binding.name} = ${binding.snippet};
						${name_updating}.${binding.name} = true;
					}`,
				bind: deindent`
					if (!${name_updating}.${binding.name} && changed.${binding.name}) {
						${setParentFromChild}
					}
				`,
				setParentFromChild,

				// TODO could binding.dependencies.length ever be 0?
				update: binding.dependencies.length && deindent`
					if ( !${name_updating}.${binding.name} && ${binding.dependencies.map((dependency: string) => `changed.${dependency}`).join(' || ')} ) {
						${name}_changes.${binding.name} = ${binding.snippet};
						${name_updating}.${binding.name} = true;
					}
				`
			}
		});
	}

	if (
		local.staticAttributes.length ||
		local.dynamicAttributes.length ||
		local.bindings.length
	) {
		const initialProps = local.staticAttributes
			.concat(local.dynamicAttributes)
			.map(attribute => `${attribute.name}: ${attribute.value}`);

		const initialPropString = stringifyProps(initialProps);

		if (local.bindings.length) {
			statements.push(`var ${initialData} = ${initialPropString};`);

			bindings.forEach(binding => {
				statements.push(binding.init);
			});

			componentInitProperties.push(`data: ${initialData}`);

			componentInitProperties.push(deindent`
				_bind: function(changed, childState) {
					var state = #component.get(), newState = {};
					${bindings.map(binding => binding.bind).join('\n')}
					${name_updating} = changed;
					#component._set(newState);
					${name_updating} = {};
				}
			`);
		} else if (initialProps.length) {
			componentInitProperties.push(`data: ${initialPropString}`);
		}
	}

	const expression = node.name === ':Self'
		? generator.name
		: generator.importedComponents.get(node.name) ||
				`@template.components.${node.name}`;

	local.create.addBlockAtStart(deindent`
		${statements.join('\n')}
		var ${name} = new ${expression}({
			${componentInitProperties.join(',\n')}
		});
	`);

	if (bindings.length) {
		local.create.addBlock(deindent`
			#component._root._beforecreate.push(function () {
				var state = #component.get(), childState = ${name}.get(), newState = {};
				${bindings.map(binding => binding.setParentFromChild).join('\n')}
				${name_updating} = { ${local.bindings.map(binding => `${binding.name}: true`).join(', ')} };
				#component._set(newState);
				${name_updating} = {};
			});
		`);
	}

	if (local.dynamicAttributes.length || local.bindings.length) {
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

		bindings.forEach(binding => {
			if (binding.update) updates.push(binding.update);
		});

		local.update.addBlock(deindent`
			var ${name}_changes = {};
			${updates.join('\n')}
			${name}._set( ${name}_changes );
			${bindings.length && `${name_updating} = {};`}
		`);
	}

	if (isTopLevel)
		block.builders.unmount.addLine(`${name}._fragment.unmount();`);
	block.builders.destroy.addLine(`${name}.destroy( false );`);

	block.builders.init.addBlock(local.create);

	const targetNode = state.parentNode || '#target';
	const anchorNode = state.parentNode ? 'null' : 'anchor';

	block.builders.create.addLine(`${name}._fragment.create();`);
	block.builders.claim.addLine(
		`${name}._fragment.claim( ${state.parentNodes} );`
	);
	block.builders.mount.addLine(
		`${name}._fragment.mount( ${targetNode}, ${anchorNode} );`
	);

	if (!local.update.isEmpty()) block.builders.update.addBlock(local.update);
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}