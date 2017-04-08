import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';

export default function visitEachBlock ( generator, block, state, node ) {
	const name = generator.getUniqueName( `each_block` );
	const renderer = generator.getUniqueName( `render_each_block` );
	const elseName = generator.getUniqueName( `${name}_else` );
	const renderElse = generator.getUniqueName( `${renderer}_else` );
	const i = block.getUniqueName( `i` );
	const params = block.params.join( ', ' );

	const listName = block.getUniqueName( `${name}_value` );

	const isToplevel = !state.parentNode;

	const { dependencies, snippet } = generator.contextualise( block, node.expression );

	const anchor = block.getUniqueName( `${name}_anchor` );
	block.createAnchor( anchor, state.parentNode );

	const localVars = {};

	localVars.iteration = block.getUniqueName( `${name}_iteration` );
	localVars.iterations = block.getUniqueName( `${name}_iterations` );
	localVars._iterations = block.getUniqueName( `_${name}_iterations` );
	localVars.lookup = block.getUniqueName( `${name}_lookup` );
	localVars._lookup = block.getUniqueName( `_${name}_lookup` );

	block.builders.create.addLine( `var ${listName} = ${snippet};` );
	block.builders.create.addLine( `var ${localVars.iterations} = [];` );
	if ( node.key ) block.builders.create.addLine( `var ${localVars.lookup} = Object.create( null );` );
	if ( node.else ) block.builders.create.addLine( `var ${elseName} = null;` );

	const initialRender = new CodeBuilder();

	if ( node.key ) {
		localVars.fragment = block.getUniqueName( 'fragment' );
		localVars.value = block.getUniqueName( 'value' );
		localVars.key = block.getUniqueName( 'key' );

		initialRender.addBlock( deindent`
			var ${localVars.key} = ${listName}[${i}].${node.key};
			${localVars.iterations}[${i}] = ${localVars.lookup}[ ${localVars.key} ] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component}${node.key ? `, ${localVars.key}` : `` } );
		` );
	} else {
		initialRender.addLine(
			`${localVars.iterations}[${i}] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component} );`
		);
	}

	if ( !isToplevel ) {
		initialRender.addLine(
			`${localVars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );`
		);
	}

	block.builders.create.addBlock( deindent`
		for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
			${initialRender}
		}
	` );

	if ( node.else ) {
		block.builders.create.addBlock( deindent`
			if ( !${listName}.length ) {
				${elseName} = ${renderElse}( ${params}, ${block.component} );
				${!isToplevel ? `${elseName}.mount( ${anchor}.parentNode, ${anchor} );` : ''}
			}
		` );
	}

	if ( isToplevel ) {
		block.builders.mount.addBlock( deindent`
			for ( var ${i} = 0; ${i} < ${localVars.iterations}.length; ${i} += 1 ) {
				${localVars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );
			}
		` );
		if ( node.else ) {
			block.builders.mount.addBlock( deindent`
				if ( ${elseName} ) {
					${elseName}.mount( ${anchor}.parentNode, ${anchor} );
				}
			` );
		}
	}

	if ( node.key ) {
		block.builders.update.addBlock( deindent`
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
					${localVars._iterations}[${i}] = ${localVars._lookup}[ ${localVars.key} ] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component}${node.key ? `, ${localVars.key}` : `` } );
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
		block.builders.update.addBlock( deindent`
			var ${listName} = ${snippet};

			for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
				if ( !${localVars.iterations}[${i}] ) {
					${localVars.iterations}[${i}] = ${renderer}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component} );
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
		block.builders.update.addBlock( deindent`
			if ( !${listName}.length && ${elseName} ) {
				${elseName}.update( changed, ${params} );
			} else if ( !${listName}.length ) {
				${elseName} = ${renderElse}( ${params}, ${block.component} );
				${elseName}.mount( ${anchor}.parentNode, ${anchor} );
			} else if ( ${elseName} ) {
				${elseName}.destroy( true );
			}
		` );
	}

	block.builders.destroy.addBlock(
		`${generator.helper( 'destroyEach' )}( ${localVars.iterations}, ${isToplevel ? 'detach' : 'false'} );` );

	if ( node.else ) {
		block.builders.destroy.addBlock( deindent`
			if ( ${elseName} ) {
				${elseName}.destroy( ${isToplevel ? 'detach' : 'false'} );
			}
		` );
	}

	const indexNames = new Map( block.indexNames );
	const indexName = node.index || block.getUniqueName( `${node.context}_index` );
	indexNames.set( node.context, indexName );

	const listNames = new Map( block.listNames );
	listNames.set( node.context, listName );

	const context = generator.getUniqueName( node.context );
	const contexts = new Map( block.contexts );
	contexts.set( node.context, context );

	const indexes = new Map( block.indexes );
	if ( node.index ) indexes.set( indexName, node.context );

	const contextDependencies = new Map( block.contextDependencies );
	contextDependencies.set( node.context, dependencies );

	const blockParams = block.params.concat( listName, context, indexName );

	const getUniqueName = generator.getUniqueNameMaker( blockParams );

	const childBlock = block.child({
		name: renderer,
		expression: node.expression,
		context: node.context,
		key: node.key,

		component: getUniqueName( 'component' ),

		contextDependencies,
		contexts,
		indexes,

		indexNames,
		listNames,
		params: blockParams,

		getUniqueName
	});

	const childState = Object.assign( {}, state, {
		parentNode: null
	});

	node.children.forEach( child => {
		visit( generator, childBlock, childState, child );
	});

	generator.addBlock( childBlock );

	if ( node.else ) {
		const childBlock = block.child({
			name: renderElse,
			getUniqueName: generator.getUniqueNameMaker( block.params )
		});

		node.else.children.forEach( child => {
			visit( generator, childBlock, childState, child );
		});

		generator.addBlock( childBlock );
	}
}