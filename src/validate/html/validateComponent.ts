import * as namespaces from '../../utils/namespaces';
import validateEventHandler from './validateEventHandler';
import validate, { Validator } from '../index';
import { Node } from '../../interfaces';
import isValidIdentifier from '../../utils/isValidIdentifier';

export default function validateComponent(
	validator: Validator,
	node: Node,
	refs: Map<string, Node[]>,
	refCallees: Node[],
	stack: Node[],
	elementStack: Node[]
) {
	node.attributes.forEach((attribute: Node) => {
		if (attribute.type === 'Action') {
			validator.error(attribute, {
				code: `invalid-action`,
				message: `Actions can only be applied to DOM elements, not components`
			});
		} else if (attribute.type === 'Class') {
			validator.error(attribute, {
				code: `invalid-class`,
				message: `Classes can only be applied to DOM elements, not components`
			});
		}
	});
}
