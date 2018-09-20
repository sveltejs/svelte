import Binding from '../../../nodes/Binding';
import ElementWrapper from '.';
import { dimensions } from '../../../../utils/patterns';
import getObject from '../../../../utils/getObject';
import Block from '../../Block';

type Handler = {

}

export default class BindingWrapper {
	node: Binding;
	parent: ElementWrapper;

	object: string;
	handler: Handler;
	updateDom: string;
	initialUpdate: string;
	needsLock: boolean;
	updateCondition: string;
	isReadOnlyMediaAttribute: boolean;

	constructor(node: Binding, parent: ElementWrapper) {
		this.node = node;
		this.parent = parent;

		parent.cannotUseInnerHTML();

		const needsLock = (
			parent.node.name !== 'input' ||
			!/radio|checkbox|range|color/.test(parent.getStaticAttributeValue('type'))
		);

		const isReadOnly = (
			(parent.isMediaNode() && readOnlyMediaAttributes.has(this.node.name)) ||
			dimensions.test(this.node.name)
		);

		let updateConditions: string[] = [];

		const { name } = getObject(this.node.value.node);
		const { snippet } = this.node.value;

		// special case: if you have e.g. `<input type=checkbox bind:checked=selected.done>`
		// and `selected` is an object chosen with a <select>, then when `checked` changes,
		// we need to tell the component to update all the values `selected` might be
		// pointing to
		// TODO should this happen in preprocess?
		const dependencies = new Set(this.node.value.dependencies);
		this.node.value.dependencies.forEach((prop: string) => {
			const indirectDependencies = parent.renderer.component.indirectDependencies.get(prop);
			if (indirectDependencies) {
				indirectDependencies.forEach(indirectDependency => {
					dependencies.add(indirectDependency);
				});
			}
		});

		// view to model
		const valueFromDom = getValueFromDom(this.component, parent.node, this);
		const handler = getEventHandler(this, this.component, block, name, snippet, dependencies, valueFromDom);

		// model to view
		let updateDom = getDomUpdater(node, this, snippet);
		let initialUpdate = updateDom;

		if (this.node.name === 'currentTime' || this.node.name === 'volume') {
			updateConditions.push(`!isNaN(${snippet})`);

			if (this.node.name === 'currentTime') initialUpdate = null;
		}

		if (this.node.name === 'paused') {
			// this is necessary to prevent audio restarting by itself
			const last = block.getUniqueName(`${node.var}_is_paused`);
			block.addVariable(last, 'true');

			updateConditions.push(`${last} !== (${last} = ${snippet})`);
			updateDom = `${node.var}[${last} ? "pause" : "play"]();`;
			initialUpdate = null;
		}

		// bind:offsetWidth and bind:offsetHeight
		if (dimensions.test(this.node.name)) {
			initialUpdate = null;
			updateDom = null;
		}

		const dependencyArray = [...this.value.dependencies]

		if (dependencyArray.length === 1) {
			updateConditions.push(`changed.${dependencyArray[0]}`)
		} else if (dependencyArray.length > 1) {
			updateConditions.push(
				`(${dependencyArray.map(prop => `changed.${prop}`).join(' || ')})`
			)
		}

		this.object = name;
		this.handler = handler;
		this.updateDom = updateDom;
		this.initialUpdate = initialUpdate;
		this.needsLock = !isReadOnly && needsLock;
		this.updateCondition = updateConditions.length ? updateConditions.join(' && ') : undefined;
		this.isReadOnlyMediaAttribute = readOnlyMediaAttributes.has(this.node.name);
	}

	render(block: Block) {

	}
}

function isComputed(node: Node) {
	while (node.type === 'MemberExpression') {
		if (node.computed) return true;
		node = node.object;
	}

	return false;
}