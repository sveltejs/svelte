import flattenReference from '../../utils/flattenReference';
import fuzzymatch from '../utils/fuzzymatch';
import list from '../../utils/list';
import validateEventHandler from './validateEventHandler';
import { Validator } from '../index';
import { Node } from '../../interfaces';

const descriptions = {
	Bindings: 'two-way bindings',
	EventHandler: 'event handlers',
	Transition: 'transitions',
	Ref: 'refs'
};

export default function validateWindow(validator: Validator, node: Node, refs: Map<string, Node[]>, refCallees: Node[]) {
	node.attributes.forEach((attribute: Node) => {
		if (attribute.type === 'Attribute') {
			if (attribute.name !== 'title') {
				validator.error(
					`<:Document> can only have a 'title' attribute`,
					attribute.start
				);
			}
		}

		else {
			const description = descriptions[attribute.type];
			if (description) {
				validator.error(
					`<:Document> does not support ${description}`,
					attribute.start
				);
			} else {
				// future-proofing
				validator.error(
					`<:Document> can only have a 'title' attribute`,
					attribute.start
				);
			}
		}
	});
}
