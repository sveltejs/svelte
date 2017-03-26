import deindent from '../../../utils/deindent.js';

function getConditionsAndBlocks ( generator, node, _name, i = 0 ) {
	generator.addSourcemapLocations( node.expression );
	const name = generator.getUniqueName( `${_name}_${i}` );

	const conditionsAndBlocks = [{
		condition: generator.contextualise( node.expression ).snippet,
		block: name
	}];

	generator.generateBlock( node, name );

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
			generator.generateBlock( node.else, name );
		}
	}
	return conditionsAndBlocks;
}

export default {
	enter ( generator, node ) {
		const params = generator.current.params.join( ', ' );
		const name = generator.getUniqueName( `ifBlock` );
		const getBlock = generator.current.getUniqueName( `getBlock` );
		const currentBlock = generator.current.getUniqueName( `currentBlock` );
		const _currentBlock = generator.current.getUniqueName( `_currentBlock` );

		const isToplevel = generator.current.localElementDepth === 0;
		const conditionsAndBlocks = getConditionsAndBlocks( generator, node, generator.getUniqueName( `renderIfBlock` ) );

		const anchor = `${name}_anchor`;
		generator.createAnchor( anchor );

		generator.current.builders.init.addBlock( deindent`
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
			generator.current.builders.init.addLine( mountStatement );
		}

		generator.current.builders.update.addBlock( deindent`
			var ${_currentBlock} = ${currentBlock};
			${currentBlock} = ${getBlock}( ${params} );
			if ( ${_currentBlock} === ${currentBlock} && ${name}) {
				${name}.update( changed, ${params} );
			} else {
				if ( ${name} ) ${name}.teardown( true );
				${name} = ${currentBlock} && ${currentBlock}( ${params}, ${generator.current.component} );
				if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );
			}
		` );

		generator.current.builders.teardown.addLine(
			`if ( ${name} ) ${name}.teardown( ${isToplevel ? 'detach' : 'false'} );`
		);
	}
};
