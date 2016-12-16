import MagicString from 'magic-string';
import CodeBuilder from '../utils/CodeBuilder.js';
import { walk } from 'estree-walker';
import deindent from '../utils/deindent.js';
import isReference from '../utils/isReference.js';
import counter from './shared/utils/counter.js';
import flattenReference from '../utils/flattenReference.js';
import globalWhitelist from '../utils/globalWhitelist.js';

export default class Generator {
	constructor ( parsed, source, names, visitors ) {
		this.parsed = parsed;
		this.source = source;
		this.names = names;
		this.visitors = visitors;

		this.templateProperties = {};
		this.helpers = {};
		this.components = {};
		this.events = {};

		this.imports = [];
		this.computations = [];

		this.code = new MagicString( source );
		this.getUniqueName = counter( names );
		this.cssId = parsed.css ? `svelte-${parsed.hash}` : '';
		this.usesRefs = false;

		this._callbacks = {};

		this.init();
	}

	addSourcemapLocations ( node ) {
		walk( node, {
			enter: node => {
				this.code.addSourcemapLocation( node.start );
				this.code.addSourcemapLocation( node.end );
			}
		});
	}

	contextualise ( expression, isEventHandler ) {
		const usedContexts = [];
		const dependencies = [];

		const { code, helpers } = this;
		const { contextDependencies, contexts, indexes } = this.current;

		walk( expression, {
			enter ( node, parent ) {
				if ( isReference( node, parent ) ) {
					const { name } = flattenReference( node );

					if ( parent && parent.type === 'CallExpression' && node === parent.callee && helpers[ name ] ) {
						code.prependRight( node.start, `template.helpers.` );
					}

					else if ( name === 'event' && isEventHandler ) {
						// noop
					}

					else if ( contexts[ name ] ) {
						dependencies.push( ...contextDependencies[ name ] );
						if ( !~usedContexts.indexOf( name ) ) usedContexts.push( name );
					}

					else if ( indexes[ name ] ) {
						const context = indexes[ name ];
						if ( !~usedContexts.indexOf( context ) ) usedContexts.push( context );
					}

					else {
						if ( globalWhitelist[ name ] ) {
							code.prependRight( node.start, `( '${name}' in root ? root.` );
							code.appendLeft( node.object.end, ` : ${name} )` );
						} else {
							code.prependRight( node.start, `root.` );
						}

						dependencies.push( name );
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
			string: this.code.slice( expression.start, expression.end )
		};
	}

	createMountStatement ( name ) {
		if ( this.current.target === 'target' ) {
			this.current.builders.mount.addLine(
				`target.insertBefore( ${name}, anchor );`
			);
		} else {
			this.current.builders.init.addLine(
				`${this.current.target}.appendChild( ${name} );` );
		}
	}

	fire ( eventName, data ) {
		const handlers = eventName in this._callbacks && this._callbacks[ eventName ].slice();
		if ( !handlers ) return;

		for ( let i = 0; i < handlers.length; i += 1 ) {
			handlers[i].call( this, data );
		}
	}

	generateBlock ( node, name ) {
		this.push({
			name,
			target: 'target',
			localElementDepth: 0,
			builders: this.getBuilders(),
			getUniqueName: this.getUniqueNameMaker()
		});
		// walk the children here
		node.children.forEach( node => this.visit( node ) );
		this.fire( 'addRenderer', this.current );
		this.pop();
		// unset the children, to avoid them being visited again
		node.children = [];
	}

	getBuilders () {
		return {
			init: new CodeBuilder(),
			mount: new CodeBuilder(),
			update: new CodeBuilder(),
			detach: new CodeBuilder(),
			detachRaw: new CodeBuilder(),
			teardown: new CodeBuilder()
		};
	}

	getUniqueNameMaker () {
		return counter( this.names );
	}

	init () {
		const { computations, imports, source } = this;
		const { js } = this.parsed;

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

					//imports.push( source.slice( a, b ).replace( /^\s/, '' ) );
					imports.push( node );
					this.code.remove( a, b );
				}
			}

			const defaultExport = js.content.body.find( node => node.type === 'ExportDefaultDeclaration' );

			if ( defaultExport ) {
				const finalNode = js.content.body[ js.content.body.length - 1 ];
				if ( defaultExport === finalNode ) {
					// export is last property, we can just return it
					this.code.overwrite( defaultExport.start, defaultExport.declaration.start, `return ` );
				} else {
					// TODO ensure `template` isn't already declared
					this.code.overwrite( defaultExport.start, defaultExport.declaration.start, `var template = ` );

					let i = defaultExport.start;
					while ( /\s/.test( source[ i - 1 ] ) ) i--;

					const indentation = source.slice( i, defaultExport.start );
					this.code.appendLeft( finalNode.end, `\n\n${indentation}return template;` );
				}

				defaultExport.declaration.properties.forEach( prop => {
					this.templateProperties[ prop.key.name ] = prop.value;
				});

				this.code.prependRight( js.content.start, 'var template = (function () {' );
			} else {
				this.code.prependRight( js.content.start, '(function () {' );
			}

			this.code.appendLeft( js.content.end, '}());' );

			[ 'helpers', 'events', 'components' ].forEach( key => {
				if ( this.templateProperties[ key ] ) {
					this.templateProperties[ key ].properties.forEach( prop => {
						this[ key ][ prop.key.name ] = prop.value;
					});
				}
			});

			if ( this.templateProperties.computed ) {
				const dependencies = new Map();

				this.templateProperties.computed.properties.forEach( prop => {
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

					computations.push({ key, deps });
				}

				this.templateProperties.computed.properties.forEach( prop => visit( prop.key.name ) );
			}
		}
	}

	on ( eventName, handler ) {
		const handlers = this._callbacks[ eventName ] || ( this._callbacks[ eventName ] = [] );
		handlers.push( handler );
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

		if ( node.children ) {
			node.children.forEach( child => {
				this.visit( child );
			});
		}

		if ( visitor.leave ) visitor.leave( this, node );
	}
}
