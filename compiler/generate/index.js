import deindent from './utils/deindent.js';
import walkHtml from './utils/walkHtml.js';

const ROOT = 'options.target';

export default function generate ( parsed ) {
	const counters = {
		element: 0,
		text: 0,
		anchor: 0
	};

	const renderBlocks = [];
	const updateBlocks = [];
	const teardownBlocks = [];

	const codeBlocks = [];

	// TODO add contents of <script> tag, with `export default` replaced with `var template =`
	// TODO css

	// create component

	parsed.html.children.forEach( child => {
		let current = {
			target: ROOT,
			indentation: 0,
			block: []
		};

		const stack = [ current ];

		walkHtml( child, {
			enter ( node ) {
				if ( node.type === 'Element' ) {
					current = {
						target: `element_${counters.element++}`,
						indentation: current.indentation,
						block: current.block
					};

					stack.push( current );

					const renderBlock = deindent`
						var ${current.target} = document.createElement( '${node.name}' );
						options.target.appendChild( ${current.target} );
					`;

					renderBlocks.push( renderBlock );

					// updateBlocks.push( deindent`
					//
					// ` );

					teardownBlocks.push( deindent`
						${current.target}.parentNode.removeChild( ${current.target} );
					` );
				}

				else if ( node.type === 'Text' ) {
					if ( current.target === ROOT ) {
						const identifier = `text_${counters.text++}`;

						renderBlocks.push( deindent`
							var ${identifier} = document.createTextNode( ${JSON.stringify( node.data )} );
							${current.target}.appendChild( ${identifier} );
						` );

						teardownBlocks.push( deindent`
							${identifier}.parentNode.removeChild( ${identifier} );
						` );
					}

					else {
						renderBlocks.push( deindent`
							${current.target}.appendChild( document.createTextNode( ${JSON.stringify( node.data )} ) );
						` );
					}
				}

				else if ( node.type === 'MustacheTag' ) {
					const identifier = `text_${counters.text++}`;
					const expression = node.expression.type === 'Identifier' ? node.expression.name : 'TODO'; // TODO handle block-local state

					renderBlocks.push( deindent`
						var ${identifier} = document.createTextNode( '' );
						${current.target}.appendChild( ${identifier} );
					` );

					updateBlocks.push( deindent`
						if ( state.${expression} !== oldState.${expression} ) {
							${identifier}.data = state.${expression};
						}
					` );

					if ( current.target === ROOT ) {
						teardownBlocks.push( deindent`
							${identifier}.parentNode.removeChild( ${identifier} );
						` );
					}
				}

				else {
					throw new Error( `Not implemented: ${node.type}` );
				}
			},

			leave ( node ) {
				if ( node.type === 'Element' ) {
					stack.pop();
					current = stack[ stack.length - 1 ];
				}
			}
		});
	});

	const code = deindent`
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

			component.set = function set ( newState ) {
				const oldState = state;
				state = Object.assign( {}, oldState, newState );

				${updateBlocks.join( '\n\n' )}
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
				${teardownBlocks.join( '\n\n' )}
				state = {};
			};

			${renderBlocks.join( '\n\n' )}

			component.set( options.data );

			return component;
		}
	`;

	return { code };
}
