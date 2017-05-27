import { Node } from '../interfaces';

export default function flatten ( node: Node ) {
	const parts = [];
	const propEnd = node.end;

	while ( node.type === 'MemberExpression' ) {
		if ( node.computed ) return null;
		parts.unshift( node.property.name );

		node = node.object;
	}

	const propStart = node.end;
	const name = node.type === 'Identifier' ? node.name : node.type === 'ThisExpression' ? 'this' : null;

	if ( !name ) return null;

	parts.unshift( name );
	return { name, parts, keypath: `${name}[✂${propStart}-${propEnd}✂]` };
}
