import InputNumberBinding from './InputNumberBinding';
import Binding from '../../../../nodes/Binding';
import Element from '../../../../nodes/Element';
import Block from '../../../Block';
import ElementWrapper from '..';

export default class InputRangeBinding extends InputNumberBinding {
	events = ['change', 'input'];

	static filter(
		node: Element,
		binding_lookup: Record<string, Binding>,
		type: string
	) {
		return (
			node.name === 'input' &&
			type === 'range' &&
			binding_lookup.value
		);
	}

	constructor(
		block: Block,
		element: ElementWrapper,
		binding_lookup: Record<string, Binding>
	) {
		super(block, element, binding_lookup);
		this.needsLock = false;
	}
}