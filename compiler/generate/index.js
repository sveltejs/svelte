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
			anchor: null
		};

		const stack = [ current ];

		walkHtml( child, {
			enter ( node ) {
				if ( node.type === 'Element' ) {
					current = {
						target: `element_${counters.element++}`,
						conditions: current.conditions,
						children: current.children,
						renderBlocks: current.renderBlocks,
						removeBlocks: current.removeBlocks,
						anchor: current.anchor
					};

					stack.push( current );

					declarations.push( `var ${current.target};` );

					if ( current.anchor ) {
						current.renderBlocks.push( deindent`
							${current.target} = document.createElement( '${node.name}' );
							${current.anchor}.parentNode.insertBefore( ${current.target}, ${current.anchor} );
						` );
					} else {
						current.renderBlocks.push( deindent`
							${current.target} = document.createElement( '${node.name}' );
							options.target.appendChild( ${current.target} );
						` );
					}

					current.removeBlocks.push( deindent`
						${current.target}.parentNode.removeChild( ${current.target} );
					` );
				}

				else if ( node.type === 'Text' ) {
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

				else if ( node.type === 'MustacheTag' ) {
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

				else if ( node.type === 'IfBlock' ) {
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
						anchor
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
				}

				else if ( node.type === 'EachBlock' ) {
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
						target: current.target,
						conditions: current.conditions,
						renderBlocks: [],
						removeBlocks: [],
						anchor,
						loopIndex
					};

					setStatements.push( deindent`
						// TODO account for conditions (nested ifs)
						if ( state.${expression} && !oldState.${expression} ) render_each_${loopIndex}();
						else if ( !state.${expression} && oldState.${expression} ) remove_each_${loopIndex}();
					` );

					teardownStatements.push( deindent`
						// TODO account for conditions (nested ifs)
						if ( state.${expression} ) remove_each_${loopIndex}();
					` );

					stack.push( current );
				}

				else {
					throw new Error( `Not implemented: ${node.type}` );
				}
			},

			leave ( node ) {
				if ( node.type === 'IfBlock' ) {
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

				else if ( node.type === 'EachBlock' ) {
					const { line, column } = locator( node.start );

					const loopIndex = current.loopIndex;

					initStatements.push( deindent`
						// (${line}:${column}) {{#each ${template.slice( node.expression.start, node.expression.end )}}}...{{/each}}
						var each_${loopIndex} = {
							iterations: [],

							render () {
								const target = document.createDocumentFragment();

								let i;

								for ( i = 0; i < state.${current.expression}.length; i += 1 ) {
									if ( !this.iterations[i] ) {
										this.iterations[i] = render_iteration_${loopIndex}( target );
									}

									const iteration = this.iterations[i];
									update_iteration_${loopIndex}( this.iterations[i], state.people[i] );
								}

								for ( ; i < this.iterations.length; i += 1 ) {
									remove_iteration_${loopIndex}( this.iterations[i] );
								}

								${current.anchor}.parentNode.insertBefore( target, ${current.anchor} );
								loop_${loopIndex}.length = state.people.length;
							},

							renderIteration ( target ) {

							},

							update () {

							},

							updateIteration ( iteration, context ) {

							},

							remove () {

							},

							removeIteration ( iteration ) {

							}
						};

						function ${current.renderName} () {
							const target = document.createDocumentFragment();

							let i;

							for ( i = 0; i < state.${current.expression}.length; i += 1 ) {
								if ( !loop_${loopIndex}[i] ) {
									loop_${loopIndex}[i] = render_iteration_${loopIndex}( target );
								}

								const iteration = loop_${loopIndex}[i];
								update_iteration_${loopIndex}( loop_${loopIndex}[i], state.people[i] );
							}

							for ( ; i < loop_${loopIndex}.length; i += 1 ) {
								remove_iteration_${loopIndex}( loop_${loopIndex}[i] );
							}

							${current.anchor}.parentNode.insertBefore( target, ${current.anchor} );
							loop_${loopIndex}.length = state.people.length;
						}

						function ${current.removeName} () {
							${current.removeBlocks.join( '\n\n' )}
						}
					` );

					stack.pop();
					current = stack[ stack.length - 1 ];
				}

				else if ( node.type === 'Element' ) {
					stack.pop();
					current = stack[ stack.length - 1 ];
				}
			}
		});

		initStatements.push( ...current.renderBlocks );
		teardownStatements.push( ...current.removeBlocks );
	});

	teardownStatements.push( deindent`
		state = {};
	` );

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

			${initStatements.join( '\n\n' )}

			component.set( options.data );

			return component;
		}
	`;

	return { code };
}
