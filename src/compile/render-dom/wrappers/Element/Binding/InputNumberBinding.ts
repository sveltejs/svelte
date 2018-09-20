import Binding from '../../../../nodes/Binding';
import Element from '../../../../nodes/Element';
import ElementWrapper from '..';
import BindingWrapper from './Binding';

export default class InputNumberBinding extends BindingWrapper {
	events = ['input'];

	static filter(
		node: Element,
		binding_lookup: Record<string, Binding>,
		type: string
	) {
		return (
			node.name === 'input' &&
			type === 'number' &&
			binding_lookup.value
		);
	}

	constructor(
		element: ElementWrapper,
		binding_lookup: Record<string, Binding>
	) {
		super(element, binding_lookup.value);
		this.needsLock = true;
	}

	fromDom() {
		return `@toNumber(${this.element.var}.value)`;
	}

	toDom() {
		return `${this.element.var}.value = ${this.binding.value.snippet};`;
	}
}