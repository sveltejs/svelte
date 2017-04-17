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
	const params = block.params.join( ', ' );
	const name = generator.getUniqueName( `if_block` );
	const getBlock = block.getUniqueName( `get_block` );
	const currentBlock = block.getUniqueName( `current_block` );
	const _currentBlock = block.getUniqueName( `_current_block` );

	const branches = getBranches( generator, block, state, node, generator.getUniqueName( `create_if_block` ) );
	const dynamic = branches.some( branch => branch.dynamic );

	const anchor = `${name}_anchor`;
	block.createAnchor( anchor, state.parentNode );

	block.builders.create.addBlock( deindent`
		function ${getBlock} ( ${params} ) {
			${branches.map( ({ condition, block }) => {
				return `${condition ? `if ( ${condition} ) ` : ''}return ${block};`;
			} ).join( '\n' )}
		}

		var ${currentBlock} = ${getBlock}( ${params} );
		var ${name} = ${currentBlock} && ${currentBlock}( ${params}, ${block.component} );
	` );

	const isToplevel = !state.parentNode;

	if ( isToplevel ) {
		block.builders.mount.addLine( `if ( ${name} ) ${name}.mount( ${block.target}, ${anchor} );` );
	} else {
		block.builders.create.addLine( `if ( ${name} ) ${name}.mount( ${state.parentNode}, ${anchor} );` );
	}

	block.builders.update.addBlock( deindent`
		var ${_currentBlock} = ${currentBlock};
		${currentBlock} = ${getBlock}( ${params} );
	` );

	if ( dynamic ) {
		block.builders.update.addBlock( deindent`
			if ( ${_currentBlock} === ${currentBlock} && ${name} ) {
				${name}.update( changed, ${params} );
			} else {
				if ( ${name} ) ${name}.destroy( true );
				${name} = ${currentBlock} && ${currentBlock}( ${params}, ${block.component} );
				if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );
			}
		` );
	} else {
		block.builders.update.addBlock( deindent`
			if ( ${_currentBlock} !== ${currentBlock} ) {
				if ( ${name} ) ${name}.destroy( true );
				${name} = ${currentBlock} && ${currentBlock}( ${params}, ${block.component} );
				if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );
			}
		` );
	}

	block.builders.destroy.addLine(
		`if ( ${name} ) ${name}.destroy( ${isToplevel ? 'detach' : 'false'} );`
	);
}