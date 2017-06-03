import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function transitions(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		validator.error(
			`The 'transitions' property must be an object literal`,
			prop.start
		);
		return;
	}

	checkForDupes(validator, prop.value.properties);
	checkForComputedKeys(validator, prop.value.properties);

	prop.value.properties.forEach(() => {
		// TODO probably some validation that can happen here...
		// checking for use of `this` etc?
	});
}
