import deindent from '../../../../utils/deindent';
import visit from '../../visit';
import visitComponent from '../Component';
import visitWindow from './meta/Window';
import visitAttribute from './Attribute';
import visitEventHandler from './EventHandler';
import visitBinding from './Binding';
import visitRef from './Ref';
import * as namespaces from '../../../../utils/namespaces';
import addTransitions from './addTransitions';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

const meta = {
	':Window': visitWindow,
};

const order = {
	Attribute: 1,
	Binding: 2,
	EventHandler: 3,
	Ref: 4,
};

const visitors = {
	Attribute: visitAttribute,
	EventHandler: visitEventHandler,
	Binding: visitBinding,
	Ref: visitRef,
};

export default function visitElement(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node,
	elementStack: Node[]
) {
	if (node.name in meta) {
		return meta[node.name](generator, block, node);
	}

	if (generator.components.has(node.name) || node.name === ':Self') {
		return visitComponent(generator, block, state, node, elementStack);
	}

	const childState = node._state;
	const name = childState.parentNode;

	const isToplevel = !state.parentNode;

	block.addVariable(name);
	block.builders.create.addLine(
		`${name} = ${getRenderStatement(
			generator,
			childState.namespace,
			node.name
		)};`
	);

	if (generator.hydratable) {
		block.builders.claim.addBlock(deindent`
			${name} = ${getClaimStatement(
			generator,
			childState.namespace,
			state.parentNodes,
			node
		)};
			var ${childState.parentNodes} = @children( ${name} );
		`);
	}

	if (state.parentNode) {
		block.builders.mount.addLine(
			`@appendNode( ${name}, ${state.parentNode} );`
		);
	} else {
		block.builders.mount.addLine(`@insertNode( ${name}, #target, anchor );`);
	}

	// add CSS encapsulation attribute
	// TODO add a helper for this, rather than repeating it
	if (node._needsCssAttribute) {
		generator.needsEncapsulateHelper = true;
		block.builders.hydrate.addLine(
			`@encapsulateStyles( ${name} );`
		);

		if (node._cssRefAttribute) {
			block.builders.hydrate.addLine(
				`@setAttribute( ${name}, 'svelte-ref-${node._cssRefAttribute}', '' );`
			)
		}
	}

	function visitAttributesAndAddProps() {
		let intro;
		let outro;

		node.attributes
			.sort((a: Node, b: Node) => order[a.type] - order[b.type])
			.forEach((attribute: Node) => {
				if (attribute.type === 'Transition') {
					if (attribute.intro) intro = attribute;
					if (attribute.outro) outro = attribute;
					return;
				}

				visitors[attribute.type](generator, block, childState, node, attribute);
			});

		if (intro || outro)
			addTransitions(generator, block, childState, node, intro, outro);

		if (childState.allUsedContexts.length || childState.usesComponent) {
			const initialProps: string[] = [];
			const updates: string[] = [];

			if (childState.usesComponent) {
				initialProps.push(`component: #component`);
			}

			childState.allUsedContexts.forEach((contextName: string) => {
				if (contextName === 'state') return;

				const listName = block.listNames.get(contextName);
				const indexName = block.indexNames.get(contextName);

				initialProps.push(
					`${listName}: ${listName},\n${indexName}: ${indexName}`
				);
				updates.push(
					`${name}._svelte.${listName} = ${listName};\n${name}._svelte.${indexName} = ${indexName};`
				);
			});

			if (initialProps.length) {
				block.builders.hydrate.addBlock(deindent`
					${name}._svelte = {
						${initialProps.join(',\n')}
					};
				`);
			}

			if (updates.length) {
				block.builders.update.addBlock(updates.join('\n'));
			}
		}
	}

	if (isToplevel) {
		// TODO we eventually need to consider what happens to elements
		// that belong to the same outgroup as an outroing element...
		block.builders.unmount.addLine(`@detachNode( ${name} );`);
	}

	if (node.name !== 'select') {
		if (node.name === 'textarea') {
			// this is an egregious hack, but it's the easiest way to get <textarea>
			// children treated the same way as a value attribute
			if (node.children.length > 0) {
				node.attributes.push({
					type: 'Attribute',
					name: 'value',
					value: node.children,
				});

				node.children = [];
			}
		}

		// <select> value attributes are an annoying special case — it must be handled
		// *after* its children have been updated
		visitAttributesAndAddProps();
	}

	// special case – bound <option> without a value attribute
	if (
		node.name === 'option' &&
		!node.attributes.find(
			(attribute: Node) =>
				attribute.type === 'Attribute' && attribute.name === 'value'
		)
	) {
		// TODO check it's bound
		const statement = `${name}.__value = ${name}.textContent;`;
		node.initialUpdate = node.lateUpdate = statement;
	}

	node.children.forEach((child: Node) => {
		visit(generator, block, childState, child, elementStack.concat(node));
	});

	if (node.lateUpdate) {
		block.builders.update.addLine(node.lateUpdate);
	}

	if (node.name === 'select') {
		visitAttributesAndAddProps();
	}

	if (node.initialUpdate) {
		// special case — if we're in a yield block, then we may call mount
		// long after the fragment is created. We may therefore need to get
		// the latest `state` object
		// TODO what about contexts in yield blocks? do we need to do
		// `var ${contextName} = [something complicated]`?
		const needsStateObject = node.initialUpdateNeedsStateObject && state.isYield;

		if ( needsStateObject ) {
			block.builders.mount.addLine(`var state = #component.get()`);
		}

		block.builders.mount.addBlock(node.initialUpdate);
	}

	block.builders.claim.addLine(
		`${childState.parentNodes}.forEach( @detachNode );`
	);
}

function getRenderStatement(
	generator: DomGenerator,
	namespace: string,
	name: string
) {
	if (namespace === 'http://www.w3.org/2000/svg') {
		return `@createSvgElement( '${name}' )`;
	}

	if (namespace) {
		return `document.createElementNS( '${namespace}', '${name}' )`;
	}

	return `@createElement( '${name}' )`;
}

function getClaimStatement(
	generator: DomGenerator,
	namespace: string,
	nodes: string,
	node: Node
) {
	const attributes = node.attributes
		.filter((attr: Node) => attr.type === 'Attribute')
		.map((attr: Node) => `${quoteProp(attr.name)}: true`)
		.join(', ');

	const name = namespace ? node.name : node.name.toUpperCase();

	return `@claimElement( ${nodes}, '${name}', ${attributes
		? `{ ${attributes} }`
		: `{}`}, ${namespace === namespaces.svg ? true : false} )`;
}

function quoteProp(name: string) {
	if (/[^a-zA-Z_$0-9]/.test(name)) return `'${name}'`;
	return name;
}
