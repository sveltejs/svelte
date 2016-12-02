import MagicString, { Bundle } from 'magic-string';
import { walk } from 'estree-walker';
import deindent from './utils/deindent.js';
import isReference from './utils/isReference.js';
import counter from './utils/counter.js';
import flattenReference from './utils/flattenReference.js';
import getIntro from './utils/getIntro.js';
import getOutro from './utils/getOutro.js';
import visitors from './visitors/index.js';
import processCss from './css/process.js';

export default function generate ( parsed, source, options ) {
	const format = options.format || 'es';
	const renderers = [];

	const generator = {
		addElement ( name, renderStatement, needsIdentifier = false ) {
			const needsTeardown = generator.current.localElementDepth === 0;
			if ( needsIdentifier || needsTeardown ) {
				generator.current.initStatements.push( deindent`
					var ${name} = ${renderStatement};
					${generator.appendToTarget( name )};
				` );
			} else {
				generator.current.initStatements.push( deindent`
					${generator.current.target}.appendChild( ${renderStatement} );
				` );
			}
			if ( needsTeardown ) {
				generator.current.teardownStatements.push( deindent`
					if ( detach ) ${name}.parentNode.removeChild( ${name} );
				` );
			}
		},
		appendToTarget ( name ) {
			if ( generator.current.useAnchor && generator.current.target === 'target' ) {
				return `anchor.parentNode.insertBefore( ${name}, anchor )`;
			}
			return `${generator.current.target}.appendChild( ${name} )`;
		},

		addRenderer ( fragment ) {
			if ( fragment.autofocus ) {
				fragment.initStatements.push( `${fragment.autofocus}.focus();` );
			}

			renderers.push( deindent`
				function ${fragment.name} ( ${fragment.params}, component, target${fragment.useAnchor ? ', anchor' : ''} ) {
					${fragment.initStatements.join( '\n\n' )}

					return {
						update: function ( changed, ${fragment.params} ) {
							${fragment.updateStatements.join( '\n\n' )}
						},

						teardown: function ( detach ) {
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
			const dependencies = [];

			const { contextDependencies, contexts, indexes } = generator.current;

			walk( expression, {
				enter ( node, parent ) {
					if ( isReference( node, parent ) ) {
						const { name } = flattenReference( node );

						if ( parent && parent.type === 'CallExpression' && node === parent.callee ) {
							if ( generator.helpers[ name ] ) generator.code.prependRight( node.start, `template.helpers.` );
							return;
						}

						if ( name === 'event' && isEventHandler ) {
							return;
						}

						if ( contexts[ name ] ) {
							dependencies.push( ...contextDependencies[ name ] );
							if ( !~usedContexts.indexOf( name ) ) usedContexts.push( name );
						} else if ( indexes[ name ] ) {
							const context = indexes[ name ];
							if ( !~usedContexts.indexOf( context ) ) usedContexts.push( context );
						} else {
							dependencies.push( node.name );
							generator.code.prependRight( node.start, `root.` );
							if ( !~usedContexts.indexOf( 'root' ) ) usedContexts.push( 'root' );
						}

						this.skip();
					}
				}
			});

			return {
				dependencies,
				contexts: usedContexts,
				snippet: `[✂${expression.start}-${expression.end}✂]`,
				string: generator.code.slice( expression.start, expression.end )
			};
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

				//imports.push( source.slice( a, b ).replace( /^\s/, '' ) );
				imports.push( node );
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
				generator.code.appendLeft( finalNode.end, `\n\n${indentation}return template;` );
			}

			defaultExport.declaration.properties.forEach( prop => {
				templateProperties[ prop.key.name ] = prop.value;
			});

			generator.code.prependRight( parsed.js.content.start, 'var template = (function () {' );
		} else {
			generator.code.prependRight( parsed.js.content.start, '(function () {' );
		}

		generator.code.appendLeft( parsed.js.content.end, '}());' );

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
		localElementDepth: 0,

		initStatements: [],
		updateStatements: [],
		teardownStatements: [],

		contexts: {},
		indexes: {},

		params: 'root',
		indexNames: {},
		listNames: {},

		counter: counter()
	});

	parsed.html.children.forEach( generator.visit );

	generator.addRenderer( generator.pop() );

	const topLevelStatements = [];

	const setStatements = [ deindent`
		var oldState = state;
		state = Object.assign( {}, oldState, newState );
	` ];

	if ( templateProperties.computed ) {
		const statements = [];
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

			statements.push( deindent`
				if ( ${deps.map( dep => `( '${dep}' in newState && typeof state.${dep} === 'object' || state.${dep} !== oldState.${dep} )` ).join( ' || ' )} ) {
					state.${key} = newState.${key} = template.computed.${key}( ${deps.map( dep => `state.${dep}` ).join( ', ' )} );
				}
			` );
		}

		templateProperties.computed.properties.forEach( prop => visit( prop.key.name ) );

		topLevelStatements.push( deindent`
			function applyComputations ( state, newState, oldState ) {
				${statements.join( '\n\n' )}
			}
		` );

		setStatements.push( `applyComputations( state, newState, oldState )` );
	}

	setStatements.push( deindent`
		dispatchObservers( observers.immediate, newState, oldState );
		if ( mainFragment ) mainFragment.update( newState, state );
		dispatchObservers( observers.deferred, newState, oldState );
	` );

	const importBlock = imports
		.map( ( declaration, i ) => {
			if ( format === 'es' ) {
				return source.slice( declaration.start, declaration.end );
			}

			const defaultImport = declaration.specifiers.find( x => x.type === 'ImportDefaultSpecifier' || x.type === 'ImportSpecifier' && x.imported.name === 'default' );
			const namespaceImport = declaration.specifiers.find( x => x.type === 'ImportNamespaceSpecifier' );
			const namedImports = declaration.specifiers.filter( x => x.type === 'ImportSpecifier' && x.imported.name !== 'default' );

			const name = ( defaultImport || namespaceImport ) ? ( defaultImport || namespaceImport ).local.name : `__import${i}`;
			declaration.name = name; // hacky but makes life a bit easier later

			const statements = namedImports.map( specifier => {
				return `var ${specifier.local.name} = ${name}.${specifier.imported.name}`;
			});

			if ( defaultImport ) {
				statements.push( `${name} = ( ${name} && ${name}.__esModule ) ? ${name}['default'] : ${name};` );
			}

			return statements.join( '\n' );
		})
		.filter( Boolean )
		.join( '\n' );

	if ( parsed.js ) {
		if ( imports.length ) {
			topLevelStatements.push( importBlock );
		}

		topLevelStatements.push( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	if ( parsed.css ) {
		topLevelStatements.push( processCss( parsed ) );
	}

	topLevelStatements.push( ...renderers.reverse() );

	const constructorName = options.name || 'SvelteComponent';

	const initStatements = [];

	if ( parsed.css ) {
		initStatements.push( `if ( !addedCss ) addCss();` );
	}

	if ( generator.hasComponents ) {
		initStatements.push( deindent`
			this.__renderHooks = [];
		` );
	}

	if ( generator.hasComplexBindings ) {
		initStatements.push( deindent`
			this.__bindings = [];
			var mainFragment = renderMainFragment( state, this, options.target );
			while ( this.__bindings.length ) this.__bindings.pop()();
		` );

		setStatements.push( `while ( this.__bindings.length ) this.__bindings.pop()();` );
	} else {
		initStatements.push( `var mainFragment = renderMainFragment( state, this, options.target );` );
	}

	if ( generator.hasComponents ) {
		const statement = deindent`
			while ( this.__renderHooks.length ) {
				var hook = this.__renderHooks.pop();
				hook.fn.call( hook.context );
			}
		`;

		initStatements.push( statement );
		setStatements.push( statement );
	}

	if ( templateProperties.onrender ) {
		initStatements.push( deindent`
			if ( options.parent ) {
				options.parent.__renderHooks.push({ fn: template.onrender, context: this });
			} else {
				template.onrender.call( this );
			}
		` );
	}

	const initialState = templateProperties.data ? `Object.assign( template.data(), options.data )` : `options.data || {}`;

	topLevelStatements.push( deindent`
		function ${constructorName} ( options ) {
			var component = this;${generator.usesRefs ? `\nthis.refs = {}` : ``}
			var state = ${initialState};${templateProperties.computed ? `\napplyComputations( state, state, {} );` : ``}

			var observers = {
				immediate: Object.create( null ),
				deferred: Object.create( null )
			};

			var callbacks = Object.create( null );

			function dispatchObservers ( group, newState, oldState ) {
				for ( var key in group ) {
					if ( !( key in newState ) ) continue;

					var newValue = newState[ key ];
					var oldValue = oldState[ key ];

					if ( newValue === oldValue && typeof newValue !== 'object' ) continue;

					var callbacks = group[ key ];
					if ( !callbacks ) continue;

					for ( var i = 0; i < callbacks.length; i += 1 ) {
						var callback = callbacks[i];
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
				return key ? state[ key ] : state;
			};

			this.set = function set ( newState ) {
				${setStatements.join( '\n\n' )}
			};

			this.observe = function ( key, callback, options ) {
				var group = ( options && options.defer ) ? observers.deferred : observers.immediate;

				( group[ key ] || ( group[ key ] = [] ) ).push( callback );

				if ( !options || options.init !== false ) {
					callback.__calling = true;
					callback.call( component, state[ key ] );
					callback.__calling = false;
				}

				return {
					cancel: function () {
						var index = group[ key ].indexOf( callback );
						if ( ~index ) group[ key ].splice( index, 1 );
					}
				};
			};

			this.on = function on ( eventName, handler ) {
				var handlers = callbacks[ eventName ] || ( callbacks[ eventName ] = [] );
				handlers.push( handler );

				return {
					cancel: function () {
						var index = handlers.indexOf( handler );
						if ( ~index ) handlers.splice( index, 1 );
					}
				};
			};

			this.teardown = function teardown ( detach ) {
				this.fire( 'teardown' );${templateProperties.onteardown ? `\ntemplate.onteardown.call( this );` : ``}

				mainFragment.teardown( detach !== false );
				mainFragment = null;

				state = {};
			};

			${initStatements.join( '\n\n' )}
		}
	` );

	if ( templateProperties.methods ) {
		topLevelStatements.push( `${constructorName}.prototype = template.methods;` );
	}

	const result = topLevelStatements.join( '\n\n' );

	const pattern = /\[✂(\d+)-(\d+)$/;

	const parts = result.split( '✂]' );
	const finalChunk = parts.pop();

	const compiled = new Bundle({ separator: '' });

	function addString ( str ) {
		compiled.addSource({
			content: new MagicString( str )
		});
	}

	const intro = getIntro( format, options, imports );
	if ( intro ) addString( intro );

	// a filename is necessary for sourcemap generation
	const filename = options.filename || 'SvelteComponent.html';

	parts.forEach( str => {
		const chunk = str.replace( pattern, '' );
		if ( chunk ) addString( chunk );

		const match = pattern.exec( str );

		const snippet = generator.code.snip( +match[1], +match[2] );

		compiled.addSource({
			filename,
			content: snippet
		});
	});

	addString( finalChunk );
	addString( '\n\n' + getOutro( format, constructorName, options, imports ) );

	return {
		code: compiled.toString(),
		map: compiled.generateMap({ includeContent: true })
	};
}
