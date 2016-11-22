import MagicString from 'magic-string';
import { walk } from 'estree-walker';
import deindent from './utils/deindent.js';
import isReference from './utils/isReference.js';
import counter from './utils/counter.js';
import flattenReference from './utils/flattenReference.js';
import visitors from './visitors/index.js';
import processCss from './css/process.js';

export default function generate ( parsed, source, options ) {
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

		code: new MagicString( source ),

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

		pop () {
			const tail = generator.current;
			generator.current = tail.parent;

			return tail;
		},

		push ( fragment ) {
			const newFragment = Object.assign( {}, generator.current, fragment, {
				parent: generator.current
			});

			generator.current = newFragment;
		},

		usesRefs: false,

		source,

		visit ( node ) {
			const visitor = visitors[ node.type ];
			if ( !visitor ) throw new Error( `Not implemented: ${node.type}` );

			if ( visitor.enter ) visitor.enter( generator, node );

			if ( node.children ) {
				node.children.forEach( child => {
					generator.visit( child );
				});
			}

			if ( visitor.leave ) visitor.leave( generator, node );
		}
	};

	const templateProperties = {};
	const imports = [];

	if ( parsed.js ) {
		generator.addSourcemapLocations( parsed.js.content );

		// imports need to be hoisted out of the IIFE
		for ( let i = 0; i < parsed.js.content.body.length; i += 1 ) {
			const node = parsed.js.content.body[i];
			if ( node.type === 'ImportDeclaration' ) {
				let a = node.start;
				let b = node.end;
				while ( /[ \t]/.test( source[ a - 1 ] ) ) a -= 1;
				while ( source[b] === '\n' ) b += 1;

				imports.push( source.slice( a, b ).replace( /^\s/, '' ) );
				generator.code.remove( a, b );
			}
		}

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
				while ( /\s/.test( source[ i - 1 ] ) ) i--;

				const indentation = source.slice( i, defaultExport.start );
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

	generator.push({
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

		counter: counter()
	});

	parsed.html.children.forEach( generator.visit );

	generator.addRenderer( generator.pop() );

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
		if ( setting ) return;

		setting = true;
		dispatchObservers( observers.immediate, newState, oldState );
		if ( mainFragment ) mainFragment.update( state );
		dispatchObservers( observers.deferred, newState, oldState );
		setting = false;
	` );

	const topLevelStatements = [];

	if ( parsed.js ) {
		if ( imports.length ) {
			topLevelStatements.push( imports.join( '' ).trim() );
		}

		topLevelStatements.push( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	if ( parsed.css ) {
		topLevelStatements.push( processCss( parsed ) );
	}

	topLevelStatements.push( ...renderers.reverse() );

	const constructorName = options.name || 'SvelteComponent';

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
						const callback = callbacks[i];
						if ( callback.__calling ) continue;

						callback.__calling = true;
						callback.call( component, newValue, oldValue );
						callback.__calling = false;
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

			let setting = false;

			this.set = function set ( newState ) {
				${setStatements.join( '\n\n' )}
			};

			this.observe = function ( key, callback, options = {} ) {
				const group = options.defer ? observers.deferred : observers.immediate;

				( group[ key ] || ( group[ key ] = [] ) ).push( callback );

				if ( options.init !== false ) {
					callback.__calling = true;
					callback.call( component, state[ key ] );
					callback.__calling = false;
				}

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
				this.fire( 'teardown' );${templateProperties.onteardown ? `\ntemplate.onteardown.call( this );` : ``}

				mainFragment.teardown();
				mainFragment = null;

				state = {};
			};

			${parsed.css ? `if ( !addedCss ) addCss();` : ''}
			var mainFragment = renderMainFragment( this, options.target );
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

	generator.code.remove( c, source.length );
	generator.code.append( finalChunk );

	sortedByResult.forEach( part => {
		generator.code.move( part.start, part.end, 0 );
	});

	return {
		code: generator.code.toString(),
		map: generator.code.generateMap()
	};
}
