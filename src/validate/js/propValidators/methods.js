import checkForDupes from '../utils/checkForDupes.js';
import checkForComputedKeys from '../utils/checkForComputedKeys.js';
import usesThisOrArguments from '../utils/usesThisOrArguments.js';

const builtin = new Set( [ 'set', 'get', 'on', 'fire', 'observe', 'teardown' ] );

export default function methods ( validator, prop ) {
	if ( prop.value.type !== 'ObjectExpression' ) {
		validator.error( `The 'methods' property must be an object literal`, prop.start );
		return;
	}

	checkForDupes( validator, prop.value.properties );
	checkForComputedKeys( validator, prop.value.properties );

	prop.value.properties.forEach( prop => {
		if ( builtin.has( prop.key.name ) ) {
			validator.error( `Cannot overwrite built-in method '${prop.key.name}'` );
		}

		if ( prop.value.type === 'ArrowFunctionExpression' ) {
			if ( usesThisOrArguments( prop.value.body ) ) {
				validator.error( `Method '${prop.key.name}' should be a function expression, not an arrow function expression`, prop.start );
			}
		}
	});
}
