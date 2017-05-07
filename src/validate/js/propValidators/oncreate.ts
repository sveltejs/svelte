import usesThisOrArguments from '../utils/usesThisOrArguments.ts';

export default function oncreate ( validator, prop ) {
	if ( prop.value.type === 'ArrowFunctionExpression' ) {
		if ( usesThisOrArguments( prop.value.body ) ) {
			validator.error( `'oncreate' should be a function expression, not an arrow function expression`, prop.start );
		}
	}
}
