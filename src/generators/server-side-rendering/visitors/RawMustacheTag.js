export default {
	enter ( generator, node ) {
		const { snippet } = generator.contextualise( node.expression );
		generator.fire( 'append', '${' + snippet + '}' );
	}
};
