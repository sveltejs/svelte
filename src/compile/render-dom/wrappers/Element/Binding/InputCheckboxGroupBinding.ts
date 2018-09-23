import Binding from '../../../../nodes/Binding';
import Element from '../../../../nodes/Element';
import ElementWrapper from '..';
import InputRadioGroupBinding from './InputRadioGroupBinding';

export default class InputCheckboxGroupBinding extends InputRadioGroupBinding {
	element: ElementWrapper;
	node: Binding;

	static filter(
		node: Element,
		binding_lookup: Record<string, Binding>,
		type: string
	) {
		if (node.name === 'input' && binding_lookup.group) {
			return type === 'checkbox';
		}
	}

	fromDom() {
		return `@getBindingGroupValue(#component._bindingGroups[${this.bindingGroup}])`;
	}

	toDom() {
		const condition = `~${this.binding.value.snippet}.indexOf(${this.element.var}.__value)`;

		return `${this.element.var}.checked = ${condition};`;
	}
}