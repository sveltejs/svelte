import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';

export default function visitEachBlock ( generator, block, state, node ) {
	const each_block = generator.getUniqueName( `each_block` );
	const create_each_block = node._block.name;
	const each_block_value = node._block.listName;
	const iterations = block.getUniqueName( `${each_block}_iterations` );
	const i = block.alias( `i` );
	const params = block.params.join( ', ' );
	const anchor = node.needsAnchor ? block.getUniqueName( `${each_block}_anchor` ) : ( node.next && node.next._state.name ) || 'null';

	const vars = { each_block, create_each_block, each_block_value, iterations, i, params, anchor };

	const { snippet } = block.contextualise( node.expression );

	block.builders.create.addLine( `var ${each_block_value} = ${snippet};` );
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
				${iterations}[${i}].mount( ${block.target}, null );
			}
		` );
	}

	if ( node.needsAnchor ) {
		block.addElement( anchor, `${generator.helper( 'createComment' )}()`, state.parentNode, true );
	} else if ( node.next ) {
		node.next.usedAsAnchor = true;
	}

	block.builders.destroy.addBlock(
		`${generator.helper( 'destroyEach' )}( ${iterations}, ${isToplevel ? 'detach' : 'false'}, 0 );` );

	if ( node.else ) {
		const each_block_else = generator.getUniqueName( `${each_block}_else` );

		block.builders.create.addLine( `var ${each_block_else} = null;` );

		// TODO neaten this up... will end up with an empty line in the block
		block.builders.create.addBlock( deindent`
			if ( !${each_block_value}.length ) {
				${each_block_else} = ${node.else._block.name}( ${params}, ${block.component} );
				${!isToplevel ? `${each_block_else}.mount( ${state.parentNode}, null );` : ''}
			}
		` );

		block.builders.mount.addBlock( deindent`
			if ( ${each_block_else} ) {
				${each_block_else}.mount( ${state.parentNode || block.target}, null );
			}
		` );

		const parentNode = state.parentNode || `${anchor}.parentNode`;

		if ( node.else._block.hasUpdateMethod ) {
			block.builders.update.addBlock( deindent`
				if ( !${each_block_value}.length && ${each_block_else} ) {
					${each_block_else}.update( changed, ${params} );
				} else if ( !${each_block_value}.length ) {
					${each_block_else} = ${node.else._block.name}( ${params}, ${block.component} );
					${each_block_else}.mount( ${parentNode}, ${anchor} );
				} else if ( ${each_block_else} ) {
					${each_block_else}.destroy( true );
					${each_block_else} = null;
				}
			` );
		} else {
			block.builders.update.addBlock( deindent`
				if ( ${each_block_value}.length ) {
					if ( ${each_block_else} ) {
						${each_block_else}.destroy( true );
						${each_block_else} = null;
					}
				} else if ( !${each_block_else} ) {
					${each_block_else} = ${node.else._block.name}( ${params}, ${block.component} );
					${each_block_else}.mount( ${parentNode}, ${anchor} );
				}
			` );
		}


		block.builders.destroy.addBlock( deindent`
			if ( ${each_block_else} ) {
				${each_block_else}.destroy( ${isToplevel ? 'detach' : 'false'} );
			}
		` );
	}

	node.children.forEach( child => {
		visit( generator, node._block, node._state, child );
	});

	if ( node.else ) {
		node.else.children.forEach( child => {
			visit( generator, node.else._block, node.else._state, child );
		});
	}
}

function keyed ( generator, block, state, node, snippet, { each_block, create_each_block, each_block_value, iterations, i, params, anchor } ) {
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
		var ${key} = ${each_block_value}[${i}].${node.key};
		${iterations}[${i}] = ${lookup}[ ${key} ] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component}${node.key ? `, ${key}` : `` } );
	` );

	if ( state.parentNode ) {
		create.addLine(
			`${iterations}[${i}].mount( ${state.parentNode}, null );`
		);
	}

	block.builders.create.addBlock( deindent`
		for ( var ${i} = 0; ${i} < ${each_block_value}.length; ${i} += 1 ) {
			${create}
		}
	` );

	const consequent = node._block.hasUpdateMethod ?
		deindent`
			${_iterations}[${i}] = ${_lookup}[ ${key} ] = ${lookup}[ ${key} ];
			${_lookup}[ ${key} ].update( changed, ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i} );
		` :
		`${_iterations}[${i}] = ${_lookup}[ ${key} ] = ${lookup}[ ${key} ];`;

	const parentNode = state.parentNode || `${anchor}.parentNode`;

	block.builders.update.addBlock( deindent`
		var ${each_block_value} = ${snippet};
		var ${_iterations} = [];
		var ${_lookup} = Object.create( null );

		var ${fragment} = document.createDocumentFragment();

		// create new iterations as necessary
		for ( var ${i} = 0; ${i} < ${each_block_value}.length; ${i} += 1 ) {
			var ${value} = ${each_block_value}[${i}];
			var ${key} = ${value}.${node.key};

			if ( ${lookup}[ ${key} ] ) {
				${consequent}
			} else {
				${_iterations}[${i}] = ${_lookup}[ ${key} ] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component}${node.key ? `, ${key}` : `` } );
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

		${parentNode}.insertBefore( ${fragment}, ${anchor} );

		${iterations} = ${_iterations};
		${lookup} = ${_lookup};
	` );
}

function unkeyed ( generator, block, state, node, snippet, { create_each_block, each_block_value, iterations, i, params, anchor } ) {
	const create = new CodeBuilder();

	create.addLine(
		`${iterations}[${i}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component} );`
	);

	if ( state.parentNode ) {
		create.addLine(
			`${iterations}[${i}].mount( ${state.parentNode}, null );`
		);
	}

	block.builders.create.addBlock( deindent`
		for ( var ${i} = 0; ${i} < ${each_block_value}.length; ${i} += 1 ) {
			${create}
		}
	` );

	const dependencies = block.findDependencies( node.expression );
	const allDependencies = new Set( node._block.dependencies );
	dependencies.forEach( dependency => {
		allDependencies.add( dependency );
	});

	const condition = Array.from( allDependencies )
		.map( dependency => `'${dependency}' in changed` )
		.join( ' || ' );

	const parentNode = state.parentNode || `${anchor}.parentNode`;

	if ( condition !== '' ) {
		const forLoopBody = node._block.hasUpdateMethod ?
			deindent`
				if ( ${iterations}[${i}] ) {
					${iterations}[${i}].update( changed, ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i} );
				} else {
					${iterations}[${i}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component} );
					${iterations}[${i}].mount( ${parentNode}, ${anchor} );
				}
			` :
			deindent`
				${iterations}[${i}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component} );
				${iterations}[${i}].mount( ${parentNode}, ${anchor} );
			`;

		const start = node._block.hasUpdateMethod ? '0' : `${iterations}.length`;

		block.builders.update.addBlock( deindent`
			var ${each_block_value} = ${snippet};

			if ( ${condition} ) {
				for ( var ${i} = ${start}; ${i} < ${each_block_value}.length; ${i} += 1 ) {
					${forLoopBody}
				}

				${generator.helper( 'destroyEach' )}( ${iterations}, true, ${each_block_value}.length );

				${iterations}.length = ${each_block_value}.length;
			}
		` );
	}
}