export default function removeObjectKey ( code, parsed, key ) {
	if ( parsed.type !== 'ObjectExpression' ) return;
	const properties = parsed.properties;
	const index = properties.findIndex( property => property.key.type === 'Identifier' && property.key.name === key );
	if ( index === -1 ) return;
	const a = properties[ index ].start;
	const b = index < properties.length - 1 ? properties[ index + 1 ].start : properties[ index ].end;
	code.remove( a, b );
}
