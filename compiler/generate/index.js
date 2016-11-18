import { getLocator } from 'locate-character';
import deindent from './utils/deindent.js';
import walkHtml from './utils/walkHtml.js';

const ROOT = 'options.target';

export default function generate ( parsed, template ) {
	const counters = {
		fragment: 0,
		element: 0,
		text: 0,
		anchor: 0,
		if: 0,
		each: 0,
		loop: 0
	};

	const initStatements = [];
	const setStatements = [ deindent`
		const oldState = state;
		state = Object.assign( {}, oldState, newState );
	` ];
	const teardownStatements = [];

	// TODO add contents of <script> tag, with `export default` replaced with `var template =`
	// TODO css

	const locator = getLocator( template );

	parsed.html.children.forEach( child => {
		const declarations = [];

		let current = {
			target: ROOT,
			conditions: [],
			children: [],
			renderBlocks: [],
			removeBlocks: [],
			anchor: null,
			renderImmediately: true
		};

		const stack = [ current ];

		walkHtml( child, {
			Element: {
				enter ( node ) {
					const target = `element_${counters.element++}`;

					stack.push( current );

					declarations.push( `var ${target};` );

					if ( current.renderImmediately ) {
						current.renderBlocks.push( deindent`
							${target} = document.createElement( '${node.name}' );
							${current.target}.appendChild( ${target} );
						` );
					} else {
						current.renderBlocks.push( deindent`
							${target} = document.createElement( '${node.name}' );
							${current.anchor}.parentNode.insertBefore( ${target}, ${current.anchor} );
						` );
					}

					current.removeBlocks.push( deindent`
						${target}.parentNode.removeChild( ${target} );
					` );

					current = {
						target,
						conditions: current.conditions,
						children: current.children,
						renderBlocks: current.renderBlocks,
						removeBlocks: current.removeBlocks,
						anchor: current.anchor,
						renderImmediately: false
					};
				},

				leave () {
					stack.pop();
					current = stack[ stack.length - 1 ];
				}
			},

			Text: {
				enter ( node ) {
					if ( current.target === ROOT ) {
						const identifier = `text_${counters.text++}`;

						declarations.push( `var ${identifier};` );

						current.renderBlocks.push( deindent`
							${identifier} = document.createTextNode( ${JSON.stringify( node.data )} );
							${current.target}.appendChild( ${identifier} );
						` );

						current.removeBlocks.push( deindent`
							${identifier}.parentNode.removeChild( ${identifier} );
							${identifier} = null;
						` );
					}

					else {
						current.renderBlocks.push( deindent`
							${current.target}.appendChild( document.createTextNode( ${JSON.stringify( node.data )} ) );
						` );
					}
				}
			},

			MustacheTag: {
				enter ( node ) {
					const identifier = `text_${counters.text++}`;
					const expression = node.expression.type === 'Identifier' ? node.expression.name : 'TODO'; // TODO handle block-local state

					declarations.push( `var ${identifier};` );

					current.renderBlocks.push( deindent`
						${identifier} = document.createTextNode( '' );
						${current.target}.appendChild( ${identifier} );
					` );

					setStatements.push( deindent`
						if ( state.${expression} !== oldState.${expression} ) { // TODO and conditions
							${identifier}.data = state.${expression};
						}
					` );

					current.removeBlocks.push( deindent`
						${identifier}.parentNode.removeChild( ${identifier} );
						${identifier} = null;
					` );
				}
			},

			IfBlock: {
				enter ( node ) {
					const anchor = `anchor_${counters.anchor++}`;
					const suffix = `if_${counters.if++}`;

					declarations.push( `var ${anchor};` );

					const expression = node.expression.type === 'Identifier' ? node.expression.name : 'TODO'; // TODO handle block-local state

					current.renderBlocks.push( deindent`
						${anchor} = document.createComment( '#if ${template.slice( node.expression.start, node.expression.end)}' );
						${current.target}.appendChild( ${anchor} );
					` );

					current.removeBlocks.push( deindent`
						${anchor}.parentNode.removeChild( ${anchor} );
						${anchor} = null;
					` );

					current = {
						renderName: `render_${suffix}`,
						removeName: `remove_${suffix}`,
						target: current.target,
						conditions: current.conditions.concat( expression ),
						renderBlocks: [],
						removeBlocks: [],
						anchor,
						renderImmediately: false
					};

					setStatements.push( deindent`
						// TODO account for conditions (nested ifs)
						if ( state.${expression} && !oldState.${expression} ) ${current.renderName}();
						else if ( !state.${expression} && oldState.${expression} ) ${current.removeName}();
					` );

					teardownStatements.push( deindent`
						// TODO account for conditions (nested ifs)
						if ( state.${expression} ) ${current.removeName}();
					` );

					stack.push( current );
				},

				leave ( node ) {
					const { line, column } = locator( node.start );

					initStatements.push( deindent`
						// (${line}:${column}) {{#if ${template.slice( node.expression.start, node.expression.end )}}}...{{/if}}
						function ${current.renderName} () {
							${current.renderBlocks.join( '\n\n' )}
						}

						function ${current.removeName} () {
							${current.removeBlocks.join( '\n\n' )}
						}
					` );

					stack.pop();
					current = stack[ stack.length - 1 ];
				}
			},

			EachBlock: {
				enter ( node ) {
					const loopIndex = counters.loop++;

					const anchor = `anchor_${counters.anchor++}`;

					declarations.push( `var fragment_${loopIndex} = document.createDocumentFragment();` );
					declarations.push( `var ${anchor};` );

					const expression = node.expression.type === 'Identifier' ? node.expression.name : 'TODO'; // TODO handle block-local state

					current.renderBlocks.push( deindent`
						${anchor} = document.createComment( '#each ${template.slice( node.expression.start, node.expression.end)}' );
						${current.target}.appendChild( ${anchor} );
					` );

					current.removeBlocks.push( deindent`
						${anchor}.parentNode.removeChild( ${anchor} );
						${anchor} = null;
					` );

					current = {
						target: `fragment_${loopIndex}`,
						expression,
						conditions: current.conditions,
						renderBlocks: [],
						removeBlocks: [],
						anchor,
						loopIndex,
						renderImmediately: true
					};

					setStatements.push( deindent`
						// TODO account for conditions (nested ifs)
						if ( '${expression}' in state ) each_${loopIndex}.update();
					` );

					// need to add teardown logic if this is at the
					// top level (TODO or if there are event handlers attached?)
					if ( current.target === ROOT ) {
						teardownStatements.push( deindent`
							if ( true ) { // <!-- TODO conditions
								for ( let i = 0; i < state.${expression}.length; i += 1 ) {
									each_${loopIndex}.removeIteration( i );
								}
							}
						` );
					}

					stack.push( current );
				},

				leave ( node ) {
					const { line, column } = locator( node.start );

					const loopIndex = current.loopIndex;

					initStatements.push( deindent`
						// (${line}:${column}) {{#each ${template.slice( node.expression.start, node.expression.end )}}}...{{/each}}
						${current.renderBlocks.join( '\n\n' )}

						var each_${loopIndex} = {
							iterations: [],

							update: function () {
								var target = document.createDocumentFragment();

								var i;

								for ( i = 0; i < state.${current.expression}.length; i += 1 ) {
									if ( !this.iterations[i] ) {
										this.iterations[i] = this.renderIteration( target );
									}

									const iteration = this.iterations[i];
									this.updateIteration( this.iterations[i], state.${current.expression}[i] );
								}

								for ( ; i < this.iterations.length; i += 1 ) {
									this.removeIteration( i );
								}

								${current.anchor}.parentNode.insertBefore( target, ${current.anchor} );
								each_${loopIndex}.length = state.${current.expression}.length;
							},

							renderIteration: function ( target ) {
								var fragment = fragment_0.cloneNode( true );

								var element_0 = fragment.childNodes[0];
								var text_0 = element_0.childNodes[0];

								var iteration = {
									element_0: element_0,
									text_0: text_0
								};

								target.appendChild( fragment );
								return iteration;
							},

							updateIteration: function ( iteration, context ) {
								iteration.text_0.data = context;
							},

							removeIteration: function ( i ) {
								var iteration = this.iterations[i];
								iteration.element_0.parentNode.removeChild( iteration.element_0 );
							}
						};
					` );

					teardownStatements.push( ...current.removeBlocks );

					stack.pop();
					current = stack[ stack.length - 1 ];
				}
			}
		});

		initStatements.push( ...current.renderBlocks );
		initStatements.unshift( declarations.join( '\n' ) );

		teardownStatements.push( ...current.removeBlocks );
	});

	teardownStatements.push( 'state = {};' );

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
				${setStatements.join( '\n\n' )}
			};

			component.teardown = function teardown () {
				${teardownStatements.join( '\n\n' )}
			};

			// initialisation
			${initStatements.join( '\n\n' )}

			component.set( options.data );

			return component;
		}
	`;

	return { code };
}
