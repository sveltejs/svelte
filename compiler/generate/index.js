import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import deindent from './utils/deindent.js';
import walkHtml from './utils/walkHtml.js';
import flattenReference from './utils/flattenReference.js';
import isReference from './utils/isReference.js';
import contextualise from './utils/contextualise.js';
import counter from './utils/counter.js';
import attributeLookup from './attributes/lookup.js';

function createRenderer ( fragment ) {
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

export default function generate ( parsed, template ) {
	const code = new MagicString( template );

	function addSourcemapLocations ( node ) {
		walk( node, {
			enter ( node ) {
				code.addSourcemapLocation( node.start );
				code.addSourcemapLocation( node.end );
			}
		});
	}

	const templateProperties = {};

	if ( parsed.js ) {
		addSourcemapLocations( parsed.js.content );

		const defaultExport = parsed.js.content.body.find( node => node.type === 'ExportDefaultDeclaration' );

		if ( defaultExport ) {
			code.overwrite( defaultExport.start, defaultExport.declaration.start, `const template = ` );

			defaultExport.declaration.properties.forEach( prop => {
				templateProperties[ prop.key.name ] = prop.value;
			});
		}
	}

	const renderers = [];
	const expressionFunctions = [];

	const getName = counter();

	// TODO use getName instead of counters
	const counters = {
		if: 0,
		each: 0
	};

	// TODO add contents of <script> tag, with `export default` replaced with `var template =`
	// TODO css

	let current = {
		useAnchor: false,
		name: 'renderMainFragment',
		target: 'target',

		initStatements: [],
		updateStatements: [],
		teardownStatements: [],

		contexts: {},
		contextChain: [ 'root' ],

		counter: counter(),

		parent: null
	};

	function flattenExpression ( node, contexts ) {
		const flattened = flattenReference( node );

		if ( flattened ) {
			if ( flattened.name in contexts ) return flattened.keypath;
			// TODO handle globals, e.g. {{Math.round(foo)}}
			return `root.${flattened.keypath}`;
		}

		return 'TODO';
	}

	parsed.html.children.forEach( child => {
		walkHtml( child, {
			Element: {
				enter ( node ) {
					const name = current.counter( node.name );

					const initStatements = [
						`var ${name} = document.createElement( '${node.name}' );`
					];

					const updateStatements = [];

					const teardownStatements = [
						`${name}.parentNode.removeChild( ${name} );`
					];

					const allUsedContexts = new Set();

					node.attributes.forEach( attribute => {
						if ( attribute.type === 'Attribute' ) {
							let metadata = attributeLookup[ attribute.name ];
							if ( metadata.appliesTo && !~metadata.appliesTo.indexOf( node.name ) ) metadata = null;

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
								}

								else {
									// dynamic – but potentially non-string – attributes
									contextualise( code, value.expression, current.contexts );
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
											contextualise( code, chunk.expression, current.contexts );
											return `[✂${chunk.expression.start}-${chunk.expression.end}✂]`;
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
							const handler = current.counter( `${attribute.name}Handler` );

							addSourcemapLocations( attribute.expression );
							code.insertRight( attribute.expression.start, 'component.' );

							const usedContexts = new Set();
							attribute.expression.arguments.forEach( arg => {
								const contexts = contextualise( code, arg, current.contexts );

								contexts.forEach( context => {
									usedContexts.add( context );
									allUsedContexts.add( context );
								});
							});

							// TODO hoist event handlers? can do `this.__component.method(...)`
							if ( usedContexts.size ) {
								initStatements.push( deindent`
									function ${handler} ( event ) {
										var context = this.__context;
										${[...usedContexts].map( name => `var ${name} = context.${name}` ).join( '\n' )}

										[✂${attribute.expression.start}-${attribute.expression.end}✂];
									}

									${name}.addEventListener( '${attribute.name}', ${handler}, false );
								` );
							} else {
								initStatements.push( deindent`
									function ${handler} ( event ) {
										[✂${attribute.expression.start}-${attribute.expression.end}✂];
									}

									${name}.addEventListener( '${attribute.name}', ${handler}, false );
								` );
							}

							teardownStatements.push( deindent`
								${name}.removeEventListener( '${attribute.name}', ${handler}, false );
							` );
						}

						else {
							throw new Error( `Not implemented: ${attribute.type}` );
						}
					});

					if ( allUsedContexts.size ) {
						initStatements.push( deindent`
							${name}.__context = {};
						` );

						updateStatements.push( deindent`
							${[...allUsedContexts].map( contextName => `${name}.__context.${contextName} = ${contextName};` ).join( '\n' )}
						` );
					}

					current.initStatements.push( initStatements.join( '\n' ) );
					if ( updateStatements.length ) current.updateStatements.push( updateStatements.join( '\n' ) );
					current.teardownStatements.push( teardownStatements.join( '\n' ) );

					current = Object.assign( {}, current, {
						target: name,
						parent: current
					});
				},

				leave () {
					const name = current.target;

					current = current.parent;

					if ( current.useAnchor && current.target === 'target' ) {
						current.initStatements.push( deindent`
							target.insertBefore( ${name}, anchor );
						` );
					} else {
						current.initStatements.push( deindent`
							${current.target}.appendChild( ${name} );
						` );
					}
				}
			},

			Text: {
				enter ( node ) {
					current.initStatements.push( deindent`
						${current.target}.appendChild( document.createTextNode( ${JSON.stringify( node.data )} ) );
					` );
				}
			},

			MustacheTag: {
				enter ( node ) {
					const name = current.counter( 'text' );

					current.initStatements.push( deindent`
						var ${name} = document.createTextNode( '' );
						var ${name}_value = '';
						${current.target}.appendChild( ${name} );
					` );

					const usedContexts = contextualise( code, node.expression, current.contexts );
					const snippet = `[✂${node.expression.start}-${node.expression.end}✂]`;

					if ( isReference( node.expression ) ) {
						const reference = `${template.slice( node.expression.start, node.expression.end )}`;
						const qualified = usedContexts[0] === 'root' ? `root.${reference}` : reference;

						current.updateStatements.push( deindent`
							if ( ${snippet} !== ${name}_value ) {
								${name}_value = ${qualified};
								${name}.data = ${name}_value;
							}
						` );
					} else {
						const expressionFunction = getName( 'expression' );
						expressionFunctions.push( deindent`
							function ${expressionFunction} ( ${usedContexts.join( ', ' )} ) {
								return ${snippet};
							}
						` );

						const temp = getName( 'temp' );

						current.updateStatements.push( deindent`
							var ${temp} = ${expressionFunction}( ${usedContexts.join( ', ' )} );
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
					const i = counters.if++;
					const name = `ifBlock_${i}`;
					const renderer = `renderIfBlock_${i}`;

					current.initStatements.push( deindent`
						var ${name}_anchor = document.createComment( ${JSON.stringify( `#if ${template.slice( node.expression.start, node.expression.end )}` )} );
						${current.target}.appendChild( ${name}_anchor );
						var ${name} = null;
					` );

					const usedContexts = contextualise( code, node.expression, current.contexts );
					const snippet = `[✂${node.expression.start}-${node.expression.end}✂]`;

					let expression;

					if ( isReference( node.expression ) ) {
						const reference = `${template.slice( node.expression.start, node.expression.end )}`;
						expression = usedContexts[0] === 'root' ? `root.${reference}` : reference;

						current.updateStatements.push( deindent`
							if ( ${snippet} && !${name} ) {
								${name} = ${renderer}( component, ${current.target}, ${name}_anchor );
							}
						` );
					} else {
						const expressionFunction = getName( 'expression' );
						expressionFunctions.push( deindent`
							function ${expressionFunction} ( ${usedContexts.join( ', ' )} ) {
								return ${snippet};
							}
						` );

						expression = `${name}_value`;

						current.updateStatements.push( deindent`
							var ${expression} = ${expressionFunction}( ${usedContexts.join( ', ' )} );

							if ( ${expression} && !${name} ) {
								${name} = ${renderer}( component, ${current.target}, ${name}_anchor );
							}
						` );
					}

					current.updateStatements.push( deindent`
						else if ( !${expression} && ${name} ) {
							${name}.teardown();
							${name} = null;
						}

						if ( ${name} ) {
							${name}.update( ${current.contextChain.join( '\n' )} );
						}
					` );

					current.teardownStatements.push( deindent`
						if ( ${name} ) ${name}.teardown();
						${name}_anchor.parentNode.removeChild( ${name}_anchor );
					` );

					current = {
						useAnchor: true,
						name: renderer,
						target: 'target',

						contextChain: current.contextChain,

						initStatements: [],
						updateStatements: [],
						teardownStatements: [],

						counter: counter(),

						parent: current
					};
				},

				leave () {
					renderers.push( createRenderer( current ) );
					current = current.parent;
				}
			},

			EachBlock: {
				enter ( node ) {
					const i = counters.each++;
					const name = `eachBlock_${i}`;
					const renderer = `renderEachBlock_${i}`;

					current.initStatements.push( deindent`
						var ${name}_anchor = document.createComment( ${JSON.stringify( `#each ${template.slice( node.expression.start, node.expression.end )}` )} );
						${current.target}.appendChild( ${name}_anchor );
						var ${name}_iterations = [];
						const ${name}_fragment = document.createDocumentFragment();
					` );

					const usedContexts = contextualise( code, node.expression, current.contexts );
					const snippet = `[✂${node.expression.start}-${node.expression.end}✂]`;

					let expression;

					if ( isReference( node.expression ) ) {
						expression = snippet;
					} else {
						const expressionFunction = getName( 'expression' );
						expressionFunctions.push( deindent`
							function ${expressionFunction} ( ${usedContexts.join( ', ' )} ) {
								return ${snippet};
							}
						` );

						expression = `${expressionFunction}( ${usedContexts.join( ', ' )} )`;
					}

					current.updateStatements.push( deindent`
						var ${name}_value = ${expression};

						for ( var i = 0; i < ${name}_value.length; i += 1 ) {
							if ( !${name}_iterations[i] ) {
								${name}_iterations[i] = ${renderer}( component, ${name}_fragment );
							}

							const iteration = ${name}_iterations[i];
							${name}_iterations[i].update( ${current.contextChain.join( ', ' )}, ${name}_value[i]${node.index ? `, i` : ''} );
						}

						for ( var i = ${name}_value.length; i < ${name}_iterations.length; i += 1 ) {
							${name}_iterations[i].teardown();
						}

						${name}_anchor.parentNode.insertBefore( ${name}_fragment, ${name}_anchor );
						${name}_iterations.length = ${name}_value.length;
					` );

					current.teardownStatements.push( deindent`
						for ( let i = 0; i < ${name}_iterations.length; i += 1 ) {
							${name}_iterations[i].teardown();
						}

						${name}_anchor.parentNode.removeChild( ${name}_anchor );
					` );

					const contexts = Object.assign( {}, current.contexts );
					const contextChain = current.contextChain.concat( node.context );

					contexts[ node.context ] = true;

					if ( node.index ) {
						// not strictly a context, but we can treat it as such
						contextChain.push( node.index );
						contexts[ node.index ] = true;
					}

					current = {
						useAnchor: false,
						name: renderer,
						target: 'target',

						contexts,
						contextChain,

						initStatements: [],
						updateStatements: [],
						teardownStatements: [],

						counter: counter(),

						parent: current
					};
				},

				leave () {
					renderers.push( createRenderer( current ) );

					current = current.parent;
				}
			}
		});
	});

	renderers.push( createRenderer( current ) );

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

	const result = deindent`
		${parsed.js ? `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` : ``}

		${expressionFunctions.join( '\n\n' )}

		${renderers.reverse().join( '\n\n' )}

		export default function createComponent ( options ) {
			var component = ${templateProperties.methods ? `Object.create( template.methods )` : `{}`};
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

			component.get = function get ( key ) {
				return state[ key ];
			};

			component.set = function set ( newState ) {
				${setStatements.join( '\n\n' )}
			};

			component.observe = function ( key, callback, options = {} ) {
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

			component.teardown = function teardown () {
				mainFragment.teardown();
				mainFragment = null;

				state = {};
			};

			let mainFragment = renderMainFragment( component, options.target );
			component.set( ${templateProperties.data ? `Object.assign( template.data(), options.data )` : `options.data`} );

			return component;
		}
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
		code.remove( c, part.start );
		code.insertRight( part.start, part.chunk );
		c = part.end;
	});

	code.remove( c, template.length );
	code.append( finalChunk );

	sortedByResult.forEach( part => {
		code.move( part.start, part.end, 0 );
	});

	return {
		code: code.toString()
	};
}
