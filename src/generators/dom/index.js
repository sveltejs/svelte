import deindent from '../../utils/deindent.js';
import getBuilders from './utils/getBuilders.js';
import CodeBuilder from '../../utils/CodeBuilder.js';
import namespaces from '../../utils/namespaces.js';
import processCss from '../shared/css/process.js';
import visitors from './visitors/index.js';
import Generator from '../Generator.js';
import * as shared from '../../shared/index.js';

class DomGenerator extends Generator {
	constructor ( parsed, source, names, visitors ) {
		super( parsed, source, names, visitors );
		this.renderers = [];
		this.uses = {};
	}

	addElement ( name, renderStatement, needsIdentifier = false ) {
		const isToplevel = this.current.localElementDepth === 0;
		if ( needsIdentifier || isToplevel ) {
			this.current.builders.init.addLine(
				`var ${name} = ${renderStatement};`
			);

			this.createMountStatement( name );
		} else {
			this.uses.appendNode = true;
			this.current.builders.init.addLine( `appendNode( ${renderStatement}, ${this.current.target} );` );
		}

		if ( isToplevel ) {
			this.uses.detachNode = true;
			this.current.builders.detach.addLine( `detachNode( ${name} );` );
		}
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

		const properties = new CodeBuilder();

		if ( fragment.key ) properties.addBlock( `key: key,` );

		if ( fragment.builders.mount.isEmpty() ) {
			this.uses.noop = true;
			properties.addBlock( `mount: noop,` );
		} else {
			properties.addBlock( deindent`
				mount: function ( target, anchor ) {
					${fragment.builders.mount}
				},
			` );
		}

		if ( fragment.builders.update.isEmpty() ) {
			this.uses.noop = true;
			properties.addBlock( `update: noop,` );
		} else {
			properties.addBlock( deindent`
				update: function ( changed, ${fragment.params} ) {
					${fragment.builders.update}
				},
			` );
		}

		if ( fragment.builders.teardown.isEmpty() ) {
			this.uses.noop = true;
			properties.addBlock( `teardown: noop,` );
		} else {
			properties.addBlock( deindent`
				teardown: function ( detach ) {
					${fragment.builders.teardown}
				},
			` );
		}

		this.renderers.push( deindent`
			function ${fragment.name} ( ${fragment.params}, component${fragment.key ? `, key` : ''} ) {
				${fragment.builders.init}

				return {
					${properties}
				};
			}
		` );
	}

	createAnchor ( name, description = '' ) {
		this.uses.createComment = true;
		const renderStatement = `createComment( ${JSON.stringify( description )} )`;
		this.addElement( name, renderStatement, true );
	}

	createMountStatement ( name ) {
		if ( this.current.target === 'target' ) {
			this.uses.insertNode = true;
			this.current.builders.mount.addLine( `insertNode( ${name}, target, anchor );` );
		} else {
			this.uses.appendNode = true;
			this.current.builders.init.addLine( `appendNode( ${name}, ${this.current.target} );` );
		}
	}

	generateBlock ( node, name ) {
		this.push({
			name,
			target: 'target',
			localElementDepth: 0,
			builders: getBuilders(),
			getUniqueName: this.getUniqueNameMaker()
		});

		// walk the children here
		node.children.forEach( node => this.visit( node ) );
		this.addRenderer( this.current );
		this.pop();

		// unset the children, to avoid them being visited again
		node.children = [];
	}
}

