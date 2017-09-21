import deindent from '../../../../utils/deindent';
import visit from '../../visit';
import visitSlot from '../Slot';
import visitComponent from '../Component';
import visitWindow from './meta/Window';
import visitAttribute from './Attribute';
import visitEventHandler from './EventHandler';
import visitBinding from './Binding';
import visitRef from './Ref';
import * as namespaces from '../../../../utils/namespaces';
import getStaticAttributeValue from '../../../../utils/getStaticAttributeValue';
import isVoidElementName from '../../../../utils/isVoidElementName';
import addTransitions from './addTransitions';
import { DomGenerator } from '../../index';
import Block from '../../Block';
import { Node } from '../../../../interfaces';
import { State } from '../../interfaces';
import reservedNames from '../../../../utils/reservedNames';

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
	elementStack: Node[],
	componentStack: Node[]
) {
	if (node.name in meta) {
		return meta[node.name](generator, block, node);
	}

	if (node.name === 'slot') {
		if (generator.customElement) {
			const slotName = getStaticAttributeValue(node, 'name') || 'default';
			generator.slots.add(slotName);
		} else {
			return visitSlot(generator, block, state, node, elementStack, componentStack);
		}
	}

	if (generator.components.has(node.name) || node.name === ':Self') {
		return visitComponent(generator, block, state, node, elementStack, componentStack);
	}

	const childState = node._state;
	const name = childState.parentNode;

	const slot = node.attributes.find((attribute: Node) => attribute.name === 'slot');
	const parentNode = node.slotted ?
		`${componentStack[componentStack.length - 1].var}._slotted.${slot.value[0].data}` : // TODO this looks bonkers
		state.parentNode;

	const isToplevel = !parentNode;

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
			${name} = ${getClaimStatement(generator, childState.namespace, state.parentNodes, node)};
			var ${childState.parentNodes} = @children(${name});
		`);
	}

	if (parentNode) {
		block.builders.mount.addLine(
			`@appendNode(${name}, ${parentNode});`
		);
	} else {
		block.builders.mount.addLine(`@insertNode(${name}, #target, anchor);`);
	}

	// add CSS encapsulation attribute
	if (node._needsCssAttribute && !generator.customElement) {
		generator.needsEncapsulateHelper = true;
		block.builders.hydrate.addLine(
			`@encapsulateStyles(${name});`
		);

		if (node._cssRefAttribute) {
			block.builders.hydrate.addLine(
				`@setAttribute(${name}, "svelte-ref-${node._cssRefAttribute}", "");`
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
		block.builders.unmount.addLine(`@detachNode(${name});`);
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

	if (!childState.namespace && node.canUseInnerHTML && node.children.length > 0) {
		if (node.children.length === 1 && node.children[0].type === 'Text') {
			block.builders.create.addLine(
				`${name}.textContent = ${JSON.stringify(node.children[0].data)};`
			);
		} else {
			block.builders.create.addLine(
				`${name}.innerHTML = ${JSON.stringify(node.children.map(toHTML).join(''))};`
			);
		}
	} else {
		node.children.forEach((child: Node) => {
			visit(generator, block, childState, child, elementStack.concat(node), componentStack);
		});
	}

	if (node.lateUpdate) {
		block.builders.update.addLine(node.lateUpdate);
	}

	if (node.name === 'select') {
		visitAttributesAndAddProps();
	}

	if (node.initialUpdate) {
		block.builders.mount.addBlock(node.initialUpdate);
	}

	block.builders.claim.addLine(
		`${childState.parentNodes}.forEach(@detachNode);`
	);

	function toHTML(node: Node) {
		if (node.type === 'Text') return node.data;

		let open = `<${node.name}`;

		if (node._needsCssAttribute) {
			open += ` ${generator.stylesheet.id}`;
		}

		if (node._cssRefAttribute) {
			open += ` svelte-ref-${node._cssRefAttribute}`;
		}

		node.attributes.forEach((attr: Node) => {
			open += ` ${attr.name}${stringifyAttributeValue(attr.value)}`
		});

		if (isVoidElementName(node.name)) return open + '>';

		return `${open}>${node.children.map(toHTML).join('')}</${node.name}>`;
	}
}

function getRenderStatement(
	generator: DomGenerator,
	namespace: string,
	name: string
) {
	if (namespace === 'http://www.w3.org/2000/svg') {
		return `@createSvgElement("${name}")`;
	}

	if (namespace) {
		return `document.createElementNS("${namespace}", "${name}")`;
	}

	return `@createElement("${name}")`;
}

function getClaimStatement(
	generator: DomGenerator,
	namespace: string,
	nodes: string,
	node: Node
) {
	const attributes = node.attributes
		.filter((attr: Node) => attr.type === 'Attribute')
		.map((attr: Node) => `${quoteProp(attr.name, generator.legacy)}: true`)
		.join(', ');

	const name = namespace ? node.name : node.name.toUpperCase();

	return `@claimElement(${nodes}, "${name}", ${attributes
		? `{ ${attributes} }`
		: `{}`}, ${namespace === namespaces.svg ? true : false})`;
}

function quoteProp(name: string, legacy: boolean) {
	const isLegacyPropName = legacy && reservedNames.has(name);

	if (/[^a-zA-Z_$0-9]/.test(name) || isLegacyPropName) return `"${name}"`;
	return name;
}

function stringifyAttributeValue(value: Node | true) {
	if (value === true) return '';
	if (value.length === 0) return `=""`;

	const data = value[0].data;
	return `=${JSON.stringify(data)}`;
}