import createBinding from './binding/index.js';
import deindent from '../../../utils/deindent.js';

export default function addComponentAttributes ( generator, node, local ) {
	local.staticAttributes = [];
	local.dynamicAttributes = [];
	local.bindings = [];

	node.attributes.forEach( attribute => {
		if ( attribute.type === 'Attribute' ) {
			if ( attribute.value === true ) {
				// attributes without values, e.g. <textarea readonly>
				local.staticAttributes.push({
					name: attribute.name,
					value: true
				});
			}

			else if ( attribute.value.length === 0 ) {
				local.staticAttributes.push({
					name: attribute.name,
					value: `''`
				});
			}

			else if ( attribute.value.length === 1 ) {
				const value = attribute.value[0];

				if ( value.type === 'Text' ) {
					// static attributes
					const result = isNaN( parseFloat( value.data ) ) ? JSON.stringify( value.data ) : value.data;
					local.staticAttributes.push({
						name: attribute.name,
						value: result
					});
				}

				else {
					// simple dynamic attributes
					const { dependencies, string } = generator.contextualise( value.expression );

					// TODO only update attributes that have changed
					local.dynamicAttributes.push({
						name: attribute.name,
						value: string,
						dependencies
					});
				}
			}

			else {
				// complex dynamic attributes
				const allDependencies = [];

				const value = ( attribute.value[0].type === 'Text' ? '' : `"" + ` ) + (
					attribute.value.map( chunk => {
						if ( chunk.type === 'Text' ) {
							return JSON.stringify( chunk.data );
						} else {
							generator.addSourcemapLocations( chunk.expression );

							const { dependencies, string } = generator.contextualise( chunk.expression );
							dependencies.forEach( dependency => {
								if ( !~allDependencies.indexOf( dependency ) ) allDependencies.push( dependency );
							});

							return `( ${string} )`;
						}
					}).join( ' + ' )
				);

				local.dynamicAttributes.push({
					name: attribute.name,
					value,
					dependencies: allDependencies
				});
			}
		}

		else if ( attribute.type === 'EventHandler' ) {
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			generator.addSourcemapLocations( attribute.expression );
			generator.code.prependRight( attribute.expression.start, 'component.' );

			const usedContexts = new Set();
			attribute.expression.arguments.forEach( arg => {
				const { contexts } = generator.contextualise( arg, true, true );

				contexts.forEach( context => {
					usedContexts.add( context );
					local.allUsedContexts.add( context );
				});
			});

			// TODO hoist event handlers? can do `this.__component.method(...)`
			const declarations = [...usedContexts].map( name => {
				if ( name === 'root' ) return 'var root = this.__svelte.root;';

				const listName = generator.current.listNames[ name ];
				const indexName = generator.current.indexNames[ name ];

				return `var ${listName} = this.__svelte.${listName}, ${indexName} = this.__svelte.${indexName}, ${name} = ${listName}[${indexName}]`;
			});

			const handlerBody = ( declarations.length ? declarations.join( '\n' ) + '\n\n' : '' ) + `[✂${attribute.expression.start}-${attribute.expression.end}✂];`;

			local.init.addBlock( deindent`
				${local.name}.on( '${attribute.name}', function ( event ) {
					${handlerBody}
				});
			` );
		}

		else if ( attribute.type === 'Binding' ) {
			createBinding( generator, node, attribute, generator.current, local );
		}

		else if ( attribute.type === 'Ref' ) {
			generator.usesRefs = true;

			local.init.addLine(
				`component.refs.${attribute.name} = ${local.name};`
			);

			generator.current.builders.teardown.addLine( deindent`
				if ( component.refs.${attribute.name} === ${local.name} ) component.refs.${attribute.name} = null;
			` );
		}

		else {
			throw new Error( `Not implemented: ${attribute.type}` );
		}
	});
}
