import InputNumberBinding from './InputNumberBinding';
import Binding from '../../../../nodes/Binding';
import Element from '../../../../nodes/Element';

export default class InputRangeBinding extends InputNumberBinding {
	events = ['input', 'change'];

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
}