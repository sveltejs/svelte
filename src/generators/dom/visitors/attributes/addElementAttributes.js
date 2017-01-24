import attributeLookup from './lookup.js';
import createBinding from './binding/index.js';
import deindent from '../../../../utils/deindent.js';
import flattenReference from '../../../../utils/flattenReference.js';

export default function addElementAttributes ( generator, node, local ) {
	node.attributes.forEach( attribute => {
		const name = attribute.name;

		if ( attribute.type === 'Attribute' ) {
			let metadata = local.namespace ? null : attributeLookup[ name ];
			if ( metadata && metadata.appliesTo && !~metadata.appliesTo.indexOf( node.name ) ) metadata = null;

			let dynamic = false;

			const isBoundOptionValue = node.name === 'option' && name === 'value'; // TODO check it's actually bound
			const propertyName = isBoundOptionValue ? '__value' : metadata && metadata.propertyName;

			const isXlink = name.slice( 0, 6 ) === 'xlink:';

			// xlink is a special case... we could maybe extend this to generic
			// namespaced attributes but I'm not sure that's applicable in
			// HTML5?
			const helper = isXlink ? 'setXlinkAttribute' : 'setAttribute';

			if ( attribute.value === true ) {
				// attributes without values, e.g. <textarea readonly>
				if ( propertyName ) {
					local.init.addLine(
						`${local.name}.${propertyName} = true;`
					);
				} else {
					generator.uses[ helper ] = true;
					local.init.addLine(
						`${helper}( ${local.name}, '${name}', true );`
					);
				}

				// special case – autofocus. has to be handled in a bit of a weird way
				if ( name === 'autofocus' ) {
					generator.current.autofocus = local.name;
				}
			}

			else if ( attribute.value.length === 0 ) {
				if ( propertyName ) {
					local.init.addLine(
						`${local.name}.${propertyName} = '';`
					);
				} else {
					generator.uses[ helper ] = true;
					local.init.addLine(
						`${helper}( ${local.name}, '${name}', '' );`
					);
				}
			}

			else if ( attribute.value.length === 1 ) {
				const value = attribute.value[0];

				let result = '';

				if ( value.type === 'Text' ) {
					// static attributes
					result = JSON.stringify( value.data );

					if ( name === 'xmlns' ) {
						// special case
						// TODO this attribute must be static – enforce at compile time
						local.namespace = value.data;
					} else if ( propertyName ) {
						local.init.addLine(
							`${local.name}.${propertyName} = ${result};`
						);
					} else {
						generator.uses[ helper ] = true;
						local.init.addLine(
							`${helper}( ${local.name}, '${name}', ${result} );`
						);
					}
				}

				else {
					dynamic = true;

					// dynamic – but potentially non-string – attributes
					const { snippet } = generator.contextualise( value.expression );

					let updater;
					if (propertyName) {
						updater = `${local.name}.${propertyName} = ${snippet};`;
					} else {
						generator.uses[ helper ] = true;
						updater = `${helper}( ${local.name}, '${name}', ${snippet} );`; // TODO use snippet both times – see note below
					}

					local.init.addLine( updater );
					local.update.addLine( updater );
				}
			}

			else {
				dynamic = true;

				const value = ( attribute.value[0].type === 'Text' ? '' : `"" + ` ) + (
					attribute.value.map( chunk => {
						if ( chunk.type === 'Text' ) {
							return JSON.stringify( chunk.data );
						} else {
							generator.addSourcemapLocations( chunk.expression );

							const { string } = generator.contextualise( chunk.expression ); // TODO use snippet for sourcemap support – need to add a 'copy' feature to MagicString first
							return `( ${string} )`;
						}
					}).join( ' + ' )
				);

				let updater;
				if (propertyName) {
					updater = `${local.name}.${propertyName} = ${value};`;
				} else {
					generator.uses[ helper ] = true;
					updater = `${helper}( ${local.name}, '${name}', ${value} );`;
				}

				local.init.addLine( updater );
				local.update.addLine( updater );
			}

			if ( isBoundOptionValue ) {
				( dynamic ? local.update : local.init ).addLine( `${local.name}.value = ${local.name}.__value` );
			}
		}

		else if ( attribute.type === 'EventHandler' ) {
			// TODO verify that it's a valid callee (i.e. built-in or declared method)
			generator.addSourcemapLocations( attribute.expression );

			const flattened = flattenReference( attribute.expression.callee );
			if ( flattened.name !== 'event' && flattened.name !== 'this' ) {
				// allow event.stopPropagation(), this.select() etc
				generator.code.prependRight( attribute.expression.start, 'component.' );
			}

			const usedContexts = new Set();
			attribute.expression.arguments.forEach( arg => {
				const { contexts } = generator.contextualise( arg, true );

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

			const handlerName = generator.current.getUniqueName( `${name}Handler` );
			const handlerBody = ( declarations.length ? declarations.join( '\n' ) + '\n\n' : '' ) + `[✂${attribute.expression.start}-${attribute.expression.end}✂];`;

			if ( name in generator.events ) {
				local.init.addBlock( deindent`
					var ${handlerName} = template.events.${name}.call( component, ${local.name}, function ( event ) {
						${handlerBody}
					});
				` );

				generator.current.builders.teardown.addLine( deindent`
					${handlerName}.teardown();
				` );
			} else {
				generator.uses.addEventListener = true;
				generator.uses.removeEventListener = true;
				local.init.addBlock( deindent`
					function ${handlerName} ( event ) {
						${handlerBody}
					}

					addEventListener( ${local.name}, '${name}', ${handlerName} );
				` );

				generator.current.builders.teardown.addLine( deindent`
					removeEventListener( ${local.name}, '${name}', ${handlerName} );
				` );
			}
		}

		else if ( attribute.type === 'Binding' ) {
			createBinding( generator, node, attribute, generator.current, local );
		}

		else if ( attribute.type === 'Ref' ) {
			generator.usesRefs = true;

			local.init.addLine(
				`component.refs.${name} = ${local.name};`
			);

			generator.current.builders.teardown.addLine( deindent`
				if ( component.refs.${name} === ${local.name} ) component.refs.${name} = null;
			` );
		}

		else {
			throw new Error( `Not implemented: ${attribute.type}` );
		}
	});
}
