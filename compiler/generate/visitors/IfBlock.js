import deindent from '../utils/deindent.js';

// collect all the conditions and blocks in the if/elseif/else chain
function generateBlock ( generator, node, name ) {
	// walk the children here
	generator.push({
		useAnchor: true,
		name,
		target: 'target',
		localElementDepth: 0,

		initStatements: [],
		mountStatements: [],
		updateStatements: [],
		detachStatements: [],
		teardownStatements: [],

		getUniqueName: generator.getUniqueNameMaker()
	});
	node.children.forEach( generator.visit );
	generator.addRenderer( generator.current );
	generator.pop();
	// unset the children, to avoid them being visited again
	node.children = [];
}

function getConditionsAndBlocks ( generator, node, _name, i = 0 ) {
	generator.addSourcemapLocations( node.expression );
	const name = `${_name}_${i}`;

	const conditionsAndBlocks = [{
		condition: generator.contextualise( node.expression ).snippet,
		block: name
	}];
	generateBlock( generator, node, name );

	if ( node.else && node.else.children.length === 1 &&
		node.else.children[0].type === 'IfBlock' ) {
		conditionsAndBlocks.push(
			...getConditionsAndBlocks( generator, node.else.children[0], _name, i + 1 ) );
	} else {
		const name = `${_name}_${i + 1}`;
		conditionsAndBlocks.push({
			condition: null,
			block: node.else ? name : null,
		});
		if (node.else) {
			generateBlock( generator, node.else, name );
		}
	}
	return conditionsAndBlocks;
}

export default {
	enter ( generator, node ) {
		const { params } = generator.current;
		const name = generator.getUniqueName( `ifBlock` );
		const getBlock = generator.getUniqueName( `getBlock` );
		const currentBlock = generator.getUniqueName( `currentBlock` );

		const isToplevel = generator.current.localElementDepth === 0;
		const conditionsAndBlocks = getConditionsAndBlocks( generator, node, generator.getUniqueName( `renderIfBlock` ) );

		const anchor = generator.createAnchor( name, `#if ${generator.source.slice( node.expression.start, node.expression.end )}` );

		generator.current.initStatements.push( deindent`
			function ${getBlock} ( ${params} ) {
				${conditionsAndBlocks.map( ({ condition, block }) => {
					return `${condition ? `if ( ${condition} ) ` : ''}return ${block};`;
				} ).join( '\n' )}
			}

			var ${currentBlock} = ${getBlock}( ${params} );
			var ${name} = ${currentBlock} && ${currentBlock}( ${params}, component );
		` );

		const mountStatement = `if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );`;
		if ( isToplevel ) {
			generator.current.mountStatements.push( mountStatement );
		} else {
			generator.current.initStatements.push( mountStatement );
		}

		generator.current.updateStatements.push( deindent`
			var _${currentBlock} = ${currentBlock};
			${currentBlock} = ${getBlock}( ${params} );
			if ( _${currentBlock} === ${currentBlock} && ${name}) {
				${name}.update( changed, ${params} );
			} else {
				if ( ${name} ) ${name}.teardown( true );
				${name} = ${currentBlock} && ${currentBlock}( ${params}, component );
				if ( ${name} ) ${name}.mount( ${anchor}.parentNode, ${anchor} );
			}
		` );

		generator.current.teardownStatements.push( deindent`
			if ( ${name} ) ${name}.teardown( ${isToplevel ? 'detach' : 'false'} );
		` );
	}
};
