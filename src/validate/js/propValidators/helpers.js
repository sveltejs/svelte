import checkForDupes from '../utils/checkForDupes.js';
import checkForComputedKeys from '../utils/checkForComputedKeys.js';
import { walk } from 'estree-walker';

export default function helpers ( validator, prop ) {
	if ( prop.value.type !== 'ObjectExpression' ) {
		validator.error( `The 'helpers' property must be an object literal`, prop.start );
		return;
	}

	checkForDupes( validator, prop.value.properties );
	checkForComputedKeys( validator, prop.value.properties );

	prop.value.properties.forEach( prop => {
		if ( !/FunctionExpression/.test( prop.value.type ) ) return;

		let lexicalDepth = 0;
		let usesArguments = false;

		walk( prop.value.body, {
			enter ( node ) {
				if ( /^Function/.test( node.type ) ) {
					lexicalDepth += 1;
				}

				else if ( lexicalDepth === 0 ) {
					if ( node.type === 'ThisExpression' ) {
						validator.error( `Helpers should be pure functions — they do not have access to the component instance and cannot use 'this'. Did you mean to put this in 'methods'?`, node.start );
					}

					else if ( node.type === 'Identifier' && node.name === 'arguments' ) {
						usesArguments = true;
					}
				}
			},

			leave ( node ) {
				if ( /^Function/.test( node.type ) ) {
					lexicalDepth -= 1;
				}
			}
		});

		if ( prop.value.params.length === 0 && !usesArguments ) {
			validator.warn( `Helpers should be pure functions, with at least one argument`, prop.start );
		}
	});
}
