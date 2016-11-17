import deindent from 'deindent';
import walkHtml from './walkHtml.js';

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
		let currentElement = 'options.target';
		const elementStack = [ currentElement ];

		walkHtml( child, {
			enter ( node ) {
				if ( node.type === 'Element' ) {
					currentElement = `element_${counters.element++}`;

					const renderBlock = deindent`
						var ${currentElement} = document.createElement( '${node.name}' );
						options.target.appendChild( ${currentElement} );
					`;

					renderBlocks.push( renderBlock );

					// updateBlocks.push( deindent`
					//
					// ` );

					teardownBlocks.push( deindent`
						${currentElement}.parentNode.removeChild( ${currentElement} );
					` );
				}

				else if ( node.type === 'Text' ) {
					renderBlocks.push( deindent`
						${currentElement}.appendChild( document.createTextNode( ${JSON.stringify( node.data )} ) );
					` );
				}

				else {
					throw new Error( `Not implemented: ${node.type}` );
				}
			},

			leave ( node ) {
				if ( node.type === 'Element' ) {
					elementStack.pop();
					currentElement = elementStack[ elementStack.length - 1 ];
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
	`.trim();

	return { code };
}
