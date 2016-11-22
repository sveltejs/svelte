import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import deindent from './utils/deindent.js';
import isReference from './utils/isReference.js';
import counter from './utils/counter.js';
import flattenReference from './utils/flattenReference.js';
import visitors from './visitors/index.js';
import processCss from './css/process.js';

export default function generate ( parsed, template, options = {} ) {
	const renderers = [];

	const generator = {
		addRenderer ( fragment ) {
			if ( fragment.autofocus ) {
				fragment.initStatements.push( `${fragment.autofocus}.focus();` );
			}

			renderers.push( deindent`
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
			` );
		},

		addSourcemapLocations ( node ) {
			walk( node, {
				enter ( node ) {
					generator.code.addSourcemapLocation( node.start );
					generator.code.addSourcemapLocation( node.end );
				}
			});
		},

		code: new MagicString( template ),

		components: {},

		contextualise ( expression, isEventHandler ) {
			const usedContexts = [];

			const contexts = generator.current.contexts;
			const indexes = generator.current.indexes;

			walk( expression, {
				enter ( node, parent ) {
					if ( isReference( node, parent ) ) {
						const { name } = flattenReference( node );

						if ( parent && parent.type === 'CallExpression' && node === parent.callee ) {
							if ( generator.helpers[ name ] ) generator.code.insertRight( node.start, `template.helpers.` );
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

		// TODO use getName instead of counters
		counters: {
			if: 0,
			each: 0
		},

		events: {},

		getName: counter(),

		cssId: parsed.css ? `svelte-${parsed.hash}` : '',

		helpers: {},

		usesRefs: false,

		template
	};

	const templateProperties = {};

	if ( parsed.js ) {
		generator.addSourcemapLocations( parsed.js.content );

		const defaultExport = parsed.js.content.body.find( node => node.type === 'ExportDefaultDeclaration' );

		if ( defaultExport ) {
			const finalNode = parsed.js.content.body[ parsed.js.content.body.length - 1 ];
			if ( defaultExport === finalNode ) {
				// export is last property, we can just return it
				generator.code.overwrite( defaultExport.start, defaultExport.declaration.start, `return ` );
			} else {
				// TODO ensure `template` isn't already declared
				generator.code.overwrite( defaultExport.start, defaultExport.declaration.start, `var template = ` );

				let i = defaultExport.start;
				while ( /\s/.test( template[ i - 1 ] ) ) i--;

				const indentation = template.slice( i, defaultExport.start );
				generator.code.insertLeft( finalNode.end, `\n\n${indentation}return template;` );
			}

			defaultExport.declaration.properties.forEach( prop => {
				templateProperties[ prop.key.name ] = prop.value;
			});

			generator.code.insertRight( parsed.js.content.start, 'var template = (function () {' );
		} else {
			generator.code.insertRight( parsed.js.content.start, '(function () {' );
		}

		generator.code.insertLeft( parsed.js.content.end, '}());' );

		[ 'helpers', 'events', 'components' ].forEach( key => {
			if ( templateProperties[ key ] ) {
				templateProperties[ key ].properties.forEach( prop => {
					generator[ key ][ prop.key.name ] = prop.value;
				});
			}
		});
	}

	generator.current = {
		useAnchor: false,
		name: 'renderMainFragment',
		namespace: null,
		target: 'target',
		elementDepth: 0,

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

	parsed.html.children.forEach( function visit ( node ) {
		const visitor = visitors[ node.type ];
		if ( !visitor ) throw new Error( `Not implemented: ${node.type}` );

		if ( visitor.enter ) visitor.enter( generator, node );

		if ( node.children ) {
			node.children.forEach( child => {
				visit( child );
			});
		}

		if ( visitor.leave ) visitor.leave( generator, node );
	});

	generator.addRenderer( generator.current );

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

	const addCss = parsed.css ? processCss( parsed ) : null;

	const constructorName = options.name || 'SvelteComponent';

	const topLevelStatements = [];

	if ( parsed.js ) {
		topLevelStatements.push( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	if ( parsed.css ) {
		topLevelStatements.push( processCss( parsed ) );
	}

	topLevelStatements.push( ...renderers.reverse() );

	topLevelStatements.push( deindent`
		export default function ${constructorName} ( options ) {
			var component = this;${generator.usesRefs ? `\nthis.refs = {}` : ``}
			var state = {};

			var observers = {
				immediate: Object.create( null ),
				deferred: Object.create( null )
			};

			var callbacks = Object.create( null );

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

			this.fire = function fire ( eventName, data ) {
				var handlers = eventName in callbacks && callbacks[ eventName ].slice();
				if ( !handlers ) return;

				for ( var i = 0; i < handlers.length; i += 1 ) {
					handlers[i].call( this, data );
				}
			};

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

			this.on = function on ( eventName, handler ) {
				const handlers = callbacks[ eventName ] || ( callbacks[ eventName ] = [] );
				handlers.push( handler );

				return {
					cancel: function () {
						const index = handlers.indexOf( handler );
						if ( ~index ) handlers.splice( index, 1 );
					}
				};
			};

			this.teardown = function teardown () {
				mainFragment.teardown();
				mainFragment = null;

				state = {};

				this.fire( 'teardown' );${templateProperties.onteardown ? `\ntemplate.onteardown.call( this );` : ``}
			};

			${parsed.css ? `if ( !addedCss ) addCss();` : ''}
			let mainFragment = renderMainFragment( this, options.target );
			this.set( ${templateProperties.data ? `Object.assign( template.data(), options.data )` : `options.data`} );

			${templateProperties.onrender ? `template.onrender.call( this );` : ``}
		}
	` );

	if ( templateProperties.methods ) {
		topLevelStatements.push( `${constructorName}.prototype = template.methods;` );
	}

	const result = topLevelStatements.join( '\n\n' );

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
