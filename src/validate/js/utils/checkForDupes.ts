import { Validator } from '../../';
import { Node } from '../../../interfaces';
import getName from '../../../utils/getName';

export default function checkForDupes(
	validator: Validator,
	properties: Node[]
) {
	const seen = new Set();

	properties.forEach(prop => {
		const name = getName(prop.key);

		if (seen.has(name)) {
			validator.error(`Duplicate property '${name}'`, { start: prop.start, end: prop.end });
		}

		seen.add(name);
	});
}
