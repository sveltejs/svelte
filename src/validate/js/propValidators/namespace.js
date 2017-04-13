import * as namespaces from '../../../utils/namespaces.js';
import FuzzySet from '../utils/FuzzySet.js';

const fuzzySet = new FuzzySet( namespaces.validNamespaces );
const valid = new Set( namespaces.validNamespaces );

export default function namespace ( validator, prop ) {
	const ns = prop.value.value;

	if ( prop.value.type !== 'Literal' || typeof ns !== 'string' ) {
		validator.error( `The 'namespace' property must be a string literal representing a valid namespace`, prop.start );
	}

	if ( !valid.has( ns ) ) {
		const matches = fuzzySet.get( ns );
		if ( matches && matches[0] && matches[0][0] > 0.7 ) {
			validator.error( `Invalid namespace '${ns}' (did you mean '${matches[0][1]}'?)`, prop.start );
		} else {
			validator.error( `Invalid namespace '${ns}'`, prop.start );
		}
	}
}
