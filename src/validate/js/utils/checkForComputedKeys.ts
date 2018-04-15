import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function checkForComputedKeys(
	validator: Validator,
	properties: Node[]
) {
	properties.forEach(prop => {
		if (prop.key.computed) {
			validator.error(prop, {
				code: `computed-key`,
				message: `Cannot use computed keys`
			});
		}
	});
}
