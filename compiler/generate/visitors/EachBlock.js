import deindent from '../utils/deindent.js';
import counter from '../utils/counter.js';

export default {
	enter ( generator, node ) {
		const i = generator.counters.each++;
		const name = `eachBlock_${i}`;
		const iterations = `${name}_iterations`;
		const renderer = `renderEachBlock_${i}`;

		const listName = `${name}_value`;

		const isToplevel = generator.current.localElementDepth === 0;

		generator.addSourcemapLocations( node.expression );

		const { dependencies, snippet } = generator.contextualise( node.expression );

		const anchor = generator.createAnchor( name, `#each ${generator.source.slice( node.expression.start, node.expression.end )}` );

		generator.current.initStatements.push( deindent`
			var ${name}_value = ${snippet};
			var ${iterations} = [];

			for ( var i = 0; i < ${name}_value.length; i += 1 ) {
				${iterations}[i] = ${renderer}( ${generator.current.params}, ${listName}, ${listName}[i], i, component );
				${!isToplevel ? `${iterations}[i].mount( ${anchor}.parentNode, ${anchor} );` : ''}
			}
		` );

		if ( isToplevel ) {
			generator.current.mountStatements.push( deindent`
				for ( var i = 0; i < ${iterations}.length; i += 1 ) {
					${iterations}[i].mount( ${anchor}.parentNode, ${anchor} );
				}
			` );
		}

		generator.current.updateStatements.push( deindent`
			var ${name}_value = ${snippet};

			for ( var i = 0; i < ${name}_value.length; i += 1 ) {
				if ( !${iterations}[i] ) {
					${iterations}[i] = ${renderer}( ${generator.current.params}, ${listName}, ${listName}[i], i, component );
					${iterations}[i].mount( ${anchor}.parentNode, ${anchor} );
				} else {
					${iterations}[i].update( changed, ${generator.current.params}, ${listName}, ${listName}[i], i );
				}
			}

			for ( var i = ${name}_value.length; i < ${iterations}.length; i += 1 ) {
				${iterations}[i].teardown( true );
			}

			${iterations}.length = ${listName}.length;
		` );

		generator.current.teardownStatements.push( deindent`
			for ( var i = 0; i < ${iterations}.length; i += 1 ) {
				${iterations}[i].teardown( ${isToplevel ? 'detach' : 'false'} );
			}
		` );

		const indexNames = Object.assign( {}, generator.current.indexNames );
		const indexName = indexNames[ node.context ] = ( node.index || `${node.context}__index` );

		const listNames = Object.assign( {}, generator.current.listNames );
		listNames[ node.context ] = listName;

		const contexts = Object.assign( {}, generator.current.contexts );
		contexts[ node.context ] = true;

		const indexes = Object.assign( {}, generator.current.indexes );
		if ( node.index ) indexes[ indexName ] = node.context;

		const contextDependencies = Object.assign( {}, generator.current.contextDependencies );
		contextDependencies[ node.context ] = dependencies;

		const params = generator.current.params + `, ${listName}, ${node.context}, ${indexName}`;

		generator.push({
			useAnchor: false,
			name: renderer,
			target: 'target',
			expression: node.expression,
			context: node.context,
			localElementDepth: 0,

			contextDependencies,
			contexts,
			indexes,

			indexNames,
			listNames,
			params,

			initStatements: [],
			mountStatements: [],
			updateStatements: [ Object.keys( contexts ).map( contextName => {
				const listName = listNames[ contextName ];
				const indexName = indexNames[ contextName ];

				return `var ${contextName} = ${listName}[${indexName}];`;
			}).join( '\n' ) ],
			detachStatements: [],
			teardownStatements: [],

			counter: counter(),

			parent: generator.current
		});
	},

	leave ( generator ) {
		generator.addRenderer( generator.current );
		generator.pop();
	}
};
