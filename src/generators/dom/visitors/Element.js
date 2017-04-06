import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';
import addElementAttributes from './attributes/addElementAttributes.js';
import visitComponent from './Component.js';
import visitWindow from './meta/Window.js';

const meta = {
	':Window': visitWindow
};

export default function visitElement ( generator, fragment, node ) {
	if ( node.name in meta ) {
		return meta[ node.name ]( generator, fragment, node );
	}

	if ( generator.components.has( node.name ) || node.name === ':Self' ) {
		return visitComponent( generator, fragment, node );
	}

	const name = fragment.getUniqueName( node.name );

	const local = {
		name,
		namespace: node.name === 'svg' ? 'http://www.w3.org/2000/svg' : fragment.namespace,
		isComponent: false,

		allUsedContexts: [],

		create: new CodeBuilder(),
		update: new CodeBuilder(),
		destroy: new CodeBuilder()
	};

	const isToplevel = fragment.localElementDepth === 0;

	addElementAttributes( generator, fragment, node, local );

	if ( local.allUsedContexts.length ) {
		const initialProps = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `root: root`;

			const listName = fragment.listNames.get( contextName );
			const indexName = fragment.indexNames.get( contextName );

			return `${listName}: ${listName},\n${indexName}: ${indexName}`;
		}).join( ',\n' );

		const updates = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `${name}.__svelte.root = root;`;

			const listName = fragment.listNames.get( contextName );
			const indexName = fragment.indexNames.get( contextName );

			return `${name}.__svelte.${listName} = ${listName};\n${name}.__svelte.${indexName} = ${indexName};`;
		}).join( '\n' );

		local.create.addBlock( deindent`
			${name}.__svelte = {
				${initialProps}
			};
		` );

		local.update.addBlock( updates );
	}

	let render;

	if ( local.namespace ) {
		if ( local.namespace === 'http://www.w3.org/2000/svg' ) {
			render = `var ${name} = ${generator.helper( 'createSvgElement' )}( '${node.name}' )`;
		} else {
			render = `var ${name} = document.createElementNS( '${local.namespace}', '${node.name}' );`;
		}
	} else {
		render = `var ${name} = ${generator.helper( 'createElement' )}( '${node.name}' );`;
	}

	if ( generator.cssId && !generator.elementDepth ) {
		render += `\n${generator.helper( 'setAttribute' )}( ${name}, '${generator.cssId}', '' );`;
	}

	local.create.addLineAtStart( render );
	if ( isToplevel ) {
		fragment.builders.detach.addLine( `${generator.helper( 'detachNode' )}( ${name} );` );
	}

	// special case – bound <option> without a value attribute
	if ( node.name === 'option' && !node.attributes.find( attribute => attribute.type === 'Attribute' && attribute.name === 'value' ) ) { 	// TODO check it's bound
		const statement = `${name}.__value = ${name}.textContent;`;
		local.update.addLine( statement );
		node.initialUpdate = statement;
	}

	fragment.builders.create.addBlock( local.create );
	if ( !local.update.isEmpty() ) fragment.builders.update.addBlock( local.update );
	if ( !local.destroy.isEmpty() ) fragment.builders.destroy.addBlock( local.destroy );

	fragment.createMountStatement( name );

	const childFragment = fragment.child({
		type: 'element',
		namespace: local.namespace,
		target: name,
		parent: fragment,
		localElementDepth: fragment.localElementDepth + 1,
		key: null
	});

	generator.push( childFragment );

	generator.elementDepth += 1;

	node.children.forEach( child => {
		visit( generator, childFragment, child );
	});

	generator.elementDepth -= 1;

	if ( node.initialUpdate ) {
		fragment.builders.create.addBlock( node.initialUpdate );
	}

	generator.pop();
}