import deindent from '../utils/deindent.js';
import attributeLookup from '../attributes/lookup.js';
import createBinding from '../binding/index.js';

export default {
	enter ( generator, node ) {
		const name = generator.current.counter( node.name );
		let namespace = name === 'svg' ? 'http://www.w3.org/2000/svg' : generator.current.namespace;

		const initStatements = [];

		const updateStatements = [];
		const teardownStatements = [];

		const allUsedContexts = new Set();

		node.attributes.forEach( attribute => {
			if ( attribute.type === 'Attribute' ) {
				let metadata = attributeLookup[ attribute.name ];
				if ( metadata && metadata.appliesTo && !~metadata.appliesTo.indexOf( node.name ) ) metadata = null;

				if ( attribute.value === true ) {
					// attributes without values, e.g. <textarea readonly>
					if ( metadata ) {
						initStatements.push( deindent`
							${name}.${metadata.propertyName} = true;
						` );
					} else {
						initStatements.push( deindent`
							${name}.setAttribute( '${attribute.name}', true );
						` );
					}

					// special case – autofocus. has to be handled in a bit of a weird way
					if ( attribute.name === 'autofocus' ) {
						generator.current.autofocus = name;
					}
				}

				else if ( attribute.value.length === 1 ) {
					const value = attribute.value[0];

					let result = '';

					if ( value.type === 'Text' ) {
						// static attributes
						result = JSON.stringify( value.data );

						if ( metadata ) {
							initStatements.push( deindent`
								${name}.${metadata.propertyName} = ${result};
							` );
						} else {
							initStatements.push( deindent`
								${name}.setAttribute( '${attribute.name}', ${result} );
							` );
						}

						// special case
						// TODO this attribute must be static – enforce at compile time
						if ( attribute.name === 'xmlns' ) {
							namespace = value;
						}
					}

					else {
						// dynamic – but potentially non-string – attributes
						generator.contextualise( value.expression );
						result = `[✂${value.expression.start}-${value.expression.end}✂]`;

						if ( metadata ) {
							updateStatements.push( deindent`
								${name}.${metadata.propertyName} = ${result};
							` );
						} else {
							updateStatements.push( deindent`
								${name}.setAttribute( '${attribute.name}', ${result} );
							` );
						}
					}
				}

				else {
					const value = ( attribute.value[0].type === 'Text' ? '' : `"" + ` ) + (
						attribute.value.map( chunk => {
							if ( chunk.type === 'Text' ) {
								return JSON.stringify( chunk.data );
							} else {
								generator.addSourcemapLocations( chunk.expression );

								generator.contextualise( chunk.expression );
								return `( [✂${chunk.expression.start}-${chunk.expression.end}✂] )`;
							}
						}).join( ' + ' )
					);

					if ( metadata ) {
						updateStatements.push( deindent`
							${name}.${metadata.propertyName} = ${value};
						` );
					} else {
						updateStatements.push( deindent`
							${name}.setAttribute( '${attribute.name}', ${value} );
						` );
					}
				}
			}

			else if ( attribute.type === 'EventHandler' ) {
				// TODO verify that it's a valid callee (i.e. built-in or declared method)
				generator.addSourcemapLocations( attribute.expression );
				generator.code.insertRight( attribute.expression.start, 'component.' );

				const usedContexts = new Set();
				attribute.expression.arguments.forEach( arg => {
					const contexts = generator.contextualise( arg, true );

					contexts.forEach( context => {
						usedContexts.add( context );
						allUsedContexts.add( context );
					});
				});

				// TODO hoist event handlers? can do `this.__component.method(...)`
				const declarations = [...usedContexts].map( name => {
					if ( name === 'root' ) return 'var root = this.__svelte.root;';

					const listName = generator.current.listNames[ name ];
					const indexName = generator.current.indexNames[ name ];

					return `var ${listName} = this.__svelte.${listName}, ${indexName} = this.__svelte.${indexName}, ${name} = ${listName}[${indexName}]`;
				});

				const handlerName = generator.current.counter( `${attribute.name}Handler` );
				const handlerBody = ( declarations.length ? declarations.join( '\n' ) + '\n\n' : '' ) + `[✂${attribute.expression.start}-${attribute.expression.end}✂];`;

				if ( attribute.name in generator.events ) {
					initStatements.push( deindent`
						const ${handlerName} = template.events.${attribute.name}( ${name}, function ( event ) {
							${handlerBody}
						});
					` );

					teardownStatements.push( deindent`
						${handlerName}.teardown();
					` );
				} else {
					initStatements.push( deindent`
						function ${handlerName} ( event ) {
							${handlerBody}
						}

						${name}.addEventListener( '${attribute.name}', ${handlerName}, false );
					` );

					teardownStatements.push( deindent`
						${name}.removeEventListener( '${attribute.name}', ${handlerName}, false );
					` );
				}
			}

			else if ( attribute.type === 'Binding' ) {
				createBinding( node, name, attribute, generator.current, initStatements, updateStatements, teardownStatements, allUsedContexts );
			}

			else if ( attribute.type === 'Ref' ) {
				generator.usesRefs = true;

				initStatements.push( deindent`
					component.refs.${attribute.name} = ${name};
				` );

				teardownStatements.push( deindent`
					component.refs.${attribute.name} = null;
				` );
			}

			else {
				throw new Error( `Not implemented: ${attribute.type}` );
			}
		});

		if ( allUsedContexts.size ) {
			initStatements.push( deindent`
				${name}.__svelte = {};
			` );

			const declarations = [...allUsedContexts].map( contextName => {
				if ( contextName === 'root' ) return `${name}.__svelte.root = root;`;

				const listName = generator.current.listNames[ contextName ];
				const indexName = generator.current.indexNames[ contextName ];

				return `${name}.__svelte.${listName} = ${listName};\n${name}.__svelte.${indexName} = ${indexName};`;
			}).join( '\n' );

			updateStatements.push( declarations );
		}

		initStatements.unshift(
			namespace ?
				`var ${name} = document.createElementNS( '${namespace}', '${node.name}' );` :
				`var ${name} = document.createElement( '${node.name}' );`
		);

		teardownStatements.push( `${name}.parentNode.removeChild( ${name} );` );

		generator.current.initStatements.push( initStatements.join( '\n' ) );
		if ( updateStatements.length ) generator.current.updateStatements.push( updateStatements.join( '\n' ) );
		generator.current.teardownStatements.push( teardownStatements.join( '\n' ) );

		generator.current = Object.assign( {}, generator.current, {
			namespace,
			target: name,
			parent: generator.current
		});
	},

	leave ( generator ) {
		const name = generator.current.target;

		generator.current = generator.current.parent;

		if ( generator.current.useAnchor && generator.current.target === 'target' ) {
			generator.current.initStatements.push( deindent`
				anchor.parentNode.insertBefore( ${name}, anchor );
			` );
		} else {
			generator.current.initStatements.push( deindent`
				${generator.current.target}.appendChild( ${name} );
			` );
		}
	}
};
