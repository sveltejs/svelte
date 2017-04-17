import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';

export default function visitEachBlock ( generator, block, state, node ) {
	const vars = {};

	vars.each_block = generator.getUniqueName( `each_block` );
	vars.each_block_else = generator.getUniqueName( `${vars.each_block}_else` );
	vars.create_each_block = generator.getUniqueName( `create_each_block` );
	vars.create_each_block_else = generator.getUniqueName( `${vars.create_each_block}_else` );
	vars.listName = block.getUniqueName( `${vars.each_block}_value` );
	vars.i = block.getUniqueName( `i` );
	vars.params = block.params.join( ', ' );

	const isToplevel = !state.parentNode;

	const { dependencies, snippet } = generator.contextualise( block, node.expression );

	vars.anchor = block.getUniqueName( `${vars.each_block}_anchor` );
	block.createAnchor( vars.anchor, state.parentNode );

	vars.iteration = block.getUniqueName( `${vars.each_block}_iteration` );
	vars.iterations = block.getUniqueName( `${vars.each_block}_iterations` );
	vars._iterations = block.getUniqueName( `_${vars.each_block}_iterations` );

	block.builders.create.addLine( `var ${vars.listName} = ${snippet};` );
	block.builders.create.addLine( `var ${vars.iterations} = [];` );

	if ( node.key ) {
		keyed( generator, block, state, node, vars, snippet );
	} else {
		unkeyed( generator, block, state, node, vars, snippet );
	}

	if ( isToplevel ) {
		block.builders.mount.addBlock( deindent`
			for ( var ${vars.i} = 0; ${vars.i} < ${vars.iterations}.length; ${vars.i} += 1 ) {
				${vars.iterations}[${vars.i}].mount( ${block.target}, ${vars.anchor} );
			}
		` );
	}

	block.builders.destroy.addBlock(
		`${generator.helper( 'destroyEach' )}( ${vars.iterations}, ${isToplevel ? 'detach' : 'false'}, 0 );` );

	if ( node.else ) {
		block.builders.create.addLine( `var ${vars.each_block_else} = null;` );

		// TODO neaten this up... will end up with an empty line in the block
		block.builders.create.addBlock( deindent`
			if ( !${vars.listName}.length ) {
				${vars.each_block_else} = ${vars.create_each_block_else}( ${vars.params}, ${block.component} );
				${!isToplevel ? `${vars.each_block_else}.mount( ${state.parentNode}, ${vars.anchor} );` : ''}
			}
		` );

		block.builders.mount.addBlock( deindent`
			if ( ${vars.each_block_else} ) {
				${vars.each_block_else}.mount( ${state.parentNode || block.target}, ${vars.anchor} );
			}
		` );

		block.builders.update.addBlock( deindent`
			if ( !${vars.listName}.length && ${vars.each_block_else} ) {
				${vars.each_block_else}.update( changed, ${vars.params} );
			} else if ( !${vars.listName}.length ) {
				${vars.each_block_else} = ${vars.create_each_block_else}( ${vars.params}, ${block.component} );
				${vars.each_block_else}.mount( ${vars.anchor}.parentNode, ${vars.anchor} );
			} else if ( ${vars.each_block_else} ) {
				${vars.each_block_else}.destroy( true );
			}
		` );

		block.builders.destroy.addBlock( deindent`
			if ( ${vars.each_block_else} ) {
				${vars.each_block_else}.destroy( ${isToplevel ? 'detach' : 'false'} );
			}
		` );
	}

	const indexNames = new Map( block.indexNames );
	const indexName = node.index || block.getUniqueName( `${node.context}_index` );
	indexNames.set( node.context, indexName );

	const listNames = new Map( block.listNames );
	listNames.set( node.context, vars.listName );

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
		params: block.params.concat( vars.listName, context, indexName )
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
			name: vars.create_each_block_else
		});

		node.else.children.forEach( child => {
			visit( generator, childBlock, childState, child );
		});

		generator.addBlock( childBlock );
	}
}

