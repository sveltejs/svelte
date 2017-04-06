import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import getBuilders from '../utils/getBuilders.js';
import visit from '../visit.js';

export default function visitEachBlock ( generator, node ) {
	const name = generator.getUniqueName( `each_block` );
	const renderer = generator.getUniqueName( `render_each_block` );
	const elseName = generator.getUniqueName( `${name}_else` );
	const renderElse = generator.getUniqueName( `${renderer}_else` );
	const i = generator.current.getUniqueName( `i` );
	const params = generator.current.params.join( ', ' );

	const listName = generator.current.getUniqueName( `${name}_value` );

	const isToplevel = generator.current.localElementDepth === 0;

	generator.addSourcemapLocations( node.expression );

	const { dependencies, snippet } = generator.contextualise( node.expression );

	const anchor = generator.current.getUniqueName( `${name}_anchor` );
	generator.createAnchor( anchor );

	const localVars = {};

	localVars.iteration = generator.current.getUniqueName( `${name}_iteration` );
	localVars.iterations = generator.current.getUniqueName( `${name}_iterations` );
	localVars._iterations = generator.current.getUniqueName( `_${name}_iterations` );
	localVars.lookup = generator.current.getUniqueName( `${name}_lookup` );
	localVars._lookup = generator.current.getUniqueName( `_${name}_lookup` );

	generator.current.builders.create.addLine( `var ${listName} = ${snippet};` );
	generator.current.builders.create.addLine( `var ${localVars.iterations} = [];` );
	if ( node.key ) generator.current.builders.create.addLine( `var ${localVars.lookup} = Object.create( null );` );
	if ( node.else ) generator.current.builders.create.addLine( `var ${elseName} = null;` );

	const initialRender = new CodeBuilder();

	if ( node.key ) {
		localVars.fragment = generator.current.getUniqueName( 'fragment' );
		localVars.value = generator.current.getUniqueName( 'value' );
		localVars.key = generator.current.getUniqueName( 'key' );

		initialRender.addBlock( deindent`
			var ${localVars.key} = ${listName}[${i}].${node.key};
			${localVars.iterations}[${i}] = ${localVars.lookup}[ ${localVars.key} ] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${generator.current.component}${node.key ? `, ${localVars.key}` : `` } );
		` );
	} else {
		initialRender.addLine(
			`${localVars.iterations}[${i}] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${generator.current.component} );`
		);
	}

	if ( !isToplevel ) {
		initialRender.addLine(
			`${localVars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );`
		);
	}

	generator.current.builders.create.addBlock( deindent`
		for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
			${initialRender}
		}
	` );

	if ( node.else ) {
		generator.current.builders.create.addBlock( deindent`
			if ( !${listName}.length ) {
				${elseName} = ${renderElse}( ${params}, ${generator.current.component} );
				${!isToplevel ? `${elseName}.mount( ${anchor}.parentNode, ${anchor} );` : ''}
			}
		` );
	}

	if ( isToplevel ) {
		generator.current.builders.mount.addBlock( deindent`
			for ( var ${i} = 0; ${i} < ${localVars.iterations}.length; ${i} += 1 ) {
				${localVars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );
			}
		` );
		if ( node.else ) {
			generator.current.builders.mount.addBlock( deindent`
				if ( ${elseName} ) {
					${elseName}.mount( ${anchor}.parentNode, ${anchor} );
				}
			` );
		}
	}

	if ( node.key ) {
		generator.current.builders.update.addBlock( deindent`
			var ${listName} = ${snippet};
			var ${localVars._iterations} = [];
			var ${localVars._lookup} = Object.create( null );

			var ${localVars.fragment} = document.createDocumentFragment();

			// create new iterations as necessary
			for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
				var ${localVars.value} = ${listName}[${i}];
				var ${localVars.key} = ${localVars.value}.${node.key};

				if ( ${localVars.lookup}[ ${localVars.key} ] ) {
					${localVars._iterations}[${i}] = ${localVars._lookup}[ ${localVars.key} ] = ${localVars.lookup}[ ${localVars.key} ];
					${localVars._lookup}[ ${localVars.key} ].update( changed, ${params}, ${listName}, ${listName}[${i}], ${i} );
				} else {
					${localVars._iterations}[${i}] = ${localVars._lookup}[ ${localVars.key} ] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${generator.current.component}${node.key ? `, ${localVars.key}` : `` } );
				}

				${localVars._iterations}[${i}].mount( ${localVars.fragment}, null );
			}

			// remove old iterations
			for ( var ${i} = 0; ${i} < ${localVars.iterations}.length; ${i} += 1 ) {
				var ${localVars.iteration} = ${localVars.iterations}[${i}];
				if ( !${localVars._lookup}[ ${localVars.iteration}.key ] ) {
					${localVars.iteration}.destroy( true );
				}
			}

			${anchor}.parentNode.insertBefore( ${localVars.fragment}, ${anchor} );

			${localVars.iterations} = ${localVars._iterations};
			${localVars.lookup} = ${localVars._lookup};
		` );
	} else {
		generator.current.builders.update.addBlock( deindent`
			var ${listName} = ${snippet};

			for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
				if ( !${localVars.iterations}[${i}] ) {
					${localVars.iterations}[${i}] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${generator.current.component} );
					${localVars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );
				} else {
					${localVars.iterations}[${i}].update( changed, ${params}, ${listName}, ${listName}[${i}], ${i} );
				}
			}

			destroyEach( ${localVars.iterations}, true, ${listName}.length );

			${localVars.iterations}.length = ${listName}.length;
		` );
	}

	if ( node.else ) {
		generator.current.builders.update.addBlock( deindent`
			if ( !${listName}.length && ${elseName} ) {
				${elseName}.update( changed, ${params} );
			} else if ( !${listName}.length ) {
				${elseName} = ${renderElse}( ${params}, ${generator.current.component} );
				${elseName}.mount( ${anchor}.parentNode, ${anchor} );
			} else if ( ${elseName} ) {
				${elseName}.destroy( true );
			}
		` );
	}

	generator.current.builders.destroy.addBlock(
		`${generator.helper( 'destroyEach' )}( ${localVars.iterations}, ${isToplevel ? 'detach' : 'false'} );` );

	if ( node.else ) {
		generator.current.builders.destroy.addBlock( deindent`
			if ( ${elseName} ) {
				${elseName}.destroy( ${isToplevel ? 'detach' : 'false'} );
			}
		` );
	}

	if ( node.else ) {
		generator.generateBlock( node.else, renderElse, 'block' );
	}

	const indexNames = new Map( generator.current.indexNames );
	const indexName = node.index || generator.current.getUniqueName( `${node.context}_index` );
	indexNames.set( node.context, indexName );

	const listNames = new Map( generator.current.listNames );
	listNames.set( node.context, listName );

	const context = generator.getUniqueName( node.context );
	const contexts = new Map( generator.current.contexts );
	contexts.set( node.context, context );

	const indexes = new Map( generator.current.indexes );
	if ( node.index ) indexes.set( indexName, node.context );

	const contextDependencies = new Map( generator.current.contextDependencies );
	contextDependencies.set( node.context, dependencies );

	const blockParams = generator.current.params.concat( listName, context, indexName );

	const getUniqueName = generator.getUniqueNameMaker( blockParams );

	const childFragment = generator.current.child({
		type: 'block',
		name: renderer,
		target: 'target',
		expression: node.expression,
		context: node.context,
		key: node.key,
		localElementDepth: 0,

		component: getUniqueName( 'component' ),

		contextDependencies,
		contexts,
		indexes,

		indexNames,
		listNames,
		params: blockParams,

		builders: getBuilders(),
		getUniqueName
	});

	generator.push( childFragment );

	node.children.forEach( child => {
		visit( child, generator );
	});

	generator.addRenderer( generator.current );
	generator.pop();
}