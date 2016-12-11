import usesThisOrArguments from '../utils/usesThisOrArguments.js';

export default function onrender ( validator, prop ) {
	if ( prop.value.type === 'ArrowFunctionExpression' ) {
		if ( usesThisOrArguments( prop.value.body ) ) {
			validator.error( `'onrender' should be a function expression, not an arrow function expression`, prop.start );
		}
	}
}
