import deindent from '../utils/deindent.js';
import addElementAttributes from './attributes/addElementAttributes.js';
import Component from './Component.js';

export default {
	enter ( generator, node ) {
		const isComponent = node.name in generator.components;
		if ( isComponent ) {
			return Component.enter( generator, node );
		}

		const name = generator.current.counter( node.name );

		const local = {
			name,
			namespace: node.name === 'svg' ? 'http://www.w3.org/2000/svg' : generator.current.namespace,
			isComponent: false,

			allUsedContexts: new Set(),

			init: [],
			mount: [],
			update: [],
			detach: [],
			teardown: []
		};

		const isToplevel = generator.current.localElementDepth === 0;

		addElementAttributes( generator, node, local );

		if ( local.allUsedContexts.size ) {
			const contextNames = [...local.allUsedContexts];

			const initialProps = contextNames.map( contextName => {
				if ( contextName === 'root' ) return `root: root`;

				const listName = generator.current.listNames[ contextName ];
				const indexName = generator.current.indexNames[ contextName ];

				return `${listName}: ${listName},\n${indexName}: ${indexName}`;
			}).join( ',\n' );

			const updates = contextNames.map( contextName => {
				if ( contextName === 'root' ) return `${name}.__svelte.root = root;`;

				const listName = generator.current.listNames[ contextName ];
				const indexName = generator.current.indexNames[ contextName ];

				return `${name}.__svelte.${listName} = ${listName};\n${name}.__svelte.${indexName} = ${indexName};`;
			}).join( '\n' );

			local.init.push( deindent`
				${name}.__svelte = {
					${initialProps}
				};
			` );

			local.update.push( updates );
		}

		let render = local.namespace ?
			`var ${name} = document.createElementNS( '${local.namespace}', '${node.name}' );` :
			`var ${name} = document.createElement( '${node.name}' );`;

		if ( generator.cssId && !generator.current.elementDepth ) {
			render += `\n${name}.setAttribute( '${generator.cssId}', '' );`;
		}

		local.init.unshift( render );
		if ( isToplevel ) {
			local.detach.push( `${name}.parentNode.removeChild( ${name} );` );
		}

		// special case – bound <option> without a value attribute
		if ( node.name === 'option' && !node.attributes.find( attribute => attribute.type === 'Attribute' && attribute.name === 'value' ) ) { // TODO check it's bound
			// const dynamic = node.children.length > 1 || node.children[0].type !== 'Text';
			// TODO do this in init for static values... have to do it in `leave`, because they don't exist yet
			local.update.push( `${name}.__value = ${name}.textContent` );
		}

		generator.current.initStatements.push( local.init.join( '\n' ) );
		if ( local.update.length ) generator.current.updateStatements.push( local.update.join( '\n' ) );
		if ( local.mount.length ) generator.current.mountStatements.push( local.mount.join( '\n' ) );
		if ( local.detach.length ) generator.current.detachStatements.push( local.detach.join( '\n' ) );
		generator.current.teardownStatements.push( local.teardown.join( '\n' ) );

		generator.createMountStatement( name );

		generator.push({
			namespace: local.namespace,
			target: name,
			parent: generator.current,
			elementDepth: generator.current.elementDepth + 1,
			localElementDepth: generator.current.localElementDepth + 1
		});
	},

	leave ( generator, node ) {
		const isComponent = node.name in generator.components;
		if ( isComponent ) {
			return Component.leave( generator, node );
		}

		generator.pop();
	}
};
