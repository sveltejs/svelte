import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import visit from '../visit.js';
import addElementAttributes from './attributes/addElementAttributes.js';
import visitComponent from './Component.js';
import visitWindow from './meta/Window.js';

const meta = {
	':Window': visitWindow
};

export default function visitElement ( generator, node ) {
	if ( node.name in meta ) {
		return meta[ node.name ]( generator, node );
	}

	if ( generator.components.has( node.name ) || node.name === ':Self' ) {
		return visitComponent( generator, node );
	}

	const name = generator.current.getUniqueName( node.name );

	const local = {
		name,
		namespace: node.name === 'svg' ? 'http://www.w3.org/2000/svg' : generator.current.namespace,
		isComponent: false,

		allUsedContexts: [],

		create: new CodeBuilder(),
		update: new CodeBuilder(),
		destroy: new CodeBuilder()
	};

	const isToplevel = generator.current.localElementDepth === 0;

	addElementAttributes( generator, node, local );

	if ( local.allUsedContexts.length ) {
		const initialProps = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `root: root`;

			const listName = generator.current.listNames.get( contextName );
			const indexName = generator.current.indexNames.get( contextName );

			return `${listName}: ${listName},\n${indexName}: ${indexName}`;
		}).join( ',\n' );

		const updates = local.allUsedContexts.map( contextName => {
			if ( contextName === 'root' ) return `${name}.__svelte.root = root;`;

			const listName = generator.current.listNames.get( contextName );
			const indexName = generator.current.indexNames.get( contextName );

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
		generator.current.builders.detach.addLine( `${generator.helper( 'detachNode' )}( ${name} );` );
	}

	// special case – bound <option> without a value attribute
	if ( node.name === 'option' && !node.attributes.find( attribute => attribute.type === 'Attribute' && attribute.name === 'value' ) ) { 	// TODO check it's bound
		const statement = `${name}.__value = ${name}.textContent;`;
		local.update.addLine( statement );
		node.initialUpdate = statement;
	}

	generator.current.builders.create.addBlock( local.create );
	if ( !local.update.isEmpty() ) generator.current.builders.update.addBlock( local.update );
	if ( !local.destroy.isEmpty() ) generator.current.builders.destroy.addBlock( local.destroy );

	generator.createMountStatement( name );

	generator.push({
		type: 'element',
		namespace: local.namespace,
		target: name,
		parent: generator.current,
		localElementDepth: generator.current.localElementDepth + 1,
		key: null
	});

	generator.elementDepth += 1;

	node.children.forEach( child => {
		visit( child, generator );
	});

	generator.elementDepth -= 1;

	if ( node.initialUpdate ) {
		generator.current.builders.create.addBlock( node.initialUpdate );
	}

	generator.pop();
}