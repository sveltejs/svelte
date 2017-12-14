import { Validator } from '../index';
import { Node } from '../../interfaces';

export default function validateHead(validator: Validator, node: Node, refs: Map<string, Node[]>, refCallees: Node[]) {
	if (node.attributes.length) {
		validator.error(`<:Head> should not have any attributes or directives`, node.start);
	}
}
