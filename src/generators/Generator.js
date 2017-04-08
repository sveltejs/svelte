import MagicString, { Bundle } from 'magic-string';
import { walk } from 'estree-walker';
import isReference from '../utils/isReference.js';
import flattenReference from '../utils/flattenReference.js';
import globalWhitelist from '../utils/globalWhitelist.js';
import reservedNames from '../utils/reservedNames.js';
import namespaces from '../utils/namespaces.js';
import { removeNode, removeObjectKey } from '../utils/removeNode.js';
import getIntro from './shared/utils/getIntro.js';
import getOutro from './shared/utils/getOutro.js';
import processCss from './shared/processCss.js';
import annotateWithScopes from './annotateWithScopes.js';

export default class Generator {
	constructor ( parsed, source, name, options ) {
		this.parsed = parsed;
		this.source = source;
		this.name = name;
		this.options = options;

		this.imports = [];
		this.helpers = new Set();
		this.components = new Set();
		this.events = new Set();
		this.importedComponents = new Map();

		this.bindingGroups = [];

		// track which properties are needed, so we can provide useful info
		// in dev mode
		this.expectedProperties = new Set();

		this.elementDepth = 0;

		this.code = new MagicString( source );
		this.css = parsed.css ? processCss( parsed, this.code ) : null;
		this.cssId = parsed.css ? `svelte-${parsed.hash}` : '';
		this.usesRefs = false;

		// allow compiler to deconflict user's `import { get } from 'whatever'` and
		// Svelte's builtin `import { get, ... } from 'svelte/shared.js'`;
		this.importedNames = new Set();
		this._aliases = new Map();
		this._usedNames = new Set();
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
		if ( this._aliases.has( name ) ) {
			return this._aliases.get( name );
		}
		const alias = this.getUniqueName( name );
		this._aliases.set( name, alias );
		return alias;
	}

	contextualise ( fragment, expression, isEventHandler ) {
		this.addSourcemapLocations( expression );

		const usedContexts = [];
		const dependencies = [];

		const { code, helpers } = this;
		const { contextDependencies, contexts, indexes } = fragment;

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

						if ( globalWhitelist.has( name ) ) {
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
			map: compiled.generateMap({ includeContent: true, file: options.outputFilename }),
			css: this.css
		};
	}

	getUniqueName ( name ) {
		let alias = name;
		for ( let i = 1; reservedNames.has( alias ) || this.importedNames.has( alias ) || this._usedNames.has( alias ); alias = `${name}_${i++}` );
		this._usedNames.add( alias );
		return alias;
	}

	getUniqueNameMaker ( params ) {
		const localUsedNames = new Set( params );
		return name => {
			let alias = name;
			for ( let i = 1; reservedNames.has( alias ) || this.importedNames.has( alias ) || this._usedNames.has( alias ) || localUsedNames.has( alias ); alias = `${name}_${i++}` );
			localUsedNames.add( alias );
			return alias;
		};
	}

	parseJs ( ssr ) {
		const { source } = this;
		const { js } = this.parsed;

		const imports = this.imports;
		const computations = [];
		const templateProperties = {};

		let namespace = null;
		let hasJs = !!js;

		if ( js ) {
			this.addSourcemapLocations( js.content );
			const body = js.content.body.slice(); // slice, because we're going to be mutating the original

			// imports need to be hoisted out of the IIFE
			for ( let i = 0; i < body.length; i += 1 ) {
				const node = body[i];
				if ( node.type === 'ImportDeclaration' ) {
					removeNode( this.code, js.content, node );
					imports.push( node );

					node.specifiers.forEach( specifier => {
						this.importedNames.add( specifier.local.name );
					});
				}
			}

			const defaultExport = body.find( node => node.type === 'ExportDefaultDeclaration' );

			if ( defaultExport ) {
				defaultExport.declaration.properties.forEach( prop => {
					templateProperties[ prop.key.name ] = prop;
				});
			}

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

			if ( templateProperties.namespace ) {
				const ns = templateProperties.namespace.value.value;
				namespace = namespaces[ ns ] || ns;

				removeObjectKey( this.code, defaultExport.declaration, 'namespace' );
			}

			if ( templateProperties.components ) {
				let hasNonImportedComponent = false;
				templateProperties.components.value.properties.forEach( property => {
					const key = property.key.name;
					const value = source.slice( property.value.start, property.value.end );
					if ( this.importedNames.has( value ) ) {
						this.importedComponents.set( key, value );
					} else {
						hasNonImportedComponent = true;
					}
				});
				if ( hasNonImportedComponent ) {
					// remove the specific components that were imported, as we'll refer to them directly
					Array.from( this.importedComponents.keys() ).forEach( key => {
						removeObjectKey( this.code, templateProperties.components.value, key );
					});
				} else {
					// remove the entire components portion of the export
					removeObjectKey( this.code, defaultExport.declaration, 'components' );
				}
			}

			// Remove these after version 2
			if ( templateProperties.onrender ) {
				const { key } = templateProperties.onrender;
				this.code.overwrite( key.start, key.end, 'oncreate', true );
				templateProperties.oncreate = templateProperties.onrender;
			}

			if ( templateProperties.onteardown ) {
				const { key } = templateProperties.onteardown;
				this.code.overwrite( key.start, key.end, 'ondestroy', true );
				templateProperties.ondestroy = templateProperties.onteardown;
			}

			// in an SSR context, we don't need to include events, methods, oncreate or ondestroy
			if ( ssr ) {
				if ( templateProperties.oncreate ) removeNode( this.code, defaultExport.declaration, templateProperties.oncreate );
				if ( templateProperties.ondestroy ) removeNode( this.code, defaultExport.declaration, templateProperties.ondestroy );
				if ( templateProperties.methods ) removeNode( this.code, defaultExport.declaration, templateProperties.methods );
				if ( templateProperties.events ) removeNode( this.code, defaultExport.declaration, templateProperties.events );
			}

			// now that we've analysed the default export, we can determine whether or not we need to keep it
			let hasDefaultExport = !!defaultExport;
			if ( defaultExport && defaultExport.declaration.properties.length === 0 ) {
				hasDefaultExport = false;
				removeNode( this.code, js.content, defaultExport );
			}

			// if we do need to keep it, then we need to generate a return statement
			if ( hasDefaultExport ) {
				const finalNode = body[ body.length - 1 ];
				if ( defaultExport === finalNode ) {
					// export is last property, we can just return it
					this.code.overwrite( defaultExport.start, defaultExport.declaration.start, `return ` );
				} else {
					const { declarations } = annotateWithScopes( js );
					let template = 'template';
					for ( let i = 1; declarations.has( template ); template = `template_${i++}` );

					this.code.overwrite( defaultExport.start, defaultExport.declaration.start, `var ${template} = ` );

					let i = defaultExport.start;
					while ( /\s/.test( source[ i - 1 ] ) ) i--;

					const indentation = source.slice( i, defaultExport.start );
					this.code.appendLeft( finalNode.end, `\n\n${indentation}return ${template};` );
				}
			}

			// user code gets wrapped in an IIFE
			if ( js.content.body.length ) {
				const prefix = hasDefaultExport ? `var ${this.alias( 'template' )} = (function () {` : `(function () {`;
				this.code.prependRight( js.content.start, prefix ).appendLeft( js.content.end, '}());' );
			}

			// if there's no need to include user code, remove it altogether
			else {
				this.code.remove( js.content.start, js.content.end );
				hasJs = false;
			}
		}

		return {
			computations,
			hasJs,
			namespace,
			templateProperties
		};
	}
}
