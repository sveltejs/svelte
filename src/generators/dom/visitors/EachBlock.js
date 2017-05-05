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

	const mountOrIntro = node._block.hasIntroMethod ? 'intro' : 'mount';
	const vars = { each_block, create_each_block, each_block_value, iterations, i, params, anchor, mountOrIntro };

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
				${iterations}[${i}].${mountOrIntro}( ${block.target}, null );
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
				${!isToplevel ? `${each_block_else}.${mountOrIntro}( ${state.parentNode}, null );` : ''}
			}
		` );

		block.builders.mount.addBlock( deindent`
			if ( ${each_block_else} ) {
				${each_block_else}.${mountOrIntro}( ${state.parentNode || block.target}, null );
			}
		` );

		const parentNode = state.parentNode || `${anchor}.parentNode`;

		if ( node.else._block.hasUpdateMethod ) {
			block.builders.update.addBlock( deindent`
				if ( !${each_block_value}.length && ${each_block_else} ) {
					${each_block_else}.update( changed, ${params} );
				} else if ( !${each_block_value}.length ) {
					${each_block_else} = ${node.else._block.name}( ${params}, ${block.component} );
					${each_block_else}.${mountOrIntro}( ${parentNode}, ${anchor} );
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
					${each_block_else}.${mountOrIntro}( ${parentNode}, ${anchor} );
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

function keyed ( generator, block, state, node, snippet, { each_block, create_each_block, each_block_value, iterations, i, params, anchor, mountOrIntro } ) {
	const key = block.getUniqueName( 'key' );
	const lookup = block.getUniqueName( `${each_block}_lookup` );
	const keys = block.getUniqueName( `${each_block}_keys` );
	const iteration = block.getUniqueName( `${each_block}_iteration` );
	const _iterations = block.getUniqueName( `_${each_block}_iterations` );

	if ( node.children[0] && node.children[0].type === 'Element' ) { // TODO or text/tag/raw
		node._block.first = node.children[0]._state.parentNode; // TODO this is highly confusing
	} else {
		node._block.first = node._block.getUniqueName( 'first' );
		node._block.addElement( node._block.first, `${generator.helper( 'createComment' )}()`, null, true );
	}

	block.builders.create.addBlock( deindent`
		var ${lookup} = Object.create( null );

		for ( var ${i} = 0; ${i} < ${each_block_value}.length; ${i} += 1 ) {
			var ${key} = ${each_block_value}[${i}].${node.key};
			${iterations}[${i}] = ${lookup}[ ${key} ] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component}, ${key} );
			${state.parentNode && `${iterations}[${i}].${mountOrIntro}( ${state.parentNode}, null );`}
		}
	` );

	const dynamic = node._block.hasUpdateMethod;
	const parentNode = state.parentNode || `${anchor}.parentNode`;

	let destroy;
	if ( node._block.hasOutroMethod ) {
		const outro = block.getUniqueName( `${each_block}_outro` );
		block.builders.create.addBlock( deindent`
			function ${outro} ( key ) {
				${lookup}[ key ].outro( function () {
					${lookup}[ key ].destroy( true );
					${lookup}[ key ] = null;
				});
			}
		` );

		destroy = `${outro}( ${key} );`;
	} else {
		destroy = `${iteration}.destroy( true );`;
	}

	block.builders.update.addBlock( deindent`
		var ${each_block_value} = ${snippet};
		var ${_iterations} = Array( ${each_block_value}.length );
		var ${keys} = Object.create( null );

		var index_by_key = Object.create( null );
		var key_by_index = Array( ${each_block_value}.length );

		var new_iterations = [];

		for ( ${i} = 0; ${i} < ${each_block_value}.length; ${i} += 1 ) {
			var ${key} = ${each_block_value}[${i}].${node.key};
			index_by_key[${key}] = ${i};
			key_by_index[${i}] = ${key};

			if ( ${lookup}[ ${key} ] ) {
				// TODO this is an empty branch for non-dynamic blocks
				${dynamic && `${lookup}[ ${key} ].update( changed, ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i} );`}
			} else {
				${lookup}[ ${key} ] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component}, ${key} );
				new_iterations.push( ${lookup}[ ${key} ] );
			}

			${_iterations}[${i}] = ${lookup}[ ${key} ];
		}

		// TODO group consecutive runs into fragments?
		${i} = new_iterations.length;
		while ( ${i}-- ) {
			${iteration} = new_iterations[${i}];
			var index = index_by_key[${iteration}.key];
			var next_sibling_key = key_by_index[index + 1];
			${iteration}.${mountOrIntro}( ${parentNode}, next_sibling_key === undefined ? ${anchor} : ${lookup}[next_sibling_key].first );
		}

		for ( ${i} = 0; ${i} < ${iterations}.length; ${i} += 1 ) {
			var ${iteration} = ${iterations}[${i}];
			var index = index_by_key[${iteration}.key];

			if ( index === undefined ) {
				${destroy}
			} else {
				var next_sibling_key = key_by_index[index + 1];
				${iteration}.mount( ${parentNode}, next_sibling_key === undefined ? ${anchor} : ${lookup}[next_sibling_key].first );
			}
		}

		${iterations} = ${_iterations};
	` );
}

function unkeyed ( generator, block, state, node, snippet, { create_each_block, each_block_value, iterations, i, params, anchor, mountOrIntro } ) {
	block.builders.create.addBlock( deindent`
		for ( var ${i} = 0; ${i} < ${each_block_value}.length; ${i} += 1 ) {
			${iterations}[${i}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component} );
			${state.parentNode && `${iterations}[${i}].${mountOrIntro}( ${state.parentNode}, null );`}
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
					${iterations}[${i}].${mountOrIntro}( ${parentNode}, ${anchor} );
				}
			` :
			deindent`
				${iterations}[${i}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component} );
				${iterations}[${i}].${mountOrIntro}( ${parentNode}, ${anchor} );
			`;

		const start = node._block.hasUpdateMethod ? '0' : `${iterations}.length`;

		const destroy = node._block.hasOutroMethod ?
			deindent`
				function outro ( i ) {
					if ( ${iterations}[i] ) {
						${iterations}[i].outro( function () {
							${iterations}[i].destroy( true );
							${iterations}[i] = null;
						});
					}
				}

				for ( ; ${i} < ${iterations}.length; ${i} += 1 ) outro( ${i} );
			` :
			deindent`
				${generator.helper( 'destroyEach' )}( ${iterations}, true, ${each_block_value}.length );
				${iterations}.length = ${each_block_value}.length;
			`;

		block.builders.update.addBlock( deindent`
			var ${each_block_value} = ${snippet};

			if ( ${condition} ) {
				for ( var ${i} = ${start}; ${i} < ${each_block_value}.length; ${i} += 1 ) {
					${forLoopBody}
				}

				${destroy}
			}
		` );
	}
}