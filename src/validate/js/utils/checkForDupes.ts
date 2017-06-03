import { Validator } from '../../';
import { Node } from '../../../interfaces';

export default function checkForDupes(
	validator: Validator,
	properties: Node[]
) {
	const seen = new Set();

	properties.forEach(prop => {
		if (seen.has(prop.key.name)) {
			validator.error(`Duplicate property '${prop.key.name}'`, prop.start);
		}

		seen.add(prop.key.name);
	});
}
