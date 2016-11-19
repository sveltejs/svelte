import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import deindent from './utils/deindent.js';
import walkHtml from './utils/walkHtml.js';
import flattenReference from './utils/flattenReference.js';
import counter from './utils/counter.js';

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

	let hasDefaultData = false;

	// TODO wrap all this in magic-string
	if ( parsed.js ) {
		walk( parsed.js.content, {
			enter ( node ) {
				code.addSourcemapLocation( node.start );
				code.addSourcemapLocation( node.end );
			}
		});

		const defaultExport = parsed.js.content.body.find( node => node.type === 'ExportDefaultDeclaration' );

		if ( defaultExport ) {
			code.overwrite( defaultExport.start, defaultExport.declaration.start, `const template = ` );
			hasDefaultData = defaultExport.declaration.properties.find( prop => prop.key.name === 'data' );
		}
	}

	const renderers = [];

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
		contextChain: [ 'context' ],

		counter: counter(),

		parent: null
	};

	function flattenExpression ( node, contexts ) {
		const flattened = flattenReference( node );

		if ( flattened ) {
			if ( flattened.name in contexts ) return flattened.keypath;
			// TODO handle globals, e.g. {{Math.round(foo)}}
			return `context.${flattened.keypath}`;
		}

		console.log( `node, contexts`, node, contexts )
		return 'TODO'
		throw new Error( 'TODO expressions' );
	}

	parsed.html.children.forEach( child => {
		walkHtml( child, {
			Element: {
				enter ( node ) {
					const name = current.counter( node.name );

					const initStatements = [
						`var ${name} = document.createElement( '${node.name}' );`
					];

					const teardownStatements = [
						`${name}.parentNode.removeChild( ${name} );`
					];

					node.attributes.forEach( attribute => {
						if ( attribute.type === 'EventHandler' ) {
							// TODO use magic-string here, so that stack traces
							// go through the template

							// TODO verify that it's a valid callee (i.e. built-in or declared method)

							const handler = current.counter( `${attribute.name}Handler` );

							const callee = `component.${attribute.expression.callee.name}`;
							const args = attribute.expression.arguments
								.map( arg => flattenExpression( arg, current.contexts ) )
								.join( ', ' );

							initStatements.push( deindent`
								function ${handler} ( event ) {
									${callee}(${args});
								}

								${name}.addEventListener( '${attribute.name}', ${handler}, false );
							` );

							teardownStatements.push( deindent`
								${name}.removeEventListener( '${attribute.name}', ${handler}, false );
							` );
						}

						else {
							throw new Error( `Not implemented: ${attribute.type}` );
						}
					});

					current.initStatements.push( initStatements.join( '\n' ) );
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
					const expression = flattenExpression( node.expression, current.contexts );

					current.initStatements.push( deindent`
						var ${name} = document.createTextNode( '' );
						var ${name}_value = '';
						${current.target}.appendChild( ${name} );
					` );

					current.updateStatements.push( deindent`
						if ( ${expression} !== ${name}_value ) {
							${name}_value = ${expression};
							${name}.data = ${name}_value;
						}
					` );
				}
			},

			IfBlock: {
				enter ( node ) {
					const i = counters.if++;
					const name = `ifBlock_${i}`;
					const renderer = `renderIfBlock_${i}`;

					const expression = flattenExpression( node.expression, current.contexts );

					current.initStatements.push( deindent`
						var ${name}_anchor = document.createComment( '#if ${template.slice( node.expression.start, node.expression.end )}' );
						${current.target}.appendChild( ${name}_anchor );
						var ${name} = null;
					` );

					current.updateStatements.push( deindent`
						if ( ${expression} && !${name} ) {
							${name} = ${renderer}( component, ${current.target}, ${name}_anchor );
						}

						else if ( !${expression} && ${name} ) {
							${name}.teardown();
							${name} = null;
						}

						if ( ${name} ) {
							${name}.update( context );
						}
					` );

					current.teardownStatements.push( deindent`
						if ( ${name} ) ${name}.teardown();
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

					const expression = flattenExpression( node.expression, current.contexts );

					current.initStatements.push( deindent`
						var ${name}_anchor = document.createComment( '#each ${template.slice( node.expression.start, node.expression.end )}' );
						${current.target}.appendChild( ${name}_anchor );
						var ${name}_iterations = [];
						const ${name}_fragment = document.createDocumentFragment();
					` );

					current.updateStatements.push( deindent`
						for ( var i = 0; i < ${expression}.length; i += 1 ) {
							if ( !${name}_iterations[i] ) {
								${name}_iterations[i] = ${renderer}( component, ${name}_fragment );
							}

							const iteration = ${name}_iterations[i];
							${name}_iterations[i].update( ${current.contextChain.join( ', ' )}, ${expression}[i] );
						}

						for ( var i = ${expression}.length; i < ${name}_iterations.length; i += 1 ) {
							${name}_iterations[i].teardown();
						}

						${name}_anchor.parentNode.insertBefore( ${name}_fragment, ${name}_anchor );
						${name}_iterations.length = ${expression}.length;
					` );

					current.teardownStatements.push( deindent`
						for ( let i = 0; i < ${name}_iterations.length; i += 1 ) {
							${name}_iterations[i].teardown();
						}
					` );

					const contexts = Object.assign( {}, current.contexts );
					contexts[ node.context ] = true;

					current = {
						useAnchor: false,
						name: renderer,
						target: 'target',

						contexts,
						contextChain: current.contextChain.concat( node.context ),

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

	const result = deindent`
		${parsed.js ? `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` : ``}

		${renderers.reverse().join( '\n\n' )}

		export default function createComponent ( options ) {
			var component = {};
			var state = {};

			var observers = {
				immediate: Object.create( null ),
				deferred: Object.create( null )
			};

			function dispatchObservers ( group, state, oldState ) {
				for ( const key in group ) {
					const newValue = state[ key ];
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
				Object.assign( state, newState );
				mainFragment.update( state );
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
			component.set( ${hasDefaultData ? `Object.assign( template.data(), options.data )` : `options.data`} );

			return component;
		}
	`;

	const pattern = /\[✂(\d+)-(\d+)/;

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
		code.insertLeft( part.start, part.chunk );
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
