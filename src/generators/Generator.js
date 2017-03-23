import MagicString, { Bundle } from 'magic-string';
import { walk } from 'estree-walker';
import isReference from '../utils/isReference.js';
import counter from './shared/utils/counter.js';
import flattenReference from '../utils/flattenReference.js';
import globalWhitelist from '../utils/globalWhitelist.js';
import getIntro from './shared/utils/getIntro.js';
import getOutro from './shared/utils/getOutro.js';
import annotateWithScopes from './annotateWithScopes.js';

export default class Generator {
	constructor ( parsed, source, name, names, visitors, options ) {
		this.parsed = parsed;
		this.source = source;
		this.name = name;
		this.names = names;
		this.visitors = visitors;
		this.options = options;

		this.imports = [];
		this.helpers = new Set();
		this.components = new Set();
		this.events = new Set();

		this.bindingGroups = [];

		// track which properties are needed, so we can provide useful info
		// in dev mode
		this.expectedProperties = new Set();

		this.elementDepth = 0;

		this.code = new MagicString( source );
		this.getUniqueName = counter( names );
		this.cssId = parsed.css ? `svelte-${parsed.hash}` : '';
		this.usesRefs = false;

		// allow compiler to deconflict user's `import { get } from 'whatever'` and
		// Svelte's builtin `import { get, ... } from 'svelte/shared.js'`;
		this.importedNames = new Set();

		this.aliases = new Map();

		this._callbacks = new Map();
	}

	addSourcemapLocations ( node ) {
		walk( node, {
			enter: node => {
				this.code.addSourcemapLocation( node.start );
				this.code.addSourcemapLocation( node.end );
			}
		});
	}

	alias ( name ) {
		if ( !( this.aliases.has( name ) ) ) {
			let alias = name;
			let i = 1;
			while ( alias in this.importedNames ) {
				alias = `${name}$${i++}`;
			}

			this.aliases.set( name, alias );
		}

		return this.aliases.get( name );
	}

	contextualise ( expression, isEventHandler ) {
		this.addSourcemapLocations( expression );

		const usedContexts = [];
		const dependencies = [];

		const { code, helpers } = this;
		const { contextDependencies, contexts, indexes } = this.current;

		let scope = annotateWithScopes( expression );

		const self = this;

		walk( expression, {
			enter ( node, parent, key ) {
				if ( node._scope ) {
					scope = node._scope;
					return;
				}

				if ( isReference( node, parent ) ) {
					const { name } = flattenReference( node );
					if ( scope.has( name ) ) return;

					if ( parent && parent.type === 'CallExpression' && node === parent.callee && helpers.has( name ) ) {
						code.prependRight( node.start, `${self.alias( 'template' )}.helpers.` );
					}

					else if ( name === 'event' && isEventHandler ) {
						// noop
					}

					else if ( contexts.has( name ) ) {
						const context = contexts.get( name );
						if ( context !== name ) {
							// this is true for 'reserved' names like `root` and `component`
							code.overwrite( node.start, node.start + name.length, context, true );
						}

						dependencies.push( ...contextDependencies.get( name ) );
						if ( !~usedContexts.indexOf( name ) ) usedContexts.push( name );
					}

					else if ( indexes.has( name ) ) {
						const context = indexes.get( name );
						if ( !~usedContexts.indexOf( context ) ) usedContexts.push( context );
					}

					else {
						// handle shorthand properties
						if ( parent && parent.type === 'Property' && parent.shorthand ) {
							if ( key === 'key' ) {
								code.appendLeft( node.start, `${name}: ` );
								return;
							}
						}

						if ( globalWhitelist[ name ] ) {
							code.prependRight( node.start, `( '${name}' in root ? root.` );
							code.appendLeft( node.object ? node.object.end : node.end, ` : ${name} )` );
						} else {
							code.prependRight( node.start, `root.` );
						}

						dependencies.push( name );
						if ( !~usedContexts.indexOf( 'root' ) ) usedContexts.push( 'root' );
					}

					this.skip();
				}
			},

			leave ( node ) {
				if ( node._scope ) scope = scope.parent;
			}
		});

		dependencies.forEach( name => {
			this.expectedProperties.add( name );
		});

		return {
			dependencies,
			contexts: usedContexts,
			snippet: `[✂${expression.start}-${expression.end}✂]`,
			string: this.code.slice( expression.start, expression.end )
		};
	}

	fire ( eventName, data ) {
		const handlers = this._callbacks.has( eventName ) && this._callbacks.get( eventName ).slice();
		if ( !handlers ) return;

		for ( let i = 0; i < handlers.length; i += 1 ) {
			handlers[i].call( this, data );
		}
	}

