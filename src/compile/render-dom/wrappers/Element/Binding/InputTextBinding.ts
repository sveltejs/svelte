import Binding from '../../../../nodes/Binding';
import Element from '../../../../nodes/Element';
import ElementWrapper from '..';
import BindingWrapper from './Binding';

export default class InputTextBinding extends BindingWrapper {
	events = ['input'];

	static filter(
		node: Element,
		binding_lookup: Record<string, Binding>,
		type: string
	) {
		if (node.name === 'textarea' && binding_lookup.value) {
			return true;
		}

		if (node.name === 'input' && binding_lookup.value) {
			return !/radio|checkbox|range/.test(type);
		}
	}

	constructor(
		element: ElementWrapper,
		binding_lookup: Record<string, Binding>
	) {
		super(element, binding_lookup.value);
		this.needsLock = true;
	}

	fromDom() {
		return `${this.element.var}.value`;
	}

	toDom() {
		return `${this.element.var}.value = ${this.binding.value.snippet};`;
	}
}