import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function events(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		validator.error(prop, {
			code: `invalid-events-property`,
			message: `The 'events' property must be an object literal`
		});
	}

	checkForDupes(validator, prop.value.properties);
	checkForComputedKeys(validator, prop.value.properties);
}
