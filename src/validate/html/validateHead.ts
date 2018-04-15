import validateElement from './validateElement';
import { Validator } from '../index';
import { Node } from '../../interfaces';

export default function validateHead(validator: Validator, node: Node, refs: Map<string, Node[]>, refCallees: Node[]) {
	if (node.attributes.length) {
		validator.error(node.attributes[0], {
			code: `invalid-attribute`,
			message: `<:Head> should not have any attributes or directives`
		});
	}

	// TODO ensure only valid elements are included here

	node.children.forEach(node => {
		if (node.type !== 'Element') return; // TODO handle {{#if}} and friends?
		validateElement(validator, node, refs, refCallees, [], [], false);
	});
}
