import { walk } from 'estree-walker';
import isReference from '../../../utils/isReference.js';

export default function usesThisOrArguments ( node ) {
	let result = false;

	walk( node, {
		enter ( node ) {
			if ( result || node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration' ) {
				return this.skip();
			}

			if ( node.type === 'ThisExpression' ) {
				result = true;
			}

			if ( node.type === 'Identifier' && isReference( node ) && node.name === 'arguments' ) {
				result = true;
			}
		}
	});

	return result;
}
