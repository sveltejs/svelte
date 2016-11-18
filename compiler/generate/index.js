import { getLocator } from 'locate-character';
import deindent from './utils/deindent.js';
import walkHtml from './utils/walkHtml.js';
import flattenReference from './utils/flattenReference.js';

function createRenderer ( fragment ) {
	return deindent`
		function ${fragment.name} ( target${fragment.useAnchor ? ', anchor' : ''} ) {
			${fragment.initStatements.join( '\n\n' )}

			return {
				update: function ( ${fragment.contextChain.join( ', ' )} ) {
					${fragment.updateStatements.join( '\n\n' )}
				},

				teardown: function () {
					${fragment.teardownStatements.join( '\n\n' )}
				}
			}
		}
	`;
}

export default function generate ( parsed, template ) {
	const locator = getLocator( template );
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

		counters: {
			element: 0,
			text: 0,
			anchor: 0
		},

		parent: null
	};

	function flattenExpression ( node, contexts ) {
		const flattened = flattenReference( node );

		if ( flattened ) {
			if ( flattened.name in contexts ) return flattened.keypath;
			// TODO handle globals, e.g. {{Math.round(foo)}}
			return `context.${flattened.keypath}`;
		}

		throw new Error( 'TODO expressions' );
	}

	parsed.html.children.forEach( child => {
		walkHtml( child, {
			Element: {
				enter ( node ) {
					const name = `element_${current.counters.element++}`;

					current.initStatements.push( deindent`
						var ${name} = document.createElement( '${node.name}' );
					` );

					current.teardownStatements.push( deindent`
						${name}.parentNode.removeChild( ${name} );
					` );

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
						${current.target}.appendChild( document.createTextNode( ${JSON.stringify( node.data ) }) );
					` );
				}
			},

			MustacheTag: {
				enter ( node ) {
					const name = `text_${current.counters.text++}`;
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
							${name} = ${renderer}( ${current.target}, ${name}_anchor );
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

						counters: {
							element: 0,
							text: 0,
							anchor: 0
						},

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
								${name}_iterations[i] = ${renderer}( ${name}_fragment );
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

						counters: {
							element: 0,
							text: 0,
							anchor: 0
						},

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

	let js;
	let hasDefaultData = false;

	// TODO wrap all this in magic-string
	if ( parsed.js ) {
		const defaultExport = parsed.js.content.body.find( node => node.type === 'ExportDefaultDeclaration' );
		if ( defaultExport ) {
			js = `${template.slice( parsed.js.content.start, defaultExport.start )}const template = ${template.slice( defaultExport.declaration.start, parsed.js.content.end)}`;
			hasDefaultData = defaultExport.declaration.properties.find( prop => prop.key.name === 'data' );
		} else {
			js = template.slice( parsed.js.content.start, parsed.js.content.end );
		}
	}

	const code = deindent`
		${js}

		${renderers.reverse().join( '\n\n' )}

		export default function createComponent ( options ) {
			var component = {};
			var state = {};

			var observers = {
				immediate: Object.create( null ),
				deferred: Object.create( null )
			};

			// universal methods
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

			// component-specific methods
			component.set = function set ( newState ) {
				Object.assign( state, newState );
				mainFragment.update( state );
			};

			component.teardown = function teardown () {
				mainFragment.teardown();
				mainFragment = null;

				state = {};
			};

			let mainFragment = renderMainFragment( options.target );
			component.set( ${hasDefaultData ? `Object.assign( template.data(), options.data )` : `options.data`} );

			return component;
		}
	`;

	return { code };
}
