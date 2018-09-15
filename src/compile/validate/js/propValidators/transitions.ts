import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function transitions(component: Component, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		component.error(prop, {
			code: `invalid-transitions-property`,
			message: `The 'transitions' property must be an object literal`
		});
	}

	checkForDupes(component, prop.value.properties);
	checkForComputedKeys(component, prop.value.properties);

	prop.value.properties.forEach(() => {
		// TODO probably some validation that can happen here...
		// checking for use of `this` etc?
	});
}
