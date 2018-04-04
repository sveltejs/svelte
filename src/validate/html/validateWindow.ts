import flattenReference from '../../utils/flattenReference';
import fuzzymatch from '../utils/fuzzymatch';
import list from '../../utils/list';
import validateEventHandler from './validateEventHandler';
import { Validator } from '../index';
import { Node } from '../../interfaces';

const validBindings = [
	'innerWidth',
	'innerHeight',
	'outerWidth',
	'outerHeight',
	'scrollX',
	'scrollY',
	'online'
];

export default function validateWindow(validator: Validator, node: Node, refs: Map<string, Node[]>, refCallees: Node[]) {
	node.attributes.forEach((attribute: Node) => {
		if (attribute.type === 'Binding') {
			if (attribute.value.type !== 'Identifier') {
				const { parts } = flattenReference(attribute.value);

				validator.error(
					`Bindings on <:Window/> must be to top-level properties, e.g. '${parts[
						parts.length - 1
					]}' rather than '${parts.join('.')}'`,
					attribute.value
				);
			}

			if (!~validBindings.indexOf(attribute.name)) {
				const match = attribute.name === 'width'
					? 'innerWidth'
					: attribute.name === 'height'
						? 'innerHeight'
						: fuzzymatch(attribute.name, validBindings);

				const message = `'${attribute.name}' is not a valid binding on <:Window>`;

				if (match) {
					validator.error(
						`${message} (did you mean '${match}'?)`,
						attribute
					);
				} else {
					validator.error(
						`${message} — valid bindings are ${list(validBindings)}`,
						attribute
					);
				}
			}
		} else if (attribute.type === 'EventHandler') {
			validator.used.events.add(attribute.name);
			validateEventHandler(validator, attribute, refCallees);
		}
	});
}
