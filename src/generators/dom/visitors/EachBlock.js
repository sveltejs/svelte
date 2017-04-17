import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';

export default function visitEachBlock ( generator, block, state, node ) {
	const each_block = generator.getUniqueName( `each_block` );
	const each_block_else = generator.getUniqueName( `${each_block}_else` );
	const create_each_block = generator.getUniqueName( `create_each_block` );
	const create_each_block_else = generator.getUniqueName( `${create_each_block}_else` );
	const listName = block.getUniqueName( `${each_block}_value` );
	const iterations = block.getUniqueName( `${each_block}_iterations` );
	const i = block.getUniqueName( `i` );
	const params = block.params.join( ', ' );
	const anchor = block.getUniqueName( `${each_block}_anchor` );

	const vars = { each_block, create_each_block, listName, iterations, i, params, anchor };

	const { dependencies, snippet } = generator.contextualise( block, node.expression );

	block.createAnchor( anchor, state.parentNode );
	block.builders.create.addLine( `var ${listName} = ${snippet};` );
	block.builders.create.addLine( `var ${iterations} = [];` );

	if ( node.key ) {
		keyed( generator, block, state, node, snippet, vars );
	} else {
		unkeyed( generator, block, state, node, snippet, vars );
	}

	const isToplevel = !state.parentNode;

	if ( isToplevel ) {
		block.builders.mount.addBlock( deindent`
			for ( var ${i} = 0; ${i} < ${iterations}.length; ${i} += 1 ) {
				${iterations}[${i}].mount( ${block.target}, ${anchor} );
			}
		` );
	}

	block.builders.destroy.addBlock(
		`${generator.helper( 'destroyEach' )}( ${iterations}, ${isToplevel ? 'detach' : 'false'}, 0 );` );

	if ( node.else ) {
		block.builders.create.addLine( `var ${each_block_else} = null;` );

		// TODO neaten this up... will end up with an empty line in the block
		block.builders.create.addBlock( deindent`
			if ( !${listName}.length ) {
				${each_block_else} = ${create_each_block_else}( ${params}, ${block.component} );
				${!isToplevel ? `${each_block_else}.mount( ${state.parentNode}, ${anchor} );` : ''}
			}
		` );

		block.builders.mount.addBlock( deindent`
			if ( ${each_block_else} ) {
				${each_block_else}.mount( ${state.parentNode || block.target}, ${anchor} );
			}
		` );

		block.builders.update.addBlock( deindent`
			if ( !${listName}.length && ${each_block_else} ) {
				${each_block_else}.update( changed, ${params} );
			} else if ( !${listName}.length ) {
				${each_block_else} = ${create_each_block_else}( ${params}, ${block.component} );
				${each_block_else}.mount( ${anchor}.parentNode, ${anchor} );
			} else if ( ${each_block_else} ) {
				${each_block_else}.destroy( true );
			}
		` );

		block.builders.destroy.addBlock( deindent`
			if ( ${each_block_else} ) {
				${each_block_else}.destroy( ${isToplevel ? 'detach' : 'false'} );
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

	const childBlock = block.child({
		name: vars.create_each_block,
		expression: node.expression,
		context: node.context,
		key: node.key,

		contextDependencies,
		contexts,
		indexes,

		indexNames,
		listNames,
		params: block.params.concat( listName, context, indexName )
	});

	const childState = Object.assign( {}, state, {
		parentNode: null,
		inEachBlock: true
	});

	node.children.forEach( child => {
		visit( generator, childBlock, childState, child );
	});

	generator.addBlock( childBlock );

	if ( node.else ) {
		const childBlock = block.child({
			name: create_each_block_else
		});

		node.else.children.forEach( child => {
			visit( generator, childBlock, childState, child );
		});

		generator.addBlock( childBlock );
	}
}

function keyed ( generator, block, state, node, snippet, { each_block, create_each_block, listName, iterations, i, params, anchor } ) {
	const fragment = block.getUniqueName( 'fragment' );
	const value = block.getUniqueName( 'value' );
	const key = block.getUniqueName( 'key' );
	const lookup = block.getUniqueName( `${each_block}_lookup` );
	const _lookup = block.getUniqueName( `_${each_block}_lookup` );
	const iteration = block.getUniqueName( `${each_block}_iteration` );
	const _iterations = block.getUniqueName( `_${each_block}_iterations` );

	block.builders.create.addLine( `var ${lookup} = Object.create( null );` );

	const create = new CodeBuilder();

	create.addBlock( deindent`
		var ${key} = ${listName}[${i}].${node.key};
		${iterations}[${i}] = ${lookup}[ ${key} ] = ${create_each_block}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component}${node.key ? `, ${key}` : `` } );
	` );

	if ( state.parentNode ) {
		create.addLine(
			`${iterations}[${i}].mount( ${state.parentNode}, ${anchor} );`
		);
	}

	block.builders.create.addBlock( deindent`
		for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
			${create}
		}
	` );

	block.builders.update.addBlock( deindent`
		var ${listName} = ${snippet};
		var ${_iterations} = [];
		var ${_lookup} = Object.create( null );

		var ${fragment} = document.createDocumentFragment();

		// create new iterations as necessary
		for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
			var ${value} = ${listName}[${i}];
			var ${key} = ${value}.${node.key};

			if ( ${lookup}[ ${key} ] ) {
				${_iterations}[${i}] = ${_lookup}[ ${key} ] = ${lookup}[ ${key} ];
				${_lookup}[ ${key} ].update( changed, ${params}, ${listName}, ${listName}[${i}], ${i} );
			} else {
				${_iterations}[${i}] = ${_lookup}[ ${key} ] = ${create_each_block}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component}${node.key ? `, ${key}` : `` } );
			}

			${_iterations}[${i}].mount( ${fragment}, null );
		}

		// remove old iterations
		for ( var ${i} = 0; ${i} < ${iterations}.length; ${i} += 1 ) {
			var ${iteration} = ${iterations}[${i}];
			if ( !${_lookup}[ ${iteration}.key ] ) {
				${iteration}.destroy( true );
			}
		}

		${anchor}.parentNode.insertBefore( ${fragment}, ${anchor} );

		${iterations} = ${_iterations};
		${lookup} = ${_lookup};
	` );
}

function unkeyed ( generator, block, state, node, snippet, { create_each_block, listName, iterations, i, params, anchor } ) {
	const create = new CodeBuilder();

	create.addLine(
		`${iterations}[${i}] = ${create_each_block}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component} );`
	);

	if ( state.parentNode ) {
		create.addLine(
			`${iterations}[${i}].mount( ${state.parentNode}, ${anchor} );`
		);
	}

	block.builders.create.addBlock( deindent`
		for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
			${create}
		}
	` );

	block.builders.update.addBlock( deindent`
		var ${listName} = ${snippet};

		for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
			if ( !${iterations}[${i}] ) {
				${iterations}[${i}] = ${create_each_block}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component} );
				${iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );
			} else {
				${iterations}[${i}].update( changed, ${params}, ${listName}, ${listName}[${i}], ${i} );
			}
		}

		${generator.helper( 'destroyEach' )}( ${iterations}, true, ${listName}.length );

		${iterations}.length = ${listName}.length;
	` );
}