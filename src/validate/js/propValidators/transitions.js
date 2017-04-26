import checkForDupes from '../utils/checkForDupes.js';
import checkForComputedKeys from '../utils/checkForComputedKeys.js';

export default function transitions ( validator, prop ) {
	if ( prop.value.type !== 'ObjectExpression' ) {
		validator.error( `The 'transitions' property must be an object literal`, prop.start );
		return;
	}

	checkForDupes( validator, prop.value.properties );
	checkForComputedKeys( validator, prop.value.properties );

	prop.value.properties.forEach( () => {
		// TODO probably some validation that can happen here...
		// checking for use of `this` etc?
	});
}
