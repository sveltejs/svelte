import MagicString, { Bundle } from 'magic-string';
import CodeBuilder from '../utils/CodeBuilder.js';
import deindent from '../utils/deindent.js';
import namespaces from '../utils/namespaces.js';
import getIntro from './utils/getIntro.js';
import getOutro from './utils/getOutro.js';
import processCss from './css/process.js';
import Generator from './generator.js';

export default function generate ( parsed, source, options, names ) {
	const format = options.format || 'es';

	const generator = Generator( parsed, source, names );

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

	let namespace = null;
	if ( templateProperties.namespace ) {
		const ns = templateProperties.namespace.value;
		namespace = namespaces[ ns ] || ns;

		// TODO remove the namespace property from the generated code, it's unused past this point
	}

	generator.push({
		name: 'renderMainFragment',
		namespace,
		target: 'target',
		elementDepth: 0,
		localElementDepth: 0,

		contexts: {},
		indexes: {},

		params: 'root',
		indexNames: {},
		listNames: {},

		builders: generator.getBuilders(),
		getUniqueName: generator.getUniqueNameMaker()
	});

	parsed.html.children.forEach( generator.visit );

	generator.addRenderer( generator.pop() );

	const builders = {
		main: new CodeBuilder(),
		init: new CodeBuilder(),
		set: new CodeBuilder()
	};

	builders.set.addLine( 'var oldState = state;' );
	builders.set.addLine( 'state = Object.assign( {}, oldState, newState );' );

	if ( templateProperties.computed ) {
		const builder = new CodeBuilder();
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

			builder.addBlock( deindent`
				if ( ${deps.map( dep => `( '${dep}' in newState && typeof state.${dep} === 'object' || state.${dep} !== oldState.${dep} )` ).join( ' || ' )} ) {
					state.${key} = newState.${key} = template.computed.${key}( ${deps.map( dep => `state.${dep}` ).join( ', ' )} );
				}
			` );
		}

		templateProperties.computed.properties.forEach( prop => visit( prop.key.name ) );

		builders.main.addBlock( deindent`
			function applyComputations ( state, newState, oldState ) {
				${builder}
			}
		` );

		builders.set.addLine( `applyComputations( state, newState, oldState )` );
	}

	builders.set.addBlock( deindent`
		dispatchObservers( observers.immediate, newState, oldState );
		if ( mainFragment ) mainFragment.update( newState, state );
		dispatchObservers( observers.deferred, newState, oldState );
	` );

	imports.forEach( ( declaration, i ) => {
		if ( format === 'es' ) {
			builders.main.addLine( source.slice( declaration.start, declaration.end ) );
			return;
		}

		const defaultImport = declaration.specifiers.find( x => x.type === 'ImportDefaultSpecifier' || x.type === 'ImportSpecifier' && x.imported.name === 'default' );
		const namespaceImport = declaration.specifiers.find( x => x.type === 'ImportNamespaceSpecifier' );
		const namedImports = declaration.specifiers.filter( x => x.type === 'ImportSpecifier' && x.imported.name !== 'default' );

		const name = ( defaultImport || namespaceImport ) ? ( defaultImport || namespaceImport ).local.name : `__import${i}`;
		declaration.name = name; // hacky but makes life a bit easier later

		namedImports.forEach( specifier => {
			builders.main.addLine( `var ${specifier.local.name} = ${name}.${specifier.imported.name}` );
		});

		if ( defaultImport ) {
			builders.main.addLine( `${name} = ( ${name} && ${name}.__esModule ) ? ${name}['default'] : ${name};` );
		}
	});

	if ( parsed.js ) {
		builders.main.addBlock( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	if ( parsed.css && options.css !== false ) {
		builders.main.addBlock( deindent`
			let addedCss = false;
			function addCss () {
				var style = document.createElement( 'style' );
				style.textContent = ${JSON.stringify( processCss( parsed ) )};
				document.head.appendChild( style );

				addedCss = true;
			}
		` );
	}

	let i = generator.renderers.length;
	while ( i-- ) builders.main.addBlock( generator.renderers[i] );

	const constructorName = options.name || 'SvelteComponent';

	if ( parsed.css && options.css !== false ) {
		builders.init.addLine( `if ( !addedCss ) addCss();` );
	}

	if ( generator.hasComponents ) {
		builders.init.addLine( `this.__renderHooks = [];` );
	}

	if ( generator.hasComplexBindings ) {
		builders.init.addBlock( deindent`
			this.__bindings = [];
			var mainFragment = renderMainFragment( state, this );
			if ( options.target ) this._mount( options.target );
			while ( this.__bindings.length ) this.__bindings.pop()();
		` );

		builders.set.addLine( `while ( this.__bindings.length ) this.__bindings.pop()();` );
	} else {
		builders.init.addBlock( deindent`
			var mainFragment = renderMainFragment( state, this );
			if ( options.target ) this._mount( options.target );
		` );
	}

	if ( generator.hasComponents ) {
		const statement = deindent`
			while ( this.__renderHooks.length ) {
				var hook = this.__renderHooks.pop();
				hook.fn.call( hook.context );
			}
		`;

		builders.init.addBlock( statement );
		builders.set.addBlock( statement );
	}

	if ( templateProperties.onrender ) {
		builders.init.addBlock( deindent`
			if ( options.root ) {
				options.root.__renderHooks.push({ fn: template.onrender, context: this });
			} else {
				template.onrender.call( this );
			}
		` );
	}

	const initialState = templateProperties.data ? `Object.assign( template.data(), options.data )` : `options.data || {}`;

	builders.main.addBlock( deindent`
		function ${constructorName} ( options ) {
			options = options || {};

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
				${builders.set}
			};

			this._mount = function mount ( target, anchor ) {
				mainFragment.mount( target, anchor );
			}

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

			this.root = options.root;
			this.yield = options.yield;

			${builders.init}
		}
	` );

	if ( templateProperties.methods ) {
		builders.main.addBlock( `${constructorName}.prototype = template.methods;` );
	}

	const result = builders.main.toString();

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

	const { filename } = options;

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
