import deindent from '../../../../utils/deindent.js';
import visit from '../../visit.js';
import visitComponent from '../Component/Component.js';
import visitWindow from './meta/Window.js';
import visitAttribute from './Attribute.js';
import visitEventHandler from './EventHandler.js';
import visitBinding from './Binding.js';
import visitRef from './Ref.js';

const meta = {
	':Window': visitWindow
};

const order = {
	Attribute: 1,
	Binding: 2,
	EventHandler: 3,
	Ref: 4
};

const visitors = {
	Attribute: visitAttribute,
	EventHandler: visitEventHandler,
	Binding: visitBinding,
	Ref: visitRef
};

export default function visitElement ( generator, block, state, node ) {
	if ( node.name in meta ) {
		return meta[ node.name ]( generator, block, node );
	}

	if ( generator.components.has( node.name ) || node.name === ':Self' ) {
		return visitComponent( generator, block, state, node );
	}

	const name = block.getUniqueName( node.name.replace( /[^a-zA-Z_$]/g, '_' ) );

	const childState = Object.assign( {}, state, {
		isTopLevel: false,
		parentNode: name,
		parentNodeName: node.name,
		namespace: node.name === 'svg' ? 'http://www.w3.org/2000/svg' : state.namespace,
		allUsedContexts: []
	});

	block.builders.create.addLine( `var ${name} = ${getRenderStatement( generator, childState.namespace, node.name )};` );
	block.mount( name, state.parentNode );

	if ( !state.parentNode ) {
		block.builders.detach.addLine( `${generator.helper( 'detachNode' )}( ${name} );` );
	}

	// add CSS encapsulation attribute
	if ( generator.cssId && state.isTopLevel ) {
		block.builders.create.addLine( `${generator.helper( 'setAttribute' )}( ${name}, '${generator.cssId}', '' );` );
	}

	let selectValueAttribute;

	node.attributes
		.sort( ( a, b ) => order[ a.type ] - order[ b.type ] )
		.forEach( attribute => {
			// <select> value attributes are an annoying special case — it must be handled
			// *after* its children have been updated
			if ( ( attribute.type === 'Attribute' || attribute.type === 'Binding' ) && attribute.name === 'value' && node.name === 'select' ) {
				selectValueAttribute = attribute;
				return;
			}

			visitors[ attribute.type ]( generator, block, childState, node, attribute );
		});

	// special case – bound <option> without a value attribute
	if ( node.name === 'option' && !node.attributes.find( attribute => attribute.type === 'Attribute' && attribute.name === 'value' ) ) { 	// TODO check it's bound
		const statement = `${name}.__value = ${name}.textContent;`;
		node.initialUpdate = node.lateUpdate = statement;
	}

	if ( childState.allUsedContexts.length || childState.usesComponent ) {
		const initialProps = [];
		const updates = [];

		if ( childState.usesComponent ) {
			initialProps.push( `component: ${block.component}` );
		}

		childState.allUsedContexts.forEach( contextName => {
			if ( contextName === 'state' ) return;

			const listName = block.listNames.get( contextName );
			const indexName = block.indexNames.get( contextName );

			initialProps.push( `${listName}: ${listName},\n${indexName}: ${indexName}` );
			updates.push( `${name}._svelte.${listName} = ${listName};\n${name}._svelte.${indexName} = ${indexName};` );
		});

		if ( initialProps.length ) {
			block.builders.create.addBlock( deindent`
				${name}._svelte = {
					${initialProps.join( ',\n' )}
				};
			` );
		}

		if ( updates.length ) {
			block.builders.update.addBlock( updates.join( '\n' ) );
		}
	}

	node.children.forEach( child => {
		visit( generator, block, childState, child );
	});

	if ( node.lateUpdate ) {
		block.builders.update.addLine( node.lateUpdate );
	}

	if ( selectValueAttribute ) {
		const visitor = selectValueAttribute.type === 'Attribute' ? visitAttribute : visitBinding;
		visitor( generator, block, childState, node, selectValueAttribute );
	}

	if ( node.initialUpdate ) {
		block.builders.create.addBlock( node.initialUpdate );
	}
}

function getRenderStatement ( generator, namespace, name ) {
	if ( namespace === 'http://www.w3.org/2000/svg' ) {
		return `${generator.helper( 'createSvgElement' )}( '${name}' )`;
	}

	if ( namespace ) {
		return `document.createElementNS( '${namespace}', '${name}' )`;
	}

	return `${generator.helper( 'createElement' )}( '${name}' )`;
}
