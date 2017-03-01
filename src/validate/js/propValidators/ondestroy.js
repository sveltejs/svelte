import usesThisOrArguments from '../utils/usesThisOrArguments.js';

export default function ondestroy ( validator, prop ) {
	if ( prop.value.type === 'ArrowFunctionExpression' ) {
		if ( usesThisOrArguments( prop.value.body ) ) {
			validator.error( `'ondestroy' should be a function expression, not an arrow function expression`, prop.start );
		}
	}
}
