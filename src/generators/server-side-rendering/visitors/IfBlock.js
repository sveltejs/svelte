import visit from '../visit.js';

export default function visitIfBlock ( generator, fragment, node ) {
	const { snippet } = generator.contextualise( fragment, node.expression );

	generator.append( '${ ' + snippet + ' ? `' );

	const childFragment = fragment.child({
		conditions: fragment.conditions.concat( snippet )
	});

	node.children.forEach( child => {
		visit( generator, childFragment, child );
	});

	generator.append( '` : `' );

	if ( node.else ) {
		node.else.children.forEach( child => {
			visit( generator, childFragment, child );
		});
	}

	generator.append( '` }' );
}