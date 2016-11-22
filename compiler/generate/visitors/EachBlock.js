import deindent from '../utils/deindent.js';
import counter from '../utils/counter.js';

export default {
	enter ( generator, node ) {
		const i = generator.counters.each++;
		const name = `eachBlock_${i}`;
		const renderer = `renderEachBlock_${i}`;

		const listName = `${name}_value`;

		generator.current.initStatements.push( deindent`
			var ${name}_anchor = document.createComment( ${JSON.stringify( `#each ${generator.source.slice( node.expression.start, node.expression.end )}` )} );
			${generator.current.target}.appendChild( ${name}_anchor );
			var ${name}_iterations = [];
			const ${name}_fragment = document.createDocumentFragment();
		` );

		generator.addSourcemapLocations( node.expression );

		generator.contextualise( node.expression );
		const snippet = `[✂${node.expression.start}-${node.expression.end}✂]`;

		generator.current.updateStatements.push( deindent`
			var ${name}_value = ${snippet};

			for ( var i = 0; i < ${name}_value.length; i += 1 ) {
				if ( !${name}_iterations[i] ) {
					${name}_iterations[i] = ${renderer}( component, ${name}_fragment );
				}

				const iteration = ${name}_iterations[i];
				${name}_iterations[i].update( ${generator.current.contextChain.join( ', ' )}, ${listName}, ${listName}[i], i );
			}

			for ( var i = ${name}_value.length; i < ${name}_iterations.length; i += 1 ) {
				${name}_iterations[i].teardown();
			}

			${name}_anchor.parentNode.insertBefore( ${name}_fragment, ${name}_anchor );
			${name}_iterations.length = ${listName}.length;
		` );

		generator.current.teardownStatements.push( deindent`
			for ( let i = 0; i < ${name}_iterations.length; i += 1 ) {
				${name}_iterations[i].teardown();
			}

			${name}_anchor.parentNode.removeChild( ${name}_anchor );
		` );

		const indexNames = Object.assign( {}, generator.current.indexNames );
		const indexName = indexNames[ node.context ] = ( node.index || `${node.context}__index` );

		const listNames = Object.assign( {}, generator.current.listNames );
		listNames[ node.context ] = listName;

		const contexts = Object.assign( {}, generator.current.contexts );
		contexts[ node.context ] = true;

		const indexes = Object.assign( {}, generator.current.indexes );
		if ( node.index ) indexes[ indexName ] = node.context;

		const contextChain = generator.current.contextChain.concat( listName, node.context, indexName );

		generator.current = {
			useAnchor: false,
			name: renderer,
			target: 'target',
			expression: node.expression,
			context: node.context,

			contexts,
			indexes,

			indexNames,
			listNames,
			contextChain,

			initStatements: [],
			updateStatements: [ Object.keys( contexts ).map( contextName => {
				const listName = listNames[ contextName ];
				const indexName = indexNames[ contextName ];

				return `var ${contextName} = ${listName}[${indexName}];`;
			}).join( '\n' ) ],
			teardownStatements: [],

			counter: counter(),

			parent: generator.current
		};
	},

	leave ( generator ) {
		generator.addRenderer( generator.current );
		generator.current = generator.current.parent;
	}
};
