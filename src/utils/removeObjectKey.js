export default function removeObjectKey ( generator, node, key ) {
	if ( node.type !== 'ObjectExpression' ) return;

	let i = node.properties.length;
	while ( i-- ) {
		const property = node.properties[i];
		if ( property.key.type === 'Identifier' && property.key.name === key ) {
			let a;
			let b;

			if ( node.properties.length === 1 ) {
				// remove everything, leave {}
				a = node.start + 1;
				b = node.end - 1;
			} else if ( i === 0 ) {
				// remove everything before second property, including comments
				a = node.start + 1;
				while ( /\s/.test( generator.code.original[a] ) ) a += 1;

				b = node.properties[i].end;
				while ( /[\s,]/.test( generator.code.original[b] ) ) b += 1;
			} else {
				// remove the end of the previous property to the end of this one
				a = node.properties[ i - 1 ].end;
				b = property.end;
			}

			generator.code.remove( a, b );
			node.properties.splice( i, 1 );
			return;
		}
	}
}
