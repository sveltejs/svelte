export default {
	enter ( generator, node ) {
		const { dependencies, snippet } = generator.contextualise( node.expression );

		const open = `\${ ${snippet}.map( ${ node.index ? `( ${node.context}, ${node.index} )` : node.context} => \``;
		generator.append( open );

		// TODO should this be the generator's job? It's duplicated between
		// here and the equivalent DOM compiler visitor
		const contexts = Object.assign( {}, generator.current.contexts );
		contexts[ node.context ] = true;

		const indexes = Object.assign( {}, generator.current.indexes );
		if ( node.index ) indexes[ node.index ] = node.context;

		const contextDependencies = Object.assign( {}, generator.current.contextDependencies );
		contextDependencies[ node.context ] = dependencies;

		generator.push({
			contexts,
			indexes,
			contextDependencies
		});
	},

	leave ( generator ) {
		const close = `\` ).join( '' )}`;
		generator.append( close );

		generator.pop();
	}
};
