export default function flatten ( node ) {
	const parts = [];
	while ( node.type === 'MemberExpression' ) {
		if ( node.computed ) return null;
		parts.unshift( node.property.name );

		node = node.object;
	}

	const name = node.type === 'Identifier' ? node.name : node.type === 'ThisExpression' ? 'this' : null;

	if ( !name ) return null;

	parts.unshift( name );
	return { name, parts, keypath: parts.join( '.' ) };
}
