import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';

function isElseIf ( node ) {
	return node && node.children.length === 1 && node.children[0].type === 'IfBlock';
}

function getConditionsAndBlocks ( generator, block, state, node, _name, i = 0 ) {
	const name = generator.getUniqueName( `${_name}_${i}` );

	const conditionsAndBlocks = [{
		condition: block.contextualise( node.expression ).snippet,
		block: name
	}];

	generateBlock( generator, block, state, node, name );

	if ( isElseIf( node.else ) ) {
		conditionsAndBlocks.push(
			...getConditionsAndBlocks( generator, block, state, node.else.children[0], _name, i + 1 )
		);
	} else {
		const name = generator.getUniqueName( `${_name}_${i + 1}` );
		conditionsAndBlocks.push({
			condition: null,
			block: node.else ? name : null,
		});

		if ( node.else ) {
			generateBlock( generator, block, state, node.else, name );
		}
	}

	return conditionsAndBlocks;
}

function generateBlock ( generator, block, state, node, name ) {
	const childBlock = block.child({
		name
	});

	const childState = Object.assign( {}, state, {
		parentNode: null
	});

	node.children.forEach( node => {
		visit( generator, childBlock, childState, node );
	});

	generator.addBlock( childBlock );
}

export default function visitIfBlock ( generator, block, state, node ) {
	const params = block.params.join( ', ' );
	const name = generator.getUniqueName( `if_block` );
	const getBlock = block.getUniqueName( `get_block` );
	const currentBlock = block.getUniqueName( `current_block` );
	const _currentBlock = block.getUniqueName( `_current_block` );

	const conditionsAndBlocks = getConditionsAndBlocks( generator, block, state, node, generator.getUniqueName( `create_if_block` ) );

	const anchor = `${name}_anchor`;
	block.createAnchor( anchor, state.parentNode );

	block.builders.create.addBlock( deindent`
		function ${getBlock} ( ${params} ) {
			${conditionsAndBlocks.map( ({ condition, block }) => {
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
		if ( ${_currentBlock} === ${currentBlock} && ${name}) {
			${name}.update( changed, ${params} );
		} else {
			if ( ${name} ) ${name}.destroy( true );
			${name} = ${currentBlock} && ${currentBlock}( ${params}, ${block.component} );
			if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );
		}
	` );

	block.builders.destroy.addLine(
		`if ( ${name} ) ${name}.destroy( ${isToplevel ? 'detach' : 'false'} );`
	);
}