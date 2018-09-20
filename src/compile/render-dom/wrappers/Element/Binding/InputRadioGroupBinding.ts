import Binding from '../../../../nodes/Binding';
import Element from '../../../../nodes/Element';
import ElementWrapper from '..';
import Block from '../../../Block';
import Renderer from '../../../Renderer';
import flattenReference from '../../../../../utils/flattenReference';
import { Node } from '../../../../../interfaces';
import BindingWrapper from './Binding';

export default class InputRadioGroupBinding extends BindingWrapper {
	element: ElementWrapper;
	node: Binding;

	static filter(
		node: Element,
		binding_lookup: Record<string, Binding>,
		type: string
	) {
		if (node.name === 'input' && binding_lookup.group) {
			return type === 'radio';
		}
	}

	constructor(
		element: ElementWrapper,
		binding_lookup: Record<string, Binding>
	) {
		super(element, binding_lookup.group);
		this.events = ['change'];
	}

	fromDom() {
		const bindingGroup = getBindingGroup(this.element.renderer, this.binding.value.node);
		if (this.element.node.getStaticAttributeValue('type') === 'checkbox') {
			return `@getBindingGroupValue(#component._bindingGroups[${bindingGroup}])`;
		}

		return `${this.element.var}.__value`;
	}

	toDom() {
		const type = this.element.node.getStaticAttributeValue('type');

		const condition = type === 'checkbox'
			? `~${this.binding.value.snippet}.indexOf(${this.element.var}.__value)`
			: `${this.element.var}.__value === ${this.binding.value.snippet}`;

		return `${this.element.var}.checked = ${condition};`
	}

	render(block: Block) {
		const bindingGroup = getBindingGroup(
			this.element.renderer,
			this.binding.value.node
		);

		block.builders.hydrate.addLine(
			`#component._bindingGroups[${bindingGroup}].push(${this.element.var});`
		);

		block.builders.destroy.addLine(
			`#component._bindingGroups[${bindingGroup}].splice(#component._bindingGroups[${bindingGroup}].indexOf(${this.element.var}), 1);`
		);

		super.render(block);

		// this.renderHandler(block, 'TODO');
	}
}

function getBindingGroup(renderer: Renderer, value: Node) {
	const { parts } = flattenReference(value); // TODO handle cases involving computed member expressions
	const keypath = parts.join('.');

	// TODO handle contextual bindings — `keypath` should include unique ID of
	// each block that provides context
	let index = renderer.bindingGroups.indexOf(keypath);
	if (index === -1) {
		index = renderer.bindingGroups.length;
		renderer.bindingGroups.push(keypath);
	}

	return index;
}