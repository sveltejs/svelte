import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import getBuilders from '../utils/getBuilders.js';
import visit from '../visit.js';

export default function visitEachBlock ( generator, fragment, node ) {
	const name = generator.getUniqueName( `each_block` );
	const renderer = generator.getUniqueName( `render_each_block` );
	const elseName = generator.getUniqueName( `${name}_else` );
	const renderElse = generator.getUniqueName( `${renderer}_else` );
	const i = fragment.getUniqueName( `i` );
	const params = fragment.params.join( ', ' );

	const listName = fragment.getUniqueName( `${name}_value` );

	const isToplevel = fragment.localElementDepth === 0;

	generator.addSourcemapLocations( node.expression );

	const { dependencies, snippet } = generator.contextualise( fragment, node.expression );

	const anchor = fragment.getUniqueName( `${name}_anchor` );
	fragment.createAnchor( anchor );

	const localVars = {};

	localVars.iteration = fragment.getUniqueName( `${name}_iteration` );
	localVars.iterations = fragment.getUniqueName( `${name}_iterations` );
	localVars._iterations = fragment.getUniqueName( `_${name}_iterations` );
	localVars.lookup = fragment.getUniqueName( `${name}_lookup` );
	localVars._lookup = fragment.getUniqueName( `_${name}_lookup` );

	fragment.builders.create.addLine( `var ${listName} = ${snippet};` );
	fragment.builders.create.addLine( `var ${localVars.iterations} = [];` );
	if ( node.key ) fragment.builders.create.addLine( `var ${localVars.lookup} = Object.create( null );` );
	if ( node.else ) fragment.builders.create.addLine( `var ${elseName} = null;` );

	const initialRender = new CodeBuilder();

	if ( node.key ) {
		localVars.fragment = fragment.getUniqueName( 'fragment' );
		localVars.value = fragment.getUniqueName( 'value' );
		localVars.key = fragment.getUniqueName( 'key' );

		initialRender.addBlock( deindent`
			var ${localVars.key} = ${listName}[${i}].${node.key};
			${localVars.iterations}[${i}] = ${localVars.lookup}[ ${localVars.key} ] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${fragment.component}${node.key ? `, ${localVars.key}` : `` } );
		` );
	} else {
		initialRender.addLine(
			`${localVars.iterations}[${i}] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${fragment.component} );`
		);
	}

	if ( !isToplevel ) {
		initialRender.addLine(
			`${localVars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );`
		);
	}

	fragment.builders.create.addBlock( deindent`
		for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
			${initialRender}
		}
	` );

	if ( node.else ) {
		fragment.builders.create.addBlock( deindent`
			if ( !${listName}.length ) {
				${elseName} = ${renderElse}( ${params}, ${fragment.component} );
				${!isToplevel ? `${elseName}.mount( ${anchor}.parentNode, ${anchor} );` : ''}
			}
		` );
	}

	if ( isToplevel ) {
		fragment.builders.mount.addBlock( deindent`
			for ( var ${i} = 0; ${i} < ${localVars.iterations}.length; ${i} += 1 ) {
				${localVars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );
			}
		` );
		if ( node.else ) {
			fragment.builders.mount.addBlock( deindent`
				if ( ${elseName} ) {
					${elseName}.mount( ${anchor}.parentNode, ${anchor} );
				}
			` );
		}
	}

	if ( node.key ) {
		fragment.builders.update.addBlock( deindent`
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
					${localVars._iterations}[${i}] = ${localVars._lookup}[ ${localVars.key} ] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${fragment.component}${node.key ? `, ${localVars.key}` : `` } );
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
		fragment.builders.update.addBlock( deindent`
			var ${listName} = ${snippet};

			for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
				if ( !${localVars.iterations}[${i}] ) {
					${localVars.iterations}[${i}] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${fragment.component} );
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
		fragment.builders.update.addBlock( deindent`
			if ( !${listName}.length && ${elseName} ) {
				${elseName}.update( changed, ${params} );
			} else if ( !${listName}.length ) {
				${elseName} = ${renderElse}( ${params}, ${fragment.component} );
				${elseName}.mount( ${anchor}.parentNode, ${anchor} );
			} else if ( ${elseName} ) {
				${elseName}.destroy( true );
			}
		` );
	}

	fragment.builders.destroy.addBlock(
		`${generator.helper( 'destroyEach' )}( ${localVars.iterations}, ${isToplevel ? 'detach' : 'false'} );` );

	if ( node.else ) {
		fragment.builders.destroy.addBlock( deindent`
			if ( ${elseName} ) {
				${elseName}.destroy( ${isToplevel ? 'detach' : 'false'} );
			}
		` );
	}

	const indexNames = new Map( fragment.indexNames );
	const indexName = node.index || fragment.getUniqueName( `${node.context}_index` );
	indexNames.set( node.context, indexName );

	const listNames = new Map( fragment.listNames );
	listNames.set( node.context, listName );

	const context = generator.getUniqueName( node.context );
	const contexts = new Map( fragment.contexts );
	contexts.set( node.context, context );

	const indexes = new Map( fragment.indexes );
	if ( node.index ) indexes.set( indexName, node.context );

	const contextDependencies = new Map( fragment.contextDependencies );
	contextDependencies.set( node.context, dependencies );

	const blockParams = fragment.params.concat( listName, context, indexName );

	const getUniqueName = generator.getUniqueNameMaker( blockParams );

	const childFragment = fragment.child({
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
		visit( generator, childFragment, child );
	});

	generator.addRenderer( childFragment );
	generator.pop();

	if ( node.else ) {
		const childFragment = fragment.child({
			type: 'block',
			name: renderElse,
			target: 'target',
			localElementDepth: 0,
			builders: getBuilders(),
			getUniqueName: generator.getUniqueNameMaker( fragment.params )
		});

		node.else.children.forEach( child => {
			visit( generator, childFragment, child );
		});

		generator.addRenderer( childFragment );
	}
}