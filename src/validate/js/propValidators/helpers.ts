import checkForDupes from '../utils/checkForDupes';
import checkForComputedKeys from '../utils/checkForComputedKeys';
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
					// handle special case that's caused some people confusion — using `this.get(...)` instead of passing argument
					// TODO do the same thing for computed values?
					if ( node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.object.type === 'ThisExpression' && node.callee.property.name === 'get' && !node.callee.property.computed ) {
						validator.error( `Cannot use this.get(...) — it must be passed into the helper function as an argument`, node.start );
					}

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
