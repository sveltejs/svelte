export default function namespace ( validator, prop ) {
	if ( prop.value.type !== 'Literal' || typeof prop.value.value !== 'string' ) {
		validator.error( `The 'namespace' property must be a string literal representing a valid namespace`, prop.start );
	}
}
