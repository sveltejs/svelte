import MagicString from 'magic-string';
import CodeBuilder from '../utils/CodeBuilder.js';
import { walk } from 'estree-walker';
import deindent from '../utils/deindent.js';
import isReference from '../utils/isReference.js';
import counter from './utils/counter.js';
import flattenReference from '../utils/flattenReference.js';
import visitors from './visitors/index.js';

export default function generator ( parsed, source, names ) {
	const generator = {
		addElement ( name, renderStatement, needsIdentifier = false ) {
			const isToplevel = generator.current.localElementDepth === 0;
			if ( needsIdentifier || isToplevel ) {
				generator.current.builders.init.addLine(
					`var ${name} = ${renderStatement};`
				);

				generator.createMountStatement( name );
			} else {
				generator.current.builders.init.addLine(
					`${generator.current.target}.appendChild( ${renderStatement} );`
				);
			}

			if ( isToplevel ) {
				generator.current.builders.detach.addLine(
					`${name}.parentNode.removeChild( ${name} );`
				);
			}
		},

		createMountStatement ( name ) {
			if ( generator.current.target === 'target' ) {
				generator.current.builders.mount.addLine(
					`target.insertBefore( ${name}, anchor );`
				);
			} else {
				generator.current.builders.init.addLine(
					`${generator.current.target}.appendChild( ${name} );` );
			}
		},

		createAnchor ( _name, description = '' ) {
			const name = `${_name}_anchor`;
			const statement = `document.createComment( ${JSON.stringify( description )} )`;
			generator.addElement( name, statement, true );
			return name;
		},

		generateBlock ( node, name ) {
			generator.push({
				name,
				target: 'target',
				localElementDepth: 0,
				builders: generator.getBuilders(),
				getUniqueName: generator.getUniqueNameMaker()
			});
			// walk the children here
			node.children.forEach( generator.visit );
			generator.addRenderer( generator.current );
			generator.pop();
			// unset the children, to avoid them being visited again
			node.children = [];
		},

		renderers: [],

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

			generator.renderers.push( deindent`
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

						if ( parent && parent.type === 'CallExpression' && node === parent.callee && generator.helpers[ name ] ) {
							generator.code.prependRight( node.start, `template.helpers.` );
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
							dependencies.push( name );
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

		events: {},

		getBuilders () {
			return {
				init: new CodeBuilder(),
				mount: new CodeBuilder(),
				update: new CodeBuilder(),
				detach: new CodeBuilder(),
				detachRaw: new CodeBuilder(),
				teardown: new CodeBuilder()
			};
		},

		getUniqueName: counter( names ),

		getUniqueNameMaker () {
			return counter( names );
		},

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

	return generator;
}
