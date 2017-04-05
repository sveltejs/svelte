import visit from '../visit.js';

export default {
	enter ( generator, node ) {
		const { dependencies, snippet } = generator.contextualise( node.expression );

		const open = `\${ ${snippet}.map( ${ node.index ? `( ${node.context}, ${node.index} )` : node.context} => \``;
		generator.append( open );

		// TODO should this be the generator's job? It's duplicated between
		// here and the equivalent DOM compiler visitor
		const contexts = new Map( generator.current.contexts );
		contexts.set( node.context, node.context );

		const indexes = new Map( generator.current.indexes );
		if ( node.index ) indexes.set( node.index, node.context );

		const contextDependencies = new Map( generator.current.contextDependencies );
		contextDependencies.set( node.context, dependencies );

		generator.push({
			contexts,
			indexes,
			contextDependencies
		});

		node.children.forEach( child => {
			visit( child, generator );
		});

		const close = `\` ).join( '' )}`;
		generator.append( close );

		generator.pop();
	}
};
