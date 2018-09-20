import Binding from '../../../../nodes/Binding';
import Element from '../../../../nodes/Element';
import ElementWrapper from '..';
import Block from '../../../Block';
import BindingWrapper from './Binding';

export default class InputTextBinding extends BindingWrapper {
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
		super(element);
	}

	render(block: Block) {

	}
}