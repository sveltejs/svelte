import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function checkForComputedKeys(
	validator: Validator,
	properties: Node[]
) {
	properties.forEach(prop => {
		if (prop.key.computed) {
			validator.error(`Cannot use computed keys`, prop.start);
		}
	});
}
