export default function flatten ( node ) {
	const parts = [];
	while ( node.type === 'MemberExpression' ) {
		if ( node.computed ) return null;
		parts.unshift( node.property.name );

		node = node.object;
	}

	if ( node.type !== 'Identifier' ) return null;

	const name = node.name;
	parts.unshift( name );

	return { name, keypath: parts.join( '.' ) };
}
