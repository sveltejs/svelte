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
	bindingGroup: number;

	events = ['change'];

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
		block: Block,
		element: ElementWrapper,
		binding_lookup: Record<string, Binding>
	) {
		super(block, element, binding_lookup.group);

		// TODO handle cases involving computed member expressions
		const { parts } = flattenReference(this.binding.value.node);
		const keypath = parts.join('.');

		// TODO handle contextual bindings — `keypath` should include unique ID of
		// each block that provides context
		let index = element.renderer.bindingGroups.indexOf(keypath);
		if (index === -1) {
			index = element.renderer.bindingGroups.length;
			element.renderer.bindingGroups.push(keypath);
		}

		this.bindingGroup = index;
	}

	fromDom() {
		return `${this.element.var}.__value`;
	}

	toDom() {
		const condition = `${this.element.var}.__value === ${this.binding.value.snippet}`;

		return `${this.element.var}.checked = ${condition};`
	}

	render(block: Block) {
		block.builders.hydrate.addLine(
			`#component._bindingGroups[${this.bindingGroup}].push(${this.element.var});`
		);

		block.builders.destroy.addLine(
			`#component._bindingGroups[${this.bindingGroup}].splice(#component._bindingGroups[${this.bindingGroup}].indexOf(${this.element.var}), 1);`
		);

		super.render(block);
	}
}