import deindent from '../../../../utils/deindent';
import CodeBuilder from '../../../../utils/CodeBuilder';
import visit from '../../visit';
import visitAttribute from './Attribute';
import visitEventHandler from './EventHandler';
import visitBinding from './Binding';
import visitRef from './Ref';
import { DomGenerator } from '../../index';
import Block from '../../Block';
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
			const initialData = block.getUniqueName(`${name}_initial_data`);

			statements.push(`var ${initialData} = ${initialPropString};`);

			local.bindings.forEach(binding => {
				statements.push(
					`if ( ${binding.prop} in ${binding.obj} ) ${initialData}.${binding.name} = ${binding.value};`
				);
			});

			componentInitProperties.push(`data: ${initialData}`);
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

	if (local.dynamicAttributes.length) {
		const updates = local.dynamicAttributes.map(attribute => {
			if (attribute.dependencies.length) {
				return deindent`
					if ( ${attribute.dependencies
						.map(dependency => `'${dependency}' in changed`)
						.join(
							'||'
						)} ) ${name}_changes.${attribute.name} = ${attribute.value};
				`;
			}

			// TODO this is an odd situation to encounter – I *think* it should only happen with
			// each block indices, in which case it may be possible to optimise this
			return `${name}_changes.${attribute.name} = ${attribute.value};`;
		});

		local.update.addBlock(deindent`
			var ${name}_changes = {};

			${updates.join('\n')}

			if ( Object.keys( ${name}_changes ).length ) ${name}.set( ${name}_changes );
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
