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

		this.renderers = [];
		this.code = new MagicString( source );
		this.components = {};
		this.events = {};
		this.helpers = {};
		this.getUniqueName = counter( names );
		this.cssId = parsed.css ? `svelte-${parsed.hash}` : '';
		this.usesRefs = false;
	}

	addElement ( name, renderStatement, needsIdentifier = false ) {
		const isToplevel = this.current.localElementDepth === 0;
		if ( needsIdentifier || isToplevel ) {
			this.current.builders.init.addLine(
				`var ${name} = ${renderStatement};`
			);

			this.createMountStatement( name );
		} else {
			this.current.builders.init.addLine(
				`${this.current.target}.appendChild( ${renderStatement} );`
			);
		}

		if ( isToplevel ) {
			this.current.builders.detach.addLine(
				`${name}.parentNode.removeChild( ${name} );`
			);
		}
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

	createAnchor ( _name, description = '' ) {
		const name = `${_name}_anchor`;
		const statement = `document.createComment( ${JSON.stringify( description )} )`;
		this.addElement( name, statement, true );
		return name;
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
		this.addRenderer( this.current );
		this.pop();
		// unset the children, to avoid them being visited again
		node.children = [];
	}

	addRenderer ( fragment ) {
		if ( fragment.autofocus ) {
			fragment.builders.init.addLine( `${fragment.autofocus}.focus();` );
		}

		// minor hack – we need to ensure that any {{{triples}}} are detached
		// first, so we append normal detach statements to detachRaw
		fragment.builders.detachRaw.addBlock( fragment.builders.detach );

		if ( !fragment.builders.detachRaw.isEmpty() ) {
			fragment.builders.teardown.addBlock( deindent`
				if ( detach ) {
					${fragment.builders.detachRaw}
				}
			` );
		}

		this.renderers.push( deindent`
			function ${fragment.name} ( ${fragment.params}, component ) {
				${fragment.builders.init}

				return {
					mount: function ( target, anchor ) {
						${fragment.builders.mount}
					},

					update: function ( changed, ${fragment.params} ) {
						${fragment.builders.update}
					},

					teardown: function ( detach ) {
						${fragment.builders.teardown}
					}
				};
			}
		` );
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