export default function dom ( parsed, source, options, names ) {
	const format = options.format || 'es';
	const name = options.name || 'SvelteComponent';

	const generator = new DomGenerator( parsed, source, names, visitors );

	const { computations, templateProperties } = generator.parseJs();

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
		localElementDepth: 0,
		key: null,

		contexts: {},
		indexes: {},

		params: 'root',
		indexNames: {},
		listNames: {},

		builders: getBuilders(),
		getUniqueName: generator.getUniqueNameMaker()
	});

	parsed.html.children.forEach( node => generator.visit( node ) );

	generator.addRenderer( generator.pop() );

	const builders = {
		main: new CodeBuilder(),
		init: new CodeBuilder(),
		set: new CodeBuilder()
	};

	builders.set.addLine( 'var oldState = this._state;' );
	builders.set.addLine( 'this._state = Object.assign( {}, oldState, newState );' );

	if ( computations.length ) {
		const builder = new CodeBuilder();

		computations.forEach( ({ key, deps }) => {
			builder.addBlock( deindent`
				if ( ${deps.map( dep => `( '${dep}' in newState && typeof state.${dep} === 'object' || state.${dep} !== oldState.${dep} )` ).join( ' || ' )} ) {
					state.${key} = newState.${key} = template.computed.${key}( ${deps.map( dep => `state.${dep}` ).join( ', ' )} );
				}
			` );
		});

		builders.main.addBlock( deindent`
			function applyComputations ( state, newState, oldState ) {
				${builder}
			}
		` );

		builders.set.addLine( `applyComputations( this._state, newState, oldState )` );
	}

	// TODO is the `if` necessary?
	builders.set.addBlock( deindent`
		dispatchObservers( this, this._observers.pre, newState, oldState );
		if ( this._fragment ) this._fragment.update( newState, this._state );
		dispatchObservers( this, this._observers.post, newState, oldState );
	` );

	if ( parsed.js ) {
		builders.main.addBlock( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	if ( parsed.css && options.css !== false ) {
		generator.uses.appendNode = true;
		generator.uses.createElement = true;

		builders.main.addBlock( deindent`
			let addedCss = false;
			function addCss () {
				var style = createElement( 'style' );
				style.textContent = ${JSON.stringify( processCss( parsed ) )};
				appendNode( style, document.head );

				addedCss = true;
			}
		` );
	}

	let i = generator.renderers.length;
	while ( i-- ) builders.main.addBlock( generator.renderers[i] );

	if ( parsed.css && options.css !== false ) {
		builders.init.addLine( `if ( !addedCss ) addCss();` );
	}

	if ( generator.hasComponents ) {
		builders.init.addLine( `this._renderHooks = [];` );
	}

	if ( generator.hasComplexBindings ) {
		builders.init.addBlock( deindent`
			this._bindings = [];
			this._fragment = renderMainFragment( this._state, this );
			if ( options.target ) this._fragment.mount( options.target, null );
			while ( this._bindings.length ) this._bindings.pop()();
		` );

		builders.set.addLine( `while ( this._bindings.length ) this._bindings.pop()();` );
	} else {
		builders.init.addBlock( deindent`
			this._fragment = renderMainFragment( this._state, this );
			if ( options.target ) this._fragment.mount( options.target, null );
		` );
	}

	if ( generator.hasComponents ) {
		const statement = deindent`
			while ( this._renderHooks.length ) {
				var hook = this._renderHooks.pop();
				hook.fn.call( hook.context );
			}
		`;

		builders.init.addBlock( statement );
		builders.set.addBlock( statement );
	}

	if ( templateProperties.onrender ) {
		builders.init.addBlock( deindent`
			if ( options._root ) {
				options._root._renderHooks.push({ fn: template.onrender, context: this });
			} else {
				template.onrender.call( this );
			}
		` );
	}

	const initialState = templateProperties.data ? `Object.assign( template.data(), options.data )` : `options.data || {}`;

	builders.main.addBlock( deindent`
		function ${name} ( options ) {
			options = options || {};
			${generator.usesRefs ? `\nthis.refs = {}` : ``}
			this._state = ${initialState};${templateProperties.computed ? `\napplyComputations( this._state, this._state, {} );` : ``}

			this._observers = {
				pre: Object.create( null ),
				post: Object.create( null )
			};

			this._handlers = Object.create( null );

			this._root = options._root;
			this._yield = options._yield;

			${builders.init}
		}
	` );

	if ( templateProperties.methods ) {
		builders.main.addBlock( `${name}.prototype = template.methods;` );
	}

	const sharedPath = options.shared === true ? 'svelte/shared.js' : options.shared;

	builders.main.addBlock( sharedPath ?
		deindent`
			${name}.prototype.get = get;
			${name}.prototype.fire = fire;
			${name}.prototype.observe = observe;
			${name}.prototype.on = on;
		` :
		deindent`
			${name}.prototype.get = ${shared.get};

			${name}.prototype.fire = ${shared.fire};

			${name}.prototype.observe = ${shared.observe};

			${name}.prototype.on = ${shared.on};
		` );

	builders.main.addBlock( deindent`
		${name}.prototype.set = function set ( newState ) {
			${builders.set}
		};

		${name}.prototype.teardown = function teardown ( detach ) {
			this.fire( 'teardown' );${templateProperties.onteardown ? `\ntemplate.onteardown.call( this );` : ``}

			this._fragment.teardown( detach !== false );
			this._fragment = null;

			this._state = {};
		};
	` );

	if ( sharedPath ) {
		if ( format !== 'es' ) {
			throw new Error( `Components with shared helpers must be compiled to ES2015 modules (format: 'es')` );
		}

		const names = [ 'get', 'fire', 'observe', 'on', 'dispatchObservers' ].concat( Object.keys( generator.uses ) );
		builders.main.addLineAtStart(
			`import { ${names.join( ', ' )} } from '${sharedPath}'`
		);
	} else {
		builders.main.addBlock( shared.dispatchObservers.toString() );

		Object.keys( generator.uses ).forEach( key => {
			const fn = shared[ key ]; // eslint-disable-line import/namespace
			builders.main.addBlock( fn.toString() );
		});
	}

	return generator.generate( builders.main.toString(), options, { name, format } );
}
