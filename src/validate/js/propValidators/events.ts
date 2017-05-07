import checkForDupes from '../utils/checkForDupes.ts';
import checkForComputedKeys from '../utils/checkForComputedKeys.ts';

export default function events ( validator, prop ) {
	if ( prop.value.type !== 'ObjectExpression' ) {
		validator.error( `The 'events' property must be an object literal`, prop.start );
		return;
	}

	checkForDupes( validator, prop.value.properties );
	checkForComputedKeys( validator, prop.value.properties );
}