	generate ( result, options, { name, format } ) {
		if ( this.imports.length ) {
			const statements = [];

			this.imports.forEach( ( declaration, i ) => {
				if ( format === 'es' ) {
					statements.push( this.source.slice( declaration.start, declaration.end ) );
					return;
				}

				const defaultImport = declaration.specifiers.find( x => x.type === 'ImportDefaultSpecifier' || x.type === 'ImportSpecifier' && x.imported.name === 'default' );
				const namespaceImport = declaration.specifiers.find( x => x.type === 'ImportNamespaceSpecifier' );
				const namedImports = declaration.specifiers.filter( x => x.type === 'ImportSpecifier' && x.imported.name !== 'default' );

				const name = ( defaultImport || namespaceImport ) ? ( defaultImport || namespaceImport ).local.name : `__import${i}`;
				declaration.name = name; // hacky but makes life a bit easier later

				namedImports.forEach( specifier => {
					statements.push( `var ${specifier.local.name} = ${name}.${specifier.imported.name}` );
				});

				if ( defaultImport ) {
					statements.push( `${name} = ( ${name} && ${name}.__esModule ) ? ${name}['default'] : ${name};` );
				}
			});

			result = `${statements.join( '\n' )}\n\n${result}`;
		}

		const pattern = /\[✂(\d+)-(\d+)$/;

		const parts = result.split( '✂]' );
		const finalChunk = parts.pop();

		const compiled = new Bundle({ separator: '' });

		function addString ( str ) {
			compiled.addSource({
				content: new MagicString( str )
			});
		}

		const intro = getIntro( format, options, this.imports );
		if ( intro ) addString( intro );

		const { filename } = options;

		// special case — the source file doesn't actually get used anywhere. we need
		// to add an empty file to populate map.sources and map.sourcesContent
		if ( !parts.length ) {
			compiled.addSource({
				filename,
				content: new MagicString( this.source ).remove( 0, this.source.length )
			});
		}

		parts.forEach( str => {
			const chunk = str.replace( pattern, '' );
			if ( chunk ) addString( chunk );

			const match = pattern.exec( str );

			const snippet = this.code.snip( +match[1], +match[2] );

			compiled.addSource({
				filename,
				content: snippet
			});
		});

		addString( finalChunk );
		addString( '\n\n' + getOutro( format, name, options, this.imports ) );

		return {
			code: compiled.toString(),
			map: compiled.generateMap({ includeContent: true, file: options.outputFilename })
		};
	}

	getUniqueNameMaker () {
		return counter( this.names );
	}

	parseJs () {
		const { source } = this;
		const { js } = this.parsed;

		const imports = this.imports;
		const computations = [];
		let defaultExport = null;
		const templateProperties = {};

		if ( js ) {
			this.addSourcemapLocations( js.content );

			// imports need to be hoisted out of the IIFE
			for ( let i = 0; i < js.content.body.length; i += 1 ) {
				const node = js.content.body[i];
				if ( node.type === 'ImportDeclaration' ) {
					let a = node.start;
					let b = node.end;
					while ( /[ \t]/.test( source[ a - 1 ] ) ) a -= 1;
					while ( source[b] === '\n' ) b += 1;

					imports.push( node );
					this.code.remove( a, b );
					node.specifiers.forEach( specifier => {
						this.importedNames[ specifier.local.name ] = true;
					});
				}
			}

			defaultExport = js.content.body.find( node => node.type === 'ExportDefaultDeclaration' );

			if ( defaultExport ) {
				const finalNode = js.content.body[ js.content.body.length - 1 ];
				if ( defaultExport === finalNode ) {
					// export is last property, we can just return it
					this.code.overwrite( defaultExport.start, defaultExport.declaration.start, `return ` );
				} else {
					const { declarations } = annotateWithScopes( js );
					let template = 'template';
					for ( let i = 1; declarations.has( template ); template = `template$${i++}` );

					this.code.overwrite( defaultExport.start, defaultExport.declaration.start, `var ${template} = ` );

					let i = defaultExport.start;
					while ( /\s/.test( source[ i - 1 ] ) ) i--;

					const indentation = source.slice( i, defaultExport.start );
					this.code.appendLeft( finalNode.end, `\n\n${indentation}return ${template};` );
				}

				defaultExport.declaration.properties.forEach( prop => {
					templateProperties[ prop.key.name ] = prop;
				});

				this.code.prependRight( js.content.start, `var ${this.alias( 'template' )} = (function () {` );
			} else {
				this.code.prependRight( js.content.start, '(function () {' );
			}

			this.code.appendLeft( js.content.end, '}());' );

			[ 'helpers', 'events', 'components' ].forEach( key => {
				if ( templateProperties[ key ] ) {
					templateProperties[ key ].value.properties.forEach( prop => {
						this[ key ].add( prop.key.name );
					});
				}
			});

			if ( templateProperties.computed ) {
				const dependencies = new Map();

				templateProperties.computed.value.properties.forEach( prop => {
					const key = prop.key.name;
					const value = prop.value;

					const deps = value.params.map( param => param.type === 'AssignmentPattern' ? param.left.name : param.name );
					dependencies.set( key, deps );
				});

				const visited = new Set();

				function visit ( key ) {
					if ( !dependencies.has( key ) ) return; // not a computation

					if ( visited.has( key ) ) return;
					visited.add( key );

					const deps = dependencies.get( key );
					deps.forEach( visit );

					computations.push({ key, deps });
				}

				templateProperties.computed.value.properties.forEach( prop => visit( prop.key.name ) );
			}
		}

		return {
			computations,
			defaultExport,
			templateProperties
		};
	}

	on ( eventName, handler ) {
		if ( this._callbacks.has( eventName ) ) {
			this._callbacks.get( eventName ).push( handler );
		} else {
			this._callbacks.set( eventName, [ handler ] );
		}
	}

	pop () {
		const tail = this.current;
		this.current = tail.parent;

		return tail;
	}

	push ( fragment ) {
		const newFragment = Object.assign( {}, this.current, fragment, {
			parent: this.current
		});

		this.current = newFragment;
	}

	visit ( node ) {
		const visitor = this.visitors[ node.type ];
		if ( !visitor ) throw new Error( `Not implemented: ${node.type}` );

		if ( visitor.enter ) visitor.enter( this, node );

		if ( visitor.type === 'Element' ) {
			this.elementDepth += 1;
		}

		if ( node.children ) {
			node.children.forEach( child => {
				this.visit( child );
			});
		}

		if ( visitor.type === 'Element' ) {
			this.elementDepth -= 1;
		}

		if ( visitor.leave ) visitor.leave( this, node );
	}
}
