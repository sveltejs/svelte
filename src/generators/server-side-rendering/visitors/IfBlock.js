export default {
	enter ( generator, node ) {
		const { snippet } = generator.contextualise( node.expression );
		generator.fire( 'append', '${ ' + snippet + ' ? `' );
	},

	leave ( generator, node ) {
		generator.fire( 'append', '` : `' );
		if ( node.else ) node.else.children.forEach( child => generator.visit( child ) );
		generator.fire( 'append', '` }' );
	}
};
