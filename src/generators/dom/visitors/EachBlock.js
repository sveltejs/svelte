import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';

export default function visitEachBlock ( generator, block, state, node ) {
	const each_block = generator.getUniqueName( `each_block` );
	const each_block_else = generator.getUniqueName( `${each_block}_else` );

	const create_each_block = generator.getUniqueName( `create_each_block` );
	const create_each_block_else = generator.getUniqueName( `${create_each_block}_else` );

	const i = block.getUniqueName( `i` );
	const params = block.params.join( ', ' );

	const listName = block.getUniqueName( `${each_block}_value` );

	const isToplevel = !state.parentNode;

	const { dependencies, snippet } = generator.contextualise( block, node.expression );

	const anchor = block.getUniqueName( `${each_block}_anchor` );
	block.createAnchor( anchor, state.parentNode );

	const vars = {
		iteration: block.getUniqueName( `${each_block}_iteration` ),
		iterations: block.getUniqueName( `${each_block}_iterations` ),
		_iteration: block.getUniqueName( `_${each_block}_iteration` ),
		lookup: block.getUniqueName( `${each_block}_lookup` ),
		_lookup: block.getUniqueName( `_${each_block}_lookup` )
	};

	block.builders.create.addLine( `var ${listName} = ${snippet};` );
	block.builders.create.addLine( `var ${vars.iterations} = [];` );
	if ( node.key ) block.builders.create.addLine( `var ${vars.lookup} = Object.create( null );` );
	if ( node.else ) block.builders.create.addLine( `var ${each_block_else} = null;` );

	const initialRender = new CodeBuilder();

	if ( node.key ) {
		vars.fragment = block.getUniqueName( 'fragment' );
		vars.value = block.getUniqueName( 'value' );
		vars.key = block.getUniqueName( 'key' );

		initialRender.addBlock( deindent`
			var ${vars.key} = ${listName}[${i}].${node.key};
			${vars.iterations}[${i}] = ${vars.lookup}[ ${vars.key} ] = ${create_each_block}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component}${node.key ? `, ${vars.key}` : `` } );
		` );
	} else {
		initialRender.addLine(
			`${vars.iterations}[${i}] = ${create_each_block}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component} );`
		);
	}

	if ( !isToplevel ) {
		initialRender.addLine(
			`${vars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );`
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
				${each_block_else} = ${create_each_block_else}( ${params}, ${block.component} );
				${!isToplevel ? `${each_block_else}.mount( ${anchor}.parentNode, ${anchor} );` : ''}
			}
		` );
	}

	if ( isToplevel ) {
		block.builders.mount.addBlock( deindent`
			for ( var ${i} = 0; ${i} < ${vars.iterations}.length; ${i} += 1 ) {
				${vars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );
			}
		` );
		if ( node.else ) {
			block.builders.mount.addBlock( deindent`
				if ( ${each_block_else} ) {
					${each_block_else}.mount( ${anchor}.parentNode, ${anchor} );
				}
			` );
		}
	}

	if ( node.key ) {
		block.builders.update.addBlock( deindent`
			var ${listName} = ${snippet};
			var ${vars._iterations} = [];
			var ${vars._lookup} = Object.create( null );

			var ${vars.fragment} = document.createDocumentFragment();

			// create new iterations as necessary
			for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
				var ${vars.value} = ${listName}[${i}];
				var ${vars.key} = ${vars.value}.${node.key};

				if ( ${vars.lookup}[ ${vars.key} ] ) {
					${vars._iterations}[${i}] = ${vars._lookup}[ ${vars.key} ] = ${vars.lookup}[ ${vars.key} ];
					${vars._lookup}[ ${vars.key} ].update( changed, ${params}, ${listName}, ${listName}[${i}], ${i} );
				} else {
					${vars._iterations}[${i}] = ${vars._lookup}[ ${vars.key} ] = ${create_each_block}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component}${node.key ? `, ${vars.key}` : `` } );
				}

				${vars._iterations}[${i}].mount( ${vars.fragment}, null );
			}

			// remove old iterations
			for ( var ${i} = 0; ${i} < ${vars.iterations}.length; ${i} += 1 ) {
				var ${vars.iteration} = ${vars.iterations}[${i}];
				if ( !${vars._lookup}[ ${vars.iteration}.key ] ) {
					${vars.iteration}.destroy( true );
				}
			}

			${anchor}.parentNode.insertBefore( ${vars.fragment}, ${anchor} );

			${vars.iterations} = ${vars._iterations};
			${vars.lookup} = ${vars._lookup};
		` );
	} else {
		block.builders.update.addBlock( deindent`
			var ${listName} = ${snippet};

			for ( var ${i} = 0; ${i} < ${listName}.length; ${i} += 1 ) {
				if ( !${vars.iterations}[${i}] ) {
					${vars.iterations}[${i}] = ${create_each_block}( ${params}, ${listName}, ${listName}[${i}], ${i}, ${block.component} );
					${vars.iterations}[${i}].mount( ${anchor}.parentNode, ${anchor} );
				} else {
					${vars.iterations}[${i}].update( changed, ${params}, ${listName}, ${listName}[${i}], ${i} );
				}
			}

			${generator.helper( 'destroyEach' )}( ${vars.iterations}, true, ${listName}.length );

			${vars.iterations}.length = ${listName}.length;
		` );
	}

	if ( node.else ) {
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
	}

	block.builders.destroy.addBlock(
		`${generator.helper( 'destroyEach' )}( ${vars.iterations}, ${isToplevel ? 'detach' : 'false'}, 0 );` );

	if ( node.else ) {
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
		name: create_each_block,
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