import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';

function isElseIf ( node ) {
	return node && node.children.length === 1 && node.children[0].type === 'IfBlock';
}

function getBranches ( generator, block, state, node ) {
	const branches = [{
		condition: block.contextualise( node.expression ).snippet,
		block: node._block.name,
		dynamic: node._block.dependencies.size > 0,
		hasIntroTransitions: node._block.hasIntroTransitions,
		hasOutroTransitions: node._block.hasOutroTransitions
	}];

	visitChildren( generator, block, state, node );

	if ( isElseIf( node.else ) ) {
		branches.push(
			...getBranches( generator, block, state, node.else.children[0] )
		);
	} else {
		branches.push({
			condition: null,
			block: node.else ? node.else._block.name : null,
			dynamic: node.else ? node.else._block.dependencies.size > 0 : false,
			hasIntroTransitions: node.else ? node.else._block.hasIntroTransitions : false,
			hasOutroTransitions: node.else ? node.else._block.hasOutroTransitions : false
		});

		if ( node.else ) {
			visitChildren( generator, block, state, node.else );
		}
	}

	return branches;
}

function visitChildren ( generator, block, state, node ) {
	node.children.forEach( child => {
		visit( generator, node._block, node._state, child );
	});
}

export default function visitIfBlock ( generator, block, state, node ) {
	const name = generator.getUniqueName( `if_block` );
	const anchor = node.needsAnchor ? block.getUniqueName( `${name}_anchor` ) : ( node.next && node.next._state.name ) || 'null';
	const params = block.params.join( ', ' );

	const vars = { name, anchor, params };

	if ( node.needsAnchor ) {
		block.addElement( anchor, `${generator.helper( 'createComment' )}()`, state.parentNode, true );
	} else if ( node.next ) {
		node.next.usedAsAnchor = true;
	}

	const branches = getBranches( generator, block, state, node, generator.getUniqueName( `create_if_block` ) );
	const dynamic = branches.some( branch => branch.dynamic );

	if ( node.else ) {
		compound( generator, block, state, node, branches, dynamic, vars );
	} else {
		simple( generator, block, state, node, branches[0], dynamic, vars );
	}

	block.builders.destroy.addLine(
		`if ( ${name} ) ${name}.destroy( ${state.parentNode ? 'false' : 'detach'} );`
	);
}

function simple ( generator, block, state, node, branch, dynamic, { name, anchor, params } ) {
	block.builders.create.addBlock( deindent`
		var ${name} = (${branch.condition}) && ${branch.block}( ${params}, ${block.component} );
	` );

	const isToplevel = !state.parentNode;
	const mountOrIntro = branch.hasIntroTransitions ? 'intro' : 'mount';

	if ( isToplevel ) {
		block.builders.mount.addLine( `if ( ${name} ) ${name}.${mountOrIntro}( ${block.target}, null );` );
	} else {
		block.builders.create.addLine( `if ( ${name} ) ${name}.${mountOrIntro}( ${state.parentNode}, null );` );
	}

	const parentNode = state.parentNode || `${anchor}.parentNode`;

	const enter = dynamic ?
		( branch.hasIntroTransitions ?
			deindent`
				if ( ${name} ) {
					${name}.update( changed, ${params} );
				} else {
					${name} = ${branch.block}( ${params}, ${block.component} );
				}

				${name}.intro( ${parentNode}, ${anchor} );
			` :
			deindent`
				if ( ${name} ) {
					${name}.update( changed, ${params} );
				} else {
					${name} = ${branch.block}( ${params}, ${block.component} );
					${name}.mount( ${parentNode}, ${anchor} );
				}
			` ) :
		( branch.hasIntroTransitions ?
			deindent`
				if ( !${name} ) ${name} = ${branch.block}( ${params}, ${block.component} );
				${name}.intro( ${parentNode}, ${anchor} );
			` :
			deindent`
				if ( !${name} ) {
					${name} = ${branch.block}( ${params}, ${block.component} );
					${name}.mount( ${parentNode}, ${anchor} );
				}
			` );

	// no `update()` here — we don't want to update outroing nodes,
	// as that will typically result in glitching
	const exit = branch.hasOutroTransitions ?
		deindent`
			${name}.outro( function () {
				${name}.destroy( true );
				${name} = null;
			});
		` :
		deindent`
			${name}.destroy( true );
			${name} = null;
		`;

	block.builders.update.addBlock( deindent`
		if ( ${branch.condition} ) {
			${enter}
		} else if ( ${name} ) {
			${exit}
		}
	` );
}

function compound ( generator, block, state, node, branches, dynamic, { name, anchor, params } ) {
	const getBlock = block.getUniqueName( `get_block` );
	const current_block = block.getUniqueName( `current_block` );

	block.builders.create.addBlock( deindent`
		function ${getBlock} ( ${params} ) {
			${branches.map( ({ condition, block }) => {
				return `${condition ? `if ( ${condition} ) ` : ''}return ${block};`;
			} ).join( '\n' )}
		}

		var ${current_block} = ${getBlock}( ${params} );
		var ${name} = ${current_block} && ${current_block}( ${params}, ${block.component} );
	` );

	const isToplevel = !state.parentNode;

	if ( isToplevel ) {
		block.builders.mount.addLine( `if ( ${name} ) ${name}.mount( ${block.target}, null );` );
	} else {
		block.builders.create.addLine( `if ( ${name} ) ${name}.mount( ${state.parentNode}, null );` );
	}

	const parentNode = state.parentNode || `${anchor}.parentNode`;

	if ( block.hasOutroTransitions ) {
		throw new Error( 'TODO compound if-blocks with outro transitions are not yet supported' );
	}

	if ( dynamic ) {
		block.builders.update.addBlock( deindent`
			if ( ${current_block} === ( ${current_block} = ${getBlock}( ${params} ) ) && ${name} ) {
				${name}.update( changed, ${params} );
			} else {
				if ( ${name} ) ${name}.destroy( true );
				${name} = ${current_block} && ${current_block}( ${params}, ${block.component} );
				if ( ${name} ) ${name}.mount( ${parentNode}, ${anchor} );
			}
		` );
	} else {
		block.builders.update.addBlock( deindent`
			if ( ${current_block} !== ( ${current_block} = ${getBlock}( ${params} ) ) ) {
				if ( ${name} ) ${name}.destroy( true );
				${name} = ${current_block} && ${current_block}( ${params}, ${block.component} );
				if ( ${name} ) ${name}.mount( ${parentNode}, ${anchor} );
			}
		` );
	}
}
