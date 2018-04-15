import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function checkForAccessors(
	validator: Validator,
	properties: Node[],
	label: string
) {
	properties.forEach(prop => {
		if (prop.kind !== 'init') {
			validator.error(prop, {
				code: `illegal-accessor`,
				message: `${label} cannot use getters and setters`
			});
		}
	});
}
