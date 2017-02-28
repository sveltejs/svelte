import CodeBuilder from '../../../utils/CodeBuilder.js';
import deindent from '../../../utils/deindent.js';
import addElementAttributes from './attributes/addElementAttributes.js';
import Component from './Component.js';

export default {
	enter ( generator, node ) {
		const isComponent = node.name in generator.components;
		if ( isComponent ) {
			return Component.enter( generator, node );
		}

		const name = generator.current.getUniqueName( node.name );

		const local = {
			name,
			namespace: node.name === 'svg' ? 'http://www.w3.org/2000/svg' : generator.current.namespace,
			isComponent: false,

			allUsedContexts: new Set(),

			init: new CodeBuilder(),
			update: new CodeBuilder()
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

			local.init.addBlock( deindent`
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

		local.init.addLineAtStart( render );
		if ( isToplevel ) {
			generator.current.builders.detach.addLine( `${generator.helper( 'detachNode' )}( ${name} );` );
		}

		// special case – bound <option> without a value attribute
		if ( node.name === 'option' && !node.attributes.find( attribute => attribute.type === 'Attribute' && attribute.name === 'value' ) ) { // TODO check it's bound
			// const dynamic = node.children.length > 1 || node.children[0].type !== 'Text';
			// TODO do this in init for static values... have to do it in `leave`, because they don't exist yet
			local.update.addLine(
				`${name}.__value = ${name}.textContent`
			);
		}

		generator.current.builders.init.addBlock( local.init );
		if ( !local.update.isEmpty() ) generator.current.builders.update.addBlock( local.update );

		generator.createMountStatement( name );

		generator.push({
			namespace: local.namespace,
			target: name,
			parent: generator.current,
			localElementDepth: generator.current.localElementDepth + 1,
			key: null
		});
	},

	leave ( generator, node ) {
		const isComponent = node.name in generator.components;
		if ( isComponent ) {
			return Component.leave( generator, node );
		}

		if ( node.initialUpdate ) {
			generator.current.builders.init.addBlock( node.initialUpdate );
		}

		generator.pop();
	}
};