function keyed ( generator, block, state, node, vars, snippet ) {
	const fragment = block.getUniqueName( 'fragment' );
	const value = block.getUniqueName( 'value' );
	const key = block.getUniqueName( 'key' );
	const lookup = block.getUniqueName( `${vars.each_block}_lookup` );
	const _lookup = block.getUniqueName( `_${vars.each_block}_lookup` );

	block.builders.create.addLine( `var ${lookup} = Object.create( null );` );

	const create = new CodeBuilder();

	create.addBlock( deindent`
		var ${key} = ${vars.listName}[${vars.i}].${node.key};
		${vars.iterations}[${vars.i}] = ${lookup}[ ${key} ] = ${vars.create_each_block}( ${vars.params}, ${vars.listName}, ${vars.listName}[${vars.i}], ${vars.i}, ${block.component}${node.key ? `, ${key}` : `` } );
	` );

	if ( state.parentNode ) {
		create.addLine(
			`${vars.iterations}[${vars.i}].mount( ${state.parentNode}, ${vars.anchor} );`
		);
	}

	block.builders.create.addBlock( deindent`
		for ( var ${vars.i} = 0; ${vars.i} < ${vars.listName}.length; ${vars.i} += 1 ) {
			${create}
		}
	` );

	block.builders.update.addBlock( deindent`
		var ${vars.listName} = ${snippet};
		var ${vars._iterations} = [];
		var ${_lookup} = Object.create( null );

		var ${fragment} = document.createDocumentFragment();

		// create new iterations as necessary
		for ( var ${vars.i} = 0; ${vars.i} < ${vars.listName}.length; ${vars.i} += 1 ) {
			var ${value} = ${vars.listName}[${vars.i}];
			var ${key} = ${value}.${node.key};

			if ( ${lookup}[ ${key} ] ) {
				${vars._iterations}[${vars.i}] = ${_lookup}[ ${key} ] = ${lookup}[ ${key} ];
				${_lookup}[ ${key} ].update( changed, ${vars.params}, ${vars.listName}, ${vars.listName}[${vars.i}], ${vars.i} );
			} else {
				${vars._iterations}[${vars.i}] = ${_lookup}[ ${key} ] = ${vars.create_each_block}( ${vars.params}, ${vars.listName}, ${vars.listName}[${vars.i}], ${vars.i}, ${block.component}${node.key ? `, ${key}` : `` } );
			}

			${vars._iterations}[${vars.i}].mount( ${fragment}, null );
		}

		// remove old iterations
		for ( var ${vars.i} = 0; ${vars.i} < ${vars.iterations}.length; ${vars.i} += 1 ) {
			var ${vars.iteration} = ${vars.iterations}[${vars.i}];
			if ( !${_lookup}[ ${vars.iteration}.key ] ) {
				${vars.iteration}.destroy( true );
			}
		}

		${vars.anchor}.parentNode.insertBefore( ${fragment}, ${vars.anchor} );

		${vars.iterations} = ${vars._iterations};
		${lookup} = ${_lookup};
	` );
}

function unkeyed ( generator, block, state, node, vars, snippet ) {
	const create = new CodeBuilder();

	create.addLine(
		`${vars.iterations}[${vars.i}] = ${vars.create_each_block}( ${vars.params}, ${vars.listName}, ${vars.listName}[${vars.i}], ${vars.i}, ${block.component} );`
	);

	if ( state.parentNode ) {
		create.addLine(
			`${vars.iterations}[${vars.i}].mount( ${state.parentNode}, ${vars.anchor} );`
		);
	}

	block.builders.create.addBlock( deindent`
		for ( var ${vars.i} = 0; ${vars.i} < ${vars.listName}.length; ${vars.i} += 1 ) {
			${create}
		}
	` );

	block.builders.update.addBlock( deindent`
		var ${vars.listName} = ${snippet};

		for ( var ${vars.i} = 0; ${vars.i} < ${vars.listName}.length; ${vars.i} += 1 ) {
			if ( !${vars.iterations}[${vars.i}] ) {
				${vars.iterations}[${vars.i}] = ${vars.create_each_block}( ${vars.params}, ${vars.listName}, ${vars.listName}[${vars.i}], ${vars.i}, ${block.component} );
				${vars.iterations}[${vars.i}].mount( ${vars.anchor}.parentNode, ${vars.anchor} );
			} else {
				${vars.iterations}[${vars.i}].update( changed, ${vars.params}, ${vars.listName}, ${vars.listName}[${vars.i}], ${vars.i} );
			}
		}

		${generator.helper( 'destroyEach' )}( ${vars.iterations}, true, ${vars.listName}.length );

		${vars.iterations}.length = ${vars.listName}.length;
	` );
}