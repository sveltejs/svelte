import deindent from '../../../utils/deindent.js';

function getConditionsAndBlocks ( generator, node, _name, i = 0 ) {
	generator.addSourcemapLocations( node.expression );
	const name = generator.getUniqueName( `${_name}_${i}` );

	const conditionsAndBlocks = [{
		condition: generator.contextualise( node.expression ).snippet,
		block: name
	}];

	generator.generateBlock( node, name, 'block' );

	if ( node.else && node.else.children.length === 1 &&
		node.else.children[0].type === 'IfBlock' ) {
		conditionsAndBlocks.push(
			...getConditionsAndBlocks( generator, node.else.children[0], _name, i + 1 )
		);
	} else {
		const name = generator.getUniqueName( `${_name}_${i + 1}` );
		conditionsAndBlocks.push({
			condition: null,
			block: node.else ? name : null,
		});

		if ( node.else ) {
			generator.generateBlock( node.else, name, 'block' );
		}
	}
	return conditionsAndBlocks;
}

export default function visitIfBlock ( generator, node ) {
	const params = generator.current.params.join( ', ' );
	const name = generator.getUniqueName( `if_block` );
	const getBlock = generator.current.getUniqueName( `get_block` );
	const currentBlock = generator.current.getUniqueName( `current_block` );
	const _currentBlock = generator.current.getUniqueName( `_current_block` );

	const isToplevel = generator.current.localElementDepth === 0;
	const conditionsAndBlocks = getConditionsAndBlocks( generator, node, generator.getUniqueName( `render_if_block` ) );

	const anchor = `${name}_anchor`;
	generator.createAnchor( anchor );

	generator.current.builders.create.addBlock( deindent`
		function ${getBlock} ( ${params} ) {
			${conditionsAndBlocks.map( ({ condition, block }) => {
				return `${condition ? `if ( ${condition} ) ` : ''}return ${block};`;
			} ).join( '\n' )}
		}

		var ${currentBlock} = ${getBlock}( ${params} );
		var ${name} = ${currentBlock} && ${currentBlock}( ${params}, ${generator.current.component} );
	` );

	const mountStatement = `if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );`;
	if ( isToplevel ) {
		generator.current.builders.mount.addLine( mountStatement );
	} else {
		generator.current.builders.create.addLine( mountStatement );
	}

	generator.current.builders.update.addBlock( deindent`
		var ${_currentBlock} = ${currentBlock};
		${currentBlock} = ${getBlock}( ${params} );
		if ( ${_currentBlock} === ${currentBlock} && ${name}) {
			${name}.update( changed, ${params} );
		} else {
			if ( ${name} ) ${name}.destroy( true );
			${name} = ${currentBlock} && ${currentBlock}( ${params}, ${generator.current.component} );
			if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );
		}
	` );

	generator.current.builders.destroy.addLine(
		`if ( ${name} ) ${name}.destroy( ${isToplevel ? 'detach' : 'false'} );`
	);
}