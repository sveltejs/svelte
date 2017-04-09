import deindent from '../../../../utils/deindent.js';
import visit from '../../visit.js';
import addElementAttributes from './attributes/addElementAttributes.js';
import visitComponent from '../Component/Component.js';
import visitWindow from './meta/Window.js';

const meta = {
	':Window': visitWindow
};

export default function visitElement ( generator, block, state, node ) {
	if ( node.name in meta ) {
		return meta[ node.name ]( generator, block, node );
	}

	if ( generator.components.has( node.name ) || node.name === ':Self' ) {
		return visitComponent( generator, block, state, node );
	}

	const name = block.getUniqueName( node.name );

	const childState = Object.assign( {}, state, {
		isTopLevel: false,
		parentNode: name,
		namespace: node.name === 'svg' ? 'http://www.w3.org/2000/svg' : state.namespace
	});

	block.builders.create.addLine( `var ${name} = ${getRenderStatement( generator, childState.namespace, node.name )};` );

	if ( !state.parentNode ) {
		block.builders.detach.addLine( `${generator.helper( 'detachNode' )}( ${name} );` );
	}

	// add CSS encapsulation attribute
	if ( generator.cssId && state.isTopLevel ) {
		block.builders.create.addLine( `${generator.helper( 'setAttribute' )}( ${name}, '${generator.cssId}', '' );` );
	}

	const local = {
		allUsedContexts: []
	};

	addElementAttributes( generator, block, childState, node, local );

	if ( local.allUsedContexts.length ) {
		const initialProps = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `root: root`;

			const listName = block.listNames.get( contextName );
			const indexName = block.indexNames.get( contextName );

			return `${listName}: ${listName},\n${indexName}: ${indexName}`;
		}).join( ',\n' );

		const updates = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `${name}.__svelte.root = root;`;

			const listName = block.listNames.get( contextName );
			const indexName = block.indexNames.get( contextName );

			return `${name}.__svelte.${listName} = ${listName};\n${name}.__svelte.${indexName} = ${indexName};`;
		}).join( '\n' );

		block.builders.create.addBlock( deindent`
			${name}.__svelte = {
				${initialProps}
			};
		` );

		block.builders.update.addBlock( updates );
	}

	// special case – bound <option> without a value attribute
	if ( node.name === 'option' && !node.attributes.find( attribute => attribute.type === 'Attribute' && attribute.name === 'value' ) ) { 	// TODO check it's bound
		const statement = `${name}.__value = ${name}.textContent;`;
		block.builders.update.addLine( statement );
		node.initialUpdate = statement;
	}

	block.createMountStatement( name, state.parentNode );

	node.children.forEach( child => {
		visit( generator, block, childState, child );
	});

	if ( node.initialUpdate ) {
		block.builders.create.addBlock( node.initialUpdate );
	}
}

function getRenderStatement ( generator, namespace, name ) {
	if ( namespace ) {
		if ( namespace === 'http://www.w3.org/2000/svg' ) {
			return `${generator.helper( 'createSvgElement' )}( '${name}' )`;
		}

		return `document.createElementNS( '${namespace}', '${name}' )`;
	}

	return `${generator.helper( 'createElement' )}( '${name}' )`;
}