import checkForDupes from '../utils/checkForDupes.js';
import checkForComputedKeys from '../utils/checkForComputedKeys.js';

export default function events ( validator, prop ) {
	if ( prop.value.type !== 'ObjectExpression' ) {
		validator.error( `The 'events' property must be an object literal`, prop.start );
		return;
	}

	checkForDupes( validator, prop.value.properties );
	checkForComputedKeys( validator, prop.value.properties );
}
