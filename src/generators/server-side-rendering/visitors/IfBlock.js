import visit from '../visit.js';

export default function visitIfBlock ( generator, block, node ) {
	const { snippet } = generator.contextualise( block, node.expression );

	generator.append( '${ ' + snippet + ' ? `' );

	const childBlock = block.child({
		conditions: block.conditions.concat( snippet )
	});

	node.children.forEach( child => {
		visit( generator, childBlock, child );
	});

	generator.append( '` : `' );

	if ( node.else ) {
		node.else.children.forEach( child => {
			visit( generator, childBlock, child );
		});
	}

	generator.append( '` }' );
}