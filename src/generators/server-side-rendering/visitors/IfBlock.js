export default {
	enter ( generator, node ) {
		const { snippet } = generator.contextualise( node.expression );

		generator.append( '${ ' + snippet + ' ? `' );

		generator.push({
			conditions: generator.current.conditions.concat( snippet )
		});
	},

	leave ( generator, node ) {
		generator.append( '` : `' );
		if ( node.else ) node.else.children.forEach( child => generator.visit( child ) );
		generator.append( '` }' );

		generator.pop();
	}
};
