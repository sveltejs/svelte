import visit from '../visit.js';

export default function visitEachBlock ( generator, fragment, node ) {
	const { dependencies, snippet } = generator.contextualise( fragment, node.expression );

	const open = `\${ ${snippet}.map( ${ node.index ? `( ${node.context}, ${node.index} )` : node.context} => \``;
	generator.append( open );

	// TODO should this be the generator's job? It's duplicated between
	// here and the equivalent DOM compiler visitor
	const contexts = new Map( fragment.contexts );
	contexts.set( node.context, node.context );

	const indexes = new Map( fragment.indexes );
	if ( node.index ) indexes.set( node.index, node.context );

	const contextDependencies = new Map( fragment.contextDependencies );
	contextDependencies.set( node.context, dependencies );

	const childFragment = fragment.child({
		contexts,
		indexes,
		contextDependencies
	});

	node.children.forEach( child => {
		visit( generator, childFragment, child );
	});

	const close = `\` ).join( '' )}`;
	generator.append( close );
}