import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import deindent from './utils/deindent.js';
import walkHtml from './utils/walkHtml.js';
import isReference from './utils/isReference.js';
import counter from './utils/counter.js';
import attributeLookup from './attributes/lookup.js';
import createBinding from './binding/index.js';
import flattenReference from './utils/flattenReference.js';

function createRenderer ( fragment ) {
	if ( fragment.autofocus ) {
		fragment.initStatements.push( `${fragment.autofocus}.focus();` );
	}

	return deindent`
		function ${fragment.name} ( component, target${fragment.useAnchor ? ', anchor' : ''} ) {
			${fragment.initStatements.join( '\n\n' )}

			return {
				update: function ( ${fragment.contextChain.join( ', ' )} ) {
					${fragment.updateStatements.join( '\n\n' )}
				},

				teardown: function () {
					${fragment.teardownStatements.join( '\n\n' )}
				}
			};
		}
	`;
}

export default function generate ( parsed, template, options = {} ) {
	const generator = {
		code: new MagicString( template ),

		addSourcemapLocations ( node ) {
			walk( node, {
				enter ( node ) {
					generator.code.addSourcemapLocation( node.start );
					generator.code.addSourcemapLocation( node.end );
				}
			});
		},

		contextualise ( expression, isEventHandler ) {
			const usedContexts = [];

			const contexts = generator.current.contexts;
			const indexes = generator.current.indexes;

			walk( expression, {
				enter ( node, parent ) {
					if ( isReference( node, parent ) ) {
						const { name } = flattenReference( node );

						if ( parent && parent.type === 'CallExpression' && node === parent.callee ) {
							if ( helpers[ name ] ) generator.code.insertRight( node.start, `template.helpers.` );
							return;
						}

						if ( name === 'event' && isEventHandler ) {
							return;
						}

						if ( contexts[ name ] ) {
							if ( !~usedContexts.indexOf( name ) ) usedContexts.push( name );
						} else if ( indexes[ name ] ) {
							const context = indexes[ name ];
							if ( !~usedContexts.indexOf( context ) ) usedContexts.push( context );
						} else {
							generator.code.insertRight( node.start, `root.` );
							if ( !~usedContexts.indexOf( 'root' ) ) usedContexts.push( 'root' );
						}

						this.skip();
					}
				}
			});

			return usedContexts;
		},

		renderers: [],

		getName: counter(),

		// TODO use getName instead of counters
		counters: {
			if: 0,
			each: 0
		},

		usesRefs: false
	};

	const templateProperties = {};
	const helpers = {};
	const components = {};

	if ( parsed.js ) {
		generator.addSourcemapLocations( parsed.js.content );

		const defaultExport = parsed.js.content.body.find( node => node.type === 'ExportDefaultDeclaration' );

		if ( defaultExport ) {
			generator.code.overwrite( defaultExport.start, defaultExport.declaration.start, `const template = ` );

			defaultExport.declaration.properties.forEach( prop => {
				templateProperties[ prop.key.name ] = prop.value;
			});
		}

		if ( templateProperties.helpers ) {
			templateProperties.helpers.properties.forEach( prop => {
				helpers[ prop.key.name ] = prop.value;
			});
		}
	}

	generator.current = {
		useAnchor: false,
		name: 'renderMainFragment',
		namespace: null,
		target: 'target',

		initStatements: [],
		updateStatements: [],
		teardownStatements: [],

		contexts: {},
		indexes: {},

		contextChain: [ 'root' ],
		indexNames: {},
		listNames: {},

		counter: counter(),

		parent: null
	};

	parsed.html.children.forEach( child => {
		walkHtml( child, {
			Comment: {
				// do nothing
			},

			Element: {
				enter ( node ) {
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

							const customEvent = templateProperties.events && templateProperties.events.properties.find( prop => prop.key.name === attribute.name );

							if ( customEvent ) {
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

				leave () {
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
			},

			Text: {
				enter ( node ) {
					generator.current.initStatements.push( deindent`
						${generator.current.target}.appendChild( document.createTextNode( ${JSON.stringify( node.data )} ) );
					` );
				}
			},

			MustacheTag: {
				enter ( node ) {
					const name = generator.current.counter( 'text' );

					generator.current.initStatements.push( deindent`
						var ${name} = document.createTextNode( '' );
						var ${name}_value = '';
						${generator.current.target}.appendChild( ${name} );
					` );

					generator.addSourcemapLocations( node.expression );

					const usedContexts = generator.contextualise( node.expression );
					const snippet = `[✂${node.expression.start}-${node.expression.end}✂]`;

					if ( isReference( node.expression ) ) {
						const reference = `${template.slice( node.expression.start, node.expression.end )}`;
						const qualified = usedContexts[0] === 'root' ? `root.${reference}` : reference;

						generator.current.updateStatements.push( deindent`
							if ( ${snippet} !== ${name}_value ) {
								${name}_value = ${qualified};
								${name}.data = ${name}_value;
							}
						` );
					} else {
						const temp = generator.getName( 'temp' );

						generator.current.updateStatements.push( deindent`
							var ${temp} = ${snippet};
							if ( ${temp} !== ${name}_value ) {
								${name}_value = ${temp};
								${name}.data = ${name}_value;
							}
						` );
					}
				}
			},

			IfBlock: {
				enter ( node ) {
					const i = generator.counters.if++;
					const name = `ifBlock_${i}`;
					const renderer = `renderIfBlock_${i}`;

					generator.current.initStatements.push( deindent`
						var ${name}_anchor = document.createComment( ${JSON.stringify( `#if ${template.slice( node.expression.start, node.expression.end )}` )} );
						${generator.current.target}.appendChild( ${name}_anchor );
						var ${name} = null;
					` );

					generator.addSourcemapLocations( node.expression );

					const usedContexts = generator.contextualise( node.expression );
					const snippet = `[✂${node.expression.start}-${node.expression.end}✂]`;

					let expression;

					if ( isReference( node.expression ) ) {
						const reference = `${template.slice( node.expression.start, node.expression.end )}`;
						expression = usedContexts[0] === 'root' ? `root.${reference}` : reference;

						generator.current.updateStatements.push( deindent`
							if ( ${snippet} && !${name} ) {
								${name} = ${renderer}( component, ${generator.current.target}, ${name}_anchor );
							}
						` );
					} else {
						expression = `${name}_value`;

						generator.current.updateStatements.push( deindent`
							var ${expression} = ${snippet};

							if ( ${expression} && !${name} ) {
								${name} = ${renderer}( component, ${generator.current.target}, ${name}_anchor );
							}
						` );
					}

					generator.current.updateStatements.push( deindent`
						else if ( !${expression} && ${name} ) {
							${name}.teardown();
							${name} = null;
						}

						if ( ${name} ) {
							${name}.update( ${generator.current.contextChain.join( ', ' )} );
						}
					` );

					generator.current.teardownStatements.push( deindent`
						if ( ${name} ) ${name}.teardown();
						${name}_anchor.parentNode.removeChild( ${name}_anchor );
					` );

					generator.current = Object.assign( {}, generator.current, {
						useAnchor: true,
						name: renderer,
						target: 'target',

						initStatements: [],
						updateStatements: [],
						teardownStatements: [],

						counter: counter(),

						parent: generator.current
					});
				},

				leave () {
					generator.renderers.push( createRenderer( generator.current ) );
					generator.current = generator.current.parent;
				}
			},

			EachBlock: {
				enter ( node ) {
					const i = generator.counters.each++;
					const name = `eachBlock_${i}`;
					const renderer = `renderEachBlock_${i}`;

					const listName = `${name}_value`;

					generator.current.initStatements.push( deindent`
						var ${name}_anchor = document.createComment( ${JSON.stringify( `#each ${template.slice( node.expression.start, node.expression.end )}` )} );
						${generator.current.target}.appendChild( ${name}_anchor );
						var ${name}_iterations = [];
						const ${name}_fragment = document.createDocumentFragment();
					` );

					generator.addSourcemapLocations( node.expression );

					generator.contextualise( node.expression );
					const snippet = `[✂${node.expression.start}-${node.expression.end}✂]`;

					generator.current.updateStatements.push( deindent`
						var ${name}_value = ${snippet};

						for ( var i = 0; i < ${name}_value.length; i += 1 ) {
							if ( !${name}_iterations[i] ) {
								${name}_iterations[i] = ${renderer}( component, ${name}_fragment );
							}

							const iteration = ${name}_iterations[i];
							${name}_iterations[i].update( ${generator.current.contextChain.join( ', ' )}, ${listName}, ${listName}[i], i );
						}

						for ( var i = ${name}_value.length; i < ${name}_iterations.length; i += 1 ) {
							${name}_iterations[i].teardown();
						}

						${name}_anchor.parentNode.insertBefore( ${name}_fragment, ${name}_anchor );
						${name}_iterations.length = ${listName}.length;
					` );

					generator.current.teardownStatements.push( deindent`
						for ( let i = 0; i < ${name}_iterations.length; i += 1 ) {
							${name}_iterations[i].teardown();
						}

						${name}_anchor.parentNode.removeChild( ${name}_anchor );
					` );

					const indexNames = Object.assign( {}, generator.current.indexNames );
					const indexName = indexNames[ node.context ] = ( node.index || `${node.context}__index` );

					const listNames = Object.assign( {}, generator.current.listNames );
					listNames[ node.context ] = listName;

					const contexts = Object.assign( {}, generator.current.contexts );
					contexts[ node.context ] = true;

					const indexes = Object.assign( {}, generator.current.indexes );
					if ( node.index ) indexes[ indexName ] = node.context;

					const contextChain = generator.current.contextChain.concat( listName, node.context, indexName );

					generator.current = {
						useAnchor: false,
						name: renderer,
						target: 'target',
						expression: node.expression,
						context: node.context,

						contexts,
						indexes,

						indexNames,
						listNames,
						contextChain,

						initStatements: [],
						updateStatements: [ Object.keys( contexts ).map( contextName => {
							const listName = listNames[ contextName ];
							const indexName = indexNames[ contextName ];

							return `var ${contextName} = ${listName}[${indexName}];`;
						}).join( '\n' ) ],
						teardownStatements: [],

						counter: counter(),

						parent: generator.current
					};
				},

				leave () {
					generator.renderers.push( createRenderer( generator.current ) );

					generator.current = generator.current.parent;
				}
			}
		});
	});

	generator.renderers.push( createRenderer( generator.current ) );

	const setStatements = [ deindent`
		const oldState = state;
		state = Object.assign( {}, oldState, newState );
	` ];

	if ( templateProperties.computed ) {
		const dependencies = new Map();

		templateProperties.computed.properties.forEach( prop => {
			const key = prop.key.name;
			const value = prop.value;

			const deps = value.params.map( param => param.name );
			dependencies.set( key, deps );
		});

		const visited = new Set();

		function visit ( key ) {
			if ( !dependencies.has( key ) ) return; // not a computation

			if ( visited.has( key ) ) return;
			visited.add( key );

			const deps = dependencies.get( key );
			deps.forEach( visit );

			setStatements.push( deindent`
				if ( ${deps.map( dep => `( '${dep}' in newState && typeof state.${dep} === 'object' || state.${dep} !== oldState.${dep} )` ).join( ' || ' )} ) {
					state.${key} = newState.${key} = template.computed.${key}( ${deps.map( dep => `state.${dep}` ).join( ', ' )} );
				}
			` );
		}

		templateProperties.computed.properties.forEach( prop => visit( prop.key.name ) );
	}

	setStatements.push( deindent`
		dispatchObservers( observers.immediate, newState, oldState );
		mainFragment.update( state );
		dispatchObservers( observers.deferred, newState, oldState );
	` );

	const constructorName = options.name || 'SvelteComponent';

	const result = deindent`
		${parsed.js ? `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` : ``}

		${generator.renderers.reverse().join( '\n\n' )}

		export default function ${constructorName} ( options ) {
			var component = this;${generator.usesRefs ? `\nthis.refs = {}` : ``}
			var state = {};

			var observers = {
				immediate: Object.create( null ),
				deferred: Object.create( null )
			};

			function dispatchObservers ( group, newState, oldState ) {
				for ( const key in group ) {
					if ( !( key in newState ) ) continue;

					const newValue = newState[ key ];
					const oldValue = oldState[ key ];

					if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

					const callbacks = group[ key ];
					if ( !callbacks ) continue;

					for ( let i = 0; i < callbacks.length; i += 1 ) {
						callbacks[i].call( component, newValue, oldValue );
					}
				}
			}

			this.get = function get ( key ) {
				return state[ key ];
			};

			this.set = function set ( newState ) {
				${setStatements.join( '\n\n' )}
			};

			this.observe = function ( key, callback, options = {} ) {
				const group = options.defer ? observers.deferred : observers.immediate;

				( group[ key ] || ( group[ key ] = [] ) ).push( callback );
				if ( options.init !== false ) callback( state[ key ] );

				return {
					cancel () {
						const index = group[ key ].indexOf( callback );
						if ( ~index ) group[ key ].splice( index, 1 );
					}
				};
			};

			this.teardown = function teardown () {
				mainFragment.teardown();
				mainFragment = null;

				state = {};

				${templateProperties.onteardown ? `template.onteardown.call( this );` : ``}
			};

			let mainFragment = renderMainFragment( this, options.target );
			this.set( ${templateProperties.data ? `Object.assign( template.data(), options.data )` : `options.data`} );

			${templateProperties.onrender ? `template.onrender.call( this );` : ``}
		}

		${templateProperties.methods ? `${constructorName}.prototype = template.methods` : ''}
	`;

	const pattern = /\[✂(\d+)-(\d+)$/;

	const parts = result.split( '✂]' );
	const finalChunk = parts.pop();

	const sortedByResult = parts.map( ( str, index ) => {
		const match = pattern.exec( str );

		return {
			index,
			chunk: str.replace( pattern, '' ),
			start: +match[1],
			end: +match[2]
		};
	});

	const sortedBySource = sortedByResult
		.slice()
		.sort( ( a, b ) => a.start - b.start );

	let c = 0;

	sortedBySource.forEach( part => {
		generator.code.remove( c, part.start );
		generator.code.insertRight( part.start, part.chunk );
		c = part.end;
	});

	generator.code.remove( c, template.length );
	generator.code.append( finalChunk );

	sortedByResult.forEach( part => {
		generator.code.move( part.start, part.end, 0 );
	});

	return {
		code: generator.code.toString(),
		map: generator.code.generateMap()
	};
}
