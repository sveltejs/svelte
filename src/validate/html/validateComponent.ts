import * as namespaces from '../../utils/namespaces';
import validateEventHandler from './validateEventHandler';
import validate, { Validator } from '../index';
import { Node } from '../../interfaces';

export default function validateComponent(
	validator: Validator,
	node: Node,
	refs: Map<string, Node[]>,
	refCallees: Node[],
	stack: Node[],
	elementStack: Node[]
) {
	if (node.name !== 'svelte:self' && node.name !== 'svelte:component' && !validator.components.has(node.name)) {
		validator.error(node, {
			code: `missing-component`,
			message: `${node.name} component is not defined`
		});
	}

	validator.used.components.add(node.name);

	node.attributes.forEach((attribute: Node) => {
		if (attribute.type === 'Ref') {
			if (!refs.has(attribute.name)) refs.set(attribute.name, []);
			refs.get(attribute.name).push(node);
		}

		if (attribute.type === 'EventHandler') {
			validator.used.events.add(attribute.name);
			validateEventHandler(validator, attribute, refCallees);
		} else if (attribute.type === 'Transition') {
			validator.error(attribute, {
				code: `invalid-transition`,
				message: `Transitions can only be applied to DOM elements, not components`
			});
		} else if (attribute.type === 'Action') {
			validator.error(attribute, {
				code: `invalid-action`,
				message: `Actions can only be applied to DOM elements, not components`
			});
		}
	});
}