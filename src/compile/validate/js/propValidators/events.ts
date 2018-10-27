import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
import { Node } from '../../../../interfaces';
import Component from '../../../Component';

export default function events(component: Component, prop: Node) {
	if (prop.value.type !== 'ObjectExpression') {
		component.error(prop, {
			code: `invalid-events-property`,
			message: `The 'events' property must be an object literal`
		});
	}

	checkForDupes(component, prop.value.properties);
	checkForComputedKeys(component, prop.value.properties);
}
