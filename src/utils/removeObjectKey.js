export default function removeObjectKey ( generator, node, key ) {
	if ( node.type !== 'ObjectExpression' ) return;
	const properties = node.properties;
	const index = properties.findIndex( property => property.key.type === 'Identifier' && property.key.name === key );
	if ( index === -1 ) return;
	const a = properties[ index ].start;
	const b = index < properties.length - 1 ? properties[ index + 1 ].start : properties[ index ].end;
	generator.code.remove( a, b );
}
