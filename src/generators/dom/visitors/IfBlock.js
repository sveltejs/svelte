import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';

function isElseIf ( node ) {
	return node && node.children.length === 1 && node.children[0].type === 'IfBlock';
}

function getBranches ( generator, block, state, node ) {
	const branches = [{
		condition: block.contextualise( node.expression ).snippet,
		block: node._block.name,
		dynamic: node._block.dependencies.size > 0
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
			dynamic: node.else ? node.else._block.dependencies.size > 0 : false
		});

		if ( node.else ) {
			visitChildren( generator, block, state, node.else );
		}
	}

	return branches;
}

function visitChildren ( generator, block, state, node ) {
	const childState = Object.assign( {}, state, {
		parentNode: null
	});

	node.children.forEach( child => {
		visit( generator, node._block, childState, child );
	});
}

export default function visitIfBlock ( generator, block, state, node ) {
	const name = generator.getUniqueName( `if_block` );
	const anchor = generator.getUniqueName( `${name}_anchor` );
	const params = block.params.join( ', ' );

	const vars = { name, anchor, params };

	block.createAnchor( anchor, state.parentNode );

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
		var ${name} = ${branch.condition} && ${branch.block}( ${params}, ${block.component} );
	` );

	const isToplevel = !state.parentNode;

	if ( isToplevel ) {
		block.builders.mount.addLine( `if ( ${name} ) ${name}.mount( ${block.target}, ${anchor} );` );
	} else {
		block.builders.create.addLine( `if ( ${name} ) ${name}.mount( ${state.parentNode}, ${anchor} );` );
	}

	if ( dynamic ) {
		block.builders.update.addBlock( deindent`
			if ( ${branch.condition} ) {
				if ( ${name} ) {
					${name}.update( changed, ${params} );
				} else {
					${name} = ${branch.block}( ${params}, ${block.component} );
					${name}.mount( ${anchor}.parentNode, ${anchor} );
				}
			} else if ( ${name} ) {
				${name}.destroy( true );
				${name} = null;
			}
		` );
	} else {
		block.builders.update.addBlock( deindent`
			if ( ${branch.condition} ) {
				if ( !${name} ) {
					${name} = ${branch.block}( ${params}, ${block.component} );
					${name}.mount( ${anchor}.parentNode, ${anchor} );
				}
			} else if ( ${name} ) {
				${name}.destroy( true );
				${name} = null;
			}
		` );
	}
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
		block.builders.mount.addLine( `if ( ${name} ) ${name}.mount( ${block.target}, ${anchor} );` );
	} else {
		block.builders.create.addLine( `if ( ${name} ) ${name}.mount( ${state.parentNode}, ${anchor} );` );
	}

	if ( dynamic ) {
		block.builders.update.addBlock( deindent`
			if ( ${current_block} === ( ${current_block} = ${getBlock}( ${params} ) ) && ${name} ) {
				${name}.update( changed, ${params} );
			} else {
				if ( ${name} ) ${name}.destroy( true );
				${name} = ${current_block} && ${current_block}( ${params}, ${block.component} );
				if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );
			}
		` );
	} else {
		block.builders.update.addBlock( deindent`
			if ( ${current_block} !== ( ${current_block} = ${getBlock}( ${params} ) ) ) {
				if ( ${name} ) ${name}.destroy( true );
				${name} = ${current_block} && ${current_block}( ${params}, ${block.component} );
				if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );
			}
		` );
	}
}