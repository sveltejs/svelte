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

				validator.error(attribute.value, {
					code: `invalid-binding`,
					message: `Bindings on <svelte:window> must be to top-level properties, e.g. '${parts[parts.length - 1]}' rather than '${parts.join('.')}'`
				});
			}

			if (!~validBindings.indexOf(attribute.name)) {
				const match = attribute.name === 'width'
					? 'innerWidth'
					: attribute.name === 'height'
						? 'innerHeight'
						: fuzzymatch(attribute.name, validBindings);

				const message = `'${attribute.name}' is not a valid binding on <svelte:window>`;

				if (match) {
					validator.error(attribute, {
						code: `invalid-binding`,
						message: `${message} (did you mean '${match}'?)`
					});
				} else {
					validator.error(attribute, {
						code: `invalid-binding`,
						message: `${message} — valid bindings are ${list(validBindings)}`
					});
				}
			}
		} else if (attribute.type === 'EventHandler') {
			validator.used.events.add(attribute.name);
			validateEventHandler(validator, attribute, refCallees);
		}
	});
}
