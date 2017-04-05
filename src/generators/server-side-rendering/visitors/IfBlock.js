import visit from '../visit.js';

export default {
	enter ( generator, node ) {
		const { snippet } = generator.contextualise( node.expression );

		generator.append( '${ ' + snippet + ' ? `' );

		generator.push({
			conditions: generator.current.conditions.concat( snippet )
		});

		node.children.forEach( child => {
			visit( child, generator );
		});

		generator.append( '` : `' );

		if ( node.else ) {
			node.else.children.forEach( child => {
				visit( child, generator );
			});
		}

		generator.append( '` }' );

		generator.pop();
	}
};
