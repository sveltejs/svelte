import deindent from '../../../../utils/deindent.js';
import visit from '../../visit';
import visitComponent from '../Component/Component';
import visitWindow from './meta/Window';
import visitAttribute from './Attribute';
import visitEventHandler from './EventHandler';
import visitBinding from './Binding';
import visitRef from './Ref';
import addTransitions from './addTransitions';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';

const meta = {
	':Window': visitWindow
};

const order = {
	Attribute: 1,
	Binding: 2,
	EventHandler: 3,
	Ref: 4
};

const visitors = {
	Attribute: visitAttribute,
	EventHandler: visitEventHandler,
	Binding: visitBinding,
	Ref: visitRef
};

export default function visitElement(
	generator: DomGenerator,
	block: Block,
	state: State,
	node: Node
) {
	if (node.name in meta) {
		return meta[node.name](generator, block, node);
	}

	if (generator.components.has(node.name) || node.name === ':Self') {
		return visitComponent(generator, block, state, node);
	}

	const childState = node._state;
	const name = childState.parentNode;

	block.builders.create.addLine(
		`var ${name} = ${getRenderStatement(
			generator,
			childState.namespace,
			node.name
		)};`
	);
	block.mount(name, state.parentNode);

	// add CSS encapsulation attribute
	if (generator.cssId && (!generator.cascade || state.isTopLevel)) {
		block.builders.create.addLine(
			`${generator.helper(
				'setAttribute'
			)}( ${name}, '${generator.cssId}', '' );`
		);
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
				initialProps.push(`component: ${block.component}`);
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
				block.builders.create.addBlock(deindent`
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

	if (!state.parentNode) {
		// TODO we eventually need to consider what happens to elements
		// that belong to the same outgroup as an outroing element...
		block.builders.unmount.addLine(
			`${generator.helper('detachNode')}( ${name} );`
		);
	}

	if (node.name !== 'select') {
		if (node.name === 'textarea') {
			// this is an egregious hack, but it's the easiest way to get <textarea>
			// children treated the same way as a value attribute
			if (node.children.length > 0) {
				node.attributes.push({
					type: 'Attribute',
					name: 'value',
					value: node.children
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
		visit(generator, block, childState, child);
	});

	if (node.lateUpdate) {
		block.builders.update.addLine(node.lateUpdate);
	}

	if (node.name === 'select') {
		visitAttributesAndAddProps();
	}

	if (node.initialUpdate) {
		block.builders.create.addBlock(node.initialUpdate);
	}
}

function getRenderStatement(
	generator: DomGenerator,
	namespace: string,
	name: string
) {
	if (namespace === 'http://www.w3.org/2000/svg') {
		return `${generator.helper('createSvgElement')}( '${name}' )`;
	}

	if (namespace) {
		return `document.createElementNS( '${namespace}', '${name}' )`;
	}

	return `${generator.helper('createElement')}( '${name}' )`;
}
