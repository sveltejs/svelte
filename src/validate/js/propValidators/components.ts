import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import getName from '../../../utils/getName';
import { Validator } from '../../index';
import { Node } from '../../../interfaces';

export default function components(validator: Validator, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		validator.error(prop, {
			code: `invalid-components-property`,
			message: `The 'components' property must be an object literal`
		});
	}

	checkForDupes(validator, prop.value.properties);
	checkForComputedKeys(validator, prop.value.properties);

	prop.value.properties.forEach((component: Node) => {
		const name = getName(component.key);

		if (name === 'state') {
			// TODO is this still true?
			validator.error(component, {
				code: `invalid-name`,
				message: `Component constructors cannot be called 'state' due to technical limitations`
			});
		}

		if (!/^[A-Z]/.test(name)) {
			validator.error(component, {
				code: `component-lowercase`,
				message: `Component names must be capitalised`
			});
		}
	});
}
