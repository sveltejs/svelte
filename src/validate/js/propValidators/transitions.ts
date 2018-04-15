import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function transitions(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		validator.error(prop, {
			code: `invalid-property`,
			message: `The 'transitions' property must be an object literal`
		});
	}

	checkForDupes(validator, prop.value.properties);
	checkForComputedKeys(validator, prop.value.properties);

	prop.value.properties.forEach(() => {
		// TODO probably some validation that can happen here...
		// checking for use of `this` etc?
	});
}
