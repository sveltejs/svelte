import * as namespaces from '../../../utils/namespaces';
import fuzzymatch from '../../utils/fuzzymatch';

const valid = new Set( namespaces.validNamespaces );

export default function namespace ( validator, prop ) {
	const ns = prop.value.value;

	if ( prop.value.type !== 'Literal' || typeof ns !== 'string' ) {
		validator.error( `The 'namespace' property must be a string literal representing a valid namespace`, prop.start );
	}

	if ( !valid.has( ns ) ) {
		const match = fuzzymatch( ns, namespaces.validNamespaces );
		if ( match ) {
			validator.error( `Invalid namespace '${ns}' (did you mean '${match}'?)`, prop.start );
		} else {
			validator.error( `Invalid namespace '${ns}'`, prop.start );
		}
	}
}
