import deindent from '../../../utils/deindent.js';
import visit from '../visit';
import { DomGenerator } from '../index';
import Block from '../Block';
import { Node } from '../../../interfaces';
import { State } from '../interfaces';

export default function visitEachBlock ( generator: DomGenerator, block: Block, state: State, node: Node ) {
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

	if ( node.key ) {
		keyed( generator, block, state, node, snippet, vars );
	} else {
		unkeyed( generator, block, state, node, snippet, vars );
	}

	const isToplevel = !state.parentNode;

	if ( node.needsAnchor ) {
		block.addElement( anchor, `${generator.helper( 'createComment' )}()`, state.parentNode, true );
	} else if ( node.next ) {
		node.next.usedAsAnchor = true;
	}

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
					${each_block_else}.unmount();
					${each_block_else}.destroy();
					${each_block_else} = null;
				}
			` );
		} else {
			block.builders.update.addBlock( deindent`
				if ( ${each_block_value}.length ) {
					if ( ${each_block_else} ) {
						${each_block_else}.unmount();
						${each_block_else}.destroy();
						${each_block_else} = null;
					}
				} else if ( !${each_block_else} ) {
					${each_block_else} = ${node.else._block.name}( ${params}, ${block.component} );
					${each_block_else}.${mountOrIntro}( ${parentNode}, ${anchor} );
				}
			` );
		}

		block.builders.unmount.addLine(
			`if ( ${each_block_else} ) ${each_block_else}.unmount()`
		);

		block.builders.destroy.addBlock( deindent`
			if ( ${each_block_else} ) ${each_block_else}.destroy( false );
		` );
	}

	node.children.forEach( ( child: Node ) => {
		visit( generator, node._block, node._state, child );
	});

	if ( node.else ) {
		node.else.children.forEach( ( child: Node ) => {
			visit( generator, node.else._block, node.else._state, child );
		});
	}
}

function keyed ( generator: DomGenerator, block: Block, state: State, node: Node, snippet, { each_block, create_each_block, each_block_value, i, params, anchor, mountOrIntro } ) {
	const key = block.getUniqueName( 'key' );
	const lookup = block.getUniqueName( `${each_block}_lookup` );
	const iteration = block.getUniqueName( `${each_block}_iteration` );
	const head = block.getUniqueName( `${each_block}_head` );
	const last = block.getUniqueName( `${each_block}_last` );
	const expected = block.getUniqueName( `${each_block}_expected` );

	if ( node.children[0] && node.children[0].type === 'Element' ) { // TODO or text/tag/raw
		node._block.first = node.children[0]._state.parentNode; // TODO this is highly confusing
	} else {
		node._block.first = node._block.getUniqueName( 'first' );
		node._block.addElement( node._block.first, `${generator.helper( 'createComment' )}()`, null, true );
	}

	block.builders.create.addBlock( deindent`
		var ${lookup} = Object.create( null );

		var ${head};
		var ${last};

		for ( var ${i} = 0; ${i} < ${each_block_value}.length; ${i} += 1 ) {
			var ${key} = ${each_block_value}[${i}].${node.key};
			var ${iteration} = ${lookup}[${key}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component}, ${key} );
			${state.parentNode && `${iteration}.${mountOrIntro}( ${state.parentNode}, null );`}

			if ( ${last} ) ${last}.next = ${iteration};
			${iteration}.last = ${last};
			${last} = ${iteration};

			if ( ${i} === 0 ) ${head} = ${iteration};
		}
	` );

	if ( !state.parentNode ) {
		block.builders.mount.addBlock( deindent`
			var ${iteration} = ${head};
			while ( ${iteration} ) {
				${iteration}.${mountOrIntro}( ${block.target}, anchor );
				${iteration} = ${iteration}.next;
			}
		` );
	}

	const dynamic = node._block.hasUpdateMethod;
	const parentNode = state.parentNode || `${anchor}.parentNode`;

	let destroy;
	if ( node._block.hasOutroMethod ) {
		const fn = block.getUniqueName( `${each_block}_outro` );
		block.builders.create.addBlock( deindent`
			function ${fn} ( iteration ) {
				iteration.outro( function () {
					iteration.unmount();
					iteration.destroy();
					${lookup}[iteration.key] = null;
				});
			}
		` );

		destroy = deindent`
			while ( ${expected} ) {
				${fn}( ${expected} );
				${expected} = ${expected}.next;
			}

			for ( ${i} = 0; ${i} < discard_pile.length; ${i} += 1 ) {
				if ( discard_pile[${i}].discard ) {
					${fn}( discard_pile[${i}] );
				}
			}
		`;
	} else {
		const fn = block.getUniqueName( `${each_block}_destroy` );
		block.builders.create.addBlock( deindent`
			function ${fn} ( iteration ) {
				iteration.unmount();
				iteration.destroy();
				${lookup}[iteration.key] = null;
			}
		` );

		destroy = deindent`
			while ( ${expected} ) {
				${fn}( ${expected} );
				${expected} = ${expected}.next;
			}

			for ( ${i} = 0; ${i} < discard_pile.length; ${i} += 1 ) {
				var ${iteration} = discard_pile[${i}];
				if ( ${iteration}.discard ) {
					${fn}( ${iteration} );
				}
			}
		`;
	}

	block.builders.update.addBlock( deindent`
		var ${each_block_value} = ${snippet};

		var ${expected} = ${head};
		var ${last} = null;

		var discard_pile = [];

		for ( ${i} = 0; ${i} < ${each_block_value}.length; ${i} += 1 ) {
			var ${key} = ${each_block_value}[${i}].${node.key};
			var ${iteration} = ${lookup}[${key}];

			${dynamic && `if ( ${iteration} ) ${iteration}.update( changed, ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i} );`}

			if ( ${expected} ) {
				if ( ${key} === ${expected}.key ) {
					${expected} = ${expected}.next;
				} else {
					if ( ${iteration} ) {
						// probably a deletion

						while ( ${expected} && ${expected}.key !== ${key} ) {
							${expected}.discard = true;
							discard_pile.push( ${expected} );
							${expected} = ${expected}.next;
						};

						${expected} = ${expected} && ${expected}.next;
						${iteration}.discard = false;
						${iteration}.last = ${last};

						if (!${expected}) ${iteration}.mount( ${parentNode}, ${anchor} );
					} else {
						// key is being inserted
						${iteration} = ${lookup}[${key}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component}, ${key} );
						${iteration}.${mountOrIntro}( ${parentNode}, ${expected}.first );

						${expected}.last = ${iteration};
						${iteration}.next = ${expected};
					}
				}
			} else {
				// we're appending from this point forward
				if ( ${iteration} ) {
					${iteration}.discard = false;
					${iteration}.next = null;
					${iteration}.mount( ${parentNode}, ${anchor} );
				} else {
					${iteration} = ${lookup}[${key}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component}, ${key} );
					${iteration}.${mountOrIntro}( ${parentNode}, ${anchor} );
				}
			}

			if ( ${last} ) ${last}.next = ${iteration};
			${iteration}.last = ${last};
			${node._block.hasIntroMethod && `${iteration}.intro( ${parentNode}, ${anchor} );`}
			${last} = ${iteration};
		}

		if ( ${last} ) ${last}.next = null;

		${destroy}

		${head} = ${lookup}[${each_block_value}[0] && ${each_block_value}[0].${node.key}];
	` );

	if ( !state.parentNode ) {
		block.builders.unmount.addBlock( deindent`
			var ${iteration} = ${head};
			while ( ${iteration} ) {
				${iteration}.unmount();
				${iteration} = ${iteration}.next;
			}
		` );
	}

	block.builders.destroy.addBlock( deindent`
		var ${iteration} = ${head};
		while ( ${iteration} ) {
			${iteration}.destroy( false );
			${iteration} = ${iteration}.next;
		}
	` );
}

function unkeyed ( generator: DomGenerator, block: Block, state: State, node: Node, snippet, { create_each_block, each_block_value, iterations, i, params, anchor, mountOrIntro } ) {
	block.builders.create.addBlock( deindent`
		var ${iterations} = [];

		for ( var ${i} = 0; ${i} < ${each_block_value}.length; ${i} += 1 ) {
			${iterations}[${i}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component} );
			${state.parentNode && `${iterations}[${i}].${mountOrIntro}( ${state.parentNode}, null );`}
		}
	` );

	if ( !state.parentNode ) {
		block.builders.mount.addBlock( deindent`
			for ( var ${i} = 0; ${i} < ${iterations}.length; ${i} += 1 ) {
				${iterations}[${i}].${mountOrIntro}( ${block.target}, anchor );
			}
		` );
	}

	const dependencies = block.findDependencies( node.expression );
	const allDependencies = new Set( node._block.dependencies );
	dependencies.forEach( dependency => {
		allDependencies.add( dependency );
	});

	// TODO do this for keyed blocks as well
	const condition = Array.from( allDependencies )
		.map( dependency => `'${dependency}' in changed` )
		.join( ' || ' );

	const parentNode = state.parentNode || `${anchor}.parentNode`;

	if ( condition !== '' ) {
		const forLoopBody = node._block.hasUpdateMethod ?
			node._block.hasIntroMethod ?
				deindent`
					if ( ${iterations}[${i}] ) {
						${iterations}[${i}].update( changed, ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i} );
					} else {
						${iterations}[${i}] = ${create_each_block}( ${params}, ${each_block_value}, ${each_block_value}[${i}], ${i}, ${block.component} );
					}
					${iterations}[${i}].intro( ${parentNode}, ${anchor} );
				` :
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
				${iterations}[${i}].${mountOrIntro}( ${parentNode}, ${anchor} );
			`;

		const start = node._block.hasUpdateMethod ? '0' : `${iterations}.length`;

		const outro = block.getUniqueName( 'outro' );
		const destroy = node._block.hasOutroMethod ?
			deindent`
				function ${outro} ( i ) {
					if ( ${iterations}[i] ) {
						${iterations}[i].outro( function () {
							${iterations}[i].unmount();
							${iterations}[i].destroy();
							${iterations}[i] = null;
						});
					}
				}

				for ( ; ${i} < ${iterations}.length; ${i} += 1 ) ${outro}( ${i} );
			` :
			deindent`
				for ( ; ${i} < ${iterations}.length; ${i} += 1 ) {
					${iterations}[${i}].unmount();
					${iterations}[${i}].destroy();
				}
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

	block.builders.unmount.addBlock( deindent`
		for ( var ${i} = 0; ${i} < ${iterations}.length; ${i} += 1 ) {
			${iterations}[${i}].unmount();
		}
	` );

	block.builders.destroy.addBlock(
		`${generator.helper( 'destroyEach' )}( ${iterations}, false, 0 );`
	);
}
