import usesThisOrArguments from '../utils/usesThisOrArguments.js';

export default function onteardown ( validator, prop ) {
	if ( prop.value.type === 'ArrowFunctionExpression' ) {
		if ( usesThisOrArguments( prop.value.body ) ) {
			validator.error( `'onteardown' should be a function expression, not an arrow function expression`, prop.start );
		}
	}
}
