import MagicString from 'magic-string';
import { parse } from 'acorn';
import annotateWithScopes from '../../utils/annotateWithScopes.js';
import isReference from '../../utils/isReference.js';
import { walk } from 'estree-walker';
import deindent from '../../utils/deindent.js';
import CodeBuilder from '../../utils/CodeBuilder.js';
import visit from './visit.js';
import Generator from '../Generator.js';
import Block from './Block.js';
import * as shared from '../../shared/index.js';

class DomGenerator extends Generator {
	constructor ( parsed, source, name, options ) {
		super( parsed, source, name, options );
		this.blocks = [];
		this.uses = new Set();

		this.readonly = new Set();

		// initial values for e.g. window.innerWidth, if there's a <:Window> meta tag
		this.builders = {
			metaBindings: new CodeBuilder()
		};
	}

	addBlock ( block ) {
		this.blocks.push( block );
	}

	helper ( name ) {
		if ( this.options.dev && `${name}Dev` in shared ) {
			name = `${name}Dev`;
		}

		this.uses.add( name );

		return this.alias( name );
	}
}

export default function dom ( parsed, source, options ) {
	const format = options.format || 'es';
	const name = options.name || 'SvelteComponent';

	const generator = new DomGenerator( parsed, source, name, options );

	const { computations, hasJs, templateProperties, namespace } = generator.parseJs();

	const getUniqueName = generator.getUniqueNameMaker( [ 'root' ] );
	const component = getUniqueName( 'component' );

	const mainBlock = new Block({
		generator,
		name: generator.alias( 'create_main_fragment' ),
		key: null,

		component,

		contexts: new Map(),
		indexes: new Map(),

		params: [ 'root' ],
		indexNames: new Map(),
		listNames: new Map(),

		getUniqueName
	});

	const state = {
		namespace,
		parentNode: null,
		isTopLevel: true
	};

	parsed.html.children.forEach( node => {
		visit( generator, mainBlock, state, node );
	});

	generator.addBlock( mainBlock );

	const builders = {
		main: new CodeBuilder(),
		init: new CodeBuilder(),
		_set: new CodeBuilder()
	};

	if ( options.dev ) {
		builders._set.addBlock ( deindent`
			if ( typeof newState !== 'object' ) {
				throw new Error( 'Component .set was called without an object of data key-values to update.' );
			}
		`);
	}

	builders._set.addLine( 'var oldState = this._state;' );
	builders._set.addLine( `this._state = ${generator.helper( 'assign' )}( {}, oldState, newState );` );

	if ( computations.length ) {
		const builder = new CodeBuilder();
		const differs = generator.helper( 'differs' );

		computations.forEach( ({ key, deps }) => {
			if ( generator.readonly.has( key ) ) {
				// <:Window> bindings
				throw new Error( `Cannot have a computed value '${key}' that clashes with a read-only property` );
			}

			generator.readonly.add( key );

			const condition = `isInitial || ${deps.map( dep => `( '${dep}' in newState && ${differs}( state.${dep}, oldState.${dep} ) )` ).join( ' || ' )}`;
			const statement = `state.${key} = newState.${key} = ${generator.alias( 'template' )}.computed.${key}( ${deps.map( dep => `state.${dep}` ).join( ', ' )} );`;

			builder.addConditionalLine( condition, statement );
		});

		builders.main.addBlock( deindent`
			function ${generator.alias( 'recompute' )} ( state, newState, oldState, isInitial ) {
				${builder}
			}
		` );
	}

	if ( options.dev ) {
		Array.from( generator.readonly ).forEach( prop => {
			builders._set.addLine( `if ( '${prop}' in newState && !this._updatingReadonlyProperty ) throw new Error( "Cannot set read-only property '${prop}'" );` );
		});
	}

	if ( computations.length ) {
		builders._set.addLine( `${generator.alias( 'recompute' )}( this._state, newState, oldState, false )` );
	}

	// TODO is the `if` necessary?
	builders._set.addBlock( deindent`
		${generator.helper( 'dispatchObservers' )}( this, this._observers.pre, newState, oldState );
		if ( this._fragment ) this._fragment.update( newState, this._state );
		${generator.helper( 'dispatchObservers' )}( this, this._observers.post, newState, oldState );
	` );

	if ( hasJs ) {
		builders.main.addBlock( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	if ( generator.css && options.css !== false ) {
		builders.main.addBlock( deindent`
			var ${generator.alias( 'added_css' )} = false;
			function ${generator.alias( 'add_css' )} () {
				var style = ${generator.helper( 'createElement' )}( 'style' );
				style.textContent = ${JSON.stringify( generator.css )};
				${generator.helper( 'appendNode' )}( style, document.head );

				${generator.alias( 'added_css' )} = true;
			}
		` );
	}

	let i = generator.blocks.length;
	while ( i-- ) builders.main.addBlock( generator.blocks[i].render() );

	builders.init.addLine( `this._torndown = false;` );

	if ( parsed.css && options.css !== false ) {
		builders.init.addLine( `if ( !${generator.alias( 'added_css' )} ) ${generator.alias( 'add_css' )}();` );
	}

	if ( generator.hasComponents ) {
		builders.init.addLine( `this._renderHooks = [];` );
	}

	if ( generator.hasComplexBindings ) {
		builders.init.addBlock( deindent`
			this._bindings = [];
			this._fragment = ${generator.alias( 'create_main_fragment' )}( this._state, this );
			if ( options.target ) this._fragment.mount( options.target, null );
			while ( this._bindings.length ) this._bindings.pop()();
		` );

		builders._set.addLine( `while ( this._bindings.length ) this._bindings.pop()();` );
	} else {
		builders.init.addBlock( deindent`
			this._fragment = ${generator.alias( 'create_main_fragment' )}( this._state, this );
			if ( options.target ) this._fragment.mount( options.target, null );
		` );
	}

	if ( generator.hasComponents ) {
		const statement = `this._flush();`;

		builders.init.addBlock( statement );
		builders._set.addBlock( statement );
	}

	if ( templateProperties.oncreate ) {
		builders.init.addBlock( deindent`
			if ( options._root ) {
				options._root._renderHooks.push({ fn: ${generator.alias( 'template' )}.oncreate, context: this });
			} else {
				${generator.alias( 'template' )}.oncreate.call( this );
			}
		` );
	}

	const constructorBlock = new CodeBuilder();

	constructorBlock.addLine( `options = options || {};` );
	if ( generator.usesRefs ) constructorBlock.addLine( `this.refs = {};` );

	constructorBlock.addLine(
		`this._state = ${templateProperties.data ? `${generator.helper( 'assign' )}( ${generator.alias( 'template' )}.data(), options.data )` : `options.data || {}`};`
	);

	if ( !generator.builders.metaBindings.isEmpty() ) {
		constructorBlock.addBlock( generator.builders.metaBindings );
	}

	if ( computations.length ) {
		constructorBlock.addLine(
			`${generator.alias( 'recompute' )}( this._state, this._state, {}, true );`
		);
	}

	if ( options.dev ) {
		generator.expectedProperties.forEach( prop => {
			constructorBlock.addLine(
				`if ( !( '${prop}' in this._state ) ) console.warn( "Component was created without expected data property '${prop}'" );`
			);
		});

		constructorBlock.addBlock(
			`if ( !options.target && !options._root ) throw new Error( "'target' is a required option" );`
		);
	}

	if ( generator.bindingGroups.length ) {
		constructorBlock.addLine( `this._bindingGroups = [ ${Array( generator.bindingGroups.length ).fill( '[]' ).join( ', ' )} ];` );
	}

	constructorBlock.addBlock( deindent`
		this._observers = {
			pre: Object.create( null ),
			post: Object.create( null )
		};

		this._handlers = Object.create( null );

		this._root = options._root;
		this._yield = options._yield;

		${builders.init}
	` );

	builders.main.addBlock( deindent`
		function ${name} ( options ) {
			${constructorBlock}
		}
	` );

	const sharedPath = options.shared === true ? 'svelte/shared.js' : options.shared;

	const prototypeBase = `${name}.prototype` + ( templateProperties.methods ? `, ${generator.alias( 'template' )}.methods` : '' );
	const proto = sharedPath ? `${generator.helper( 'proto' )} ` : deindent`
		{
			${
				[ 'get', 'fire', 'observe', 'on', 'set', '_flush' ]
					.map( n => `${n}: ${generator.helper( n )}` )
					.join( ',\n' )
			}
		}`;

	builders.main.addBlock( `${generator.helper( 'assign' )}( ${prototypeBase}, ${proto});` );

	// TODO deprecate component.teardown()
	builders.main.addBlock( deindent`
		${name}.prototype._set = function _set ( newState ) {
			${builders._set}
		};

		${name}.prototype.teardown = ${name}.prototype.destroy = function destroy ( detach ) {
			this.fire( 'destroy' );${templateProperties.ondestroy ? `\n${generator.alias( 'template' )}.ondestroy.call( this );` : ``}

			this._fragment.destroy( detach !== false );
			this._fragment = null;

			this._state = {};
			this._torndown = true;
		};
	` );

	if ( sharedPath ) {
		if ( format !== 'es' ) {
			throw new Error( `Components with shared helpers must be compiled to ES2015 modules (format: 'es')` );
		}

		const names = Array.from( generator.uses ).sort().map( name => {
			return name !== generator.alias( name ) ? `${name} as ${generator.alias( name )}` : name;
		});

		builders.main.addLineAtStart(
			`import { ${names.join( ', ' )} } from ${JSON.stringify( sharedPath )};`
		);
	} else {
		generator.uses.forEach( key => {
			const str = shared[ key ].toString(); // eslint-disable-line import/namespace
			const code = new MagicString( str );
			const fn = parse( str ).body[0];

			let scope = annotateWithScopes( fn );

			walk( fn, {
				enter ( node, parent ) {
					if ( node._scope ) scope = node._scope;

					if ( node.type === 'Identifier' && isReference( node, parent ) && !scope.has( node.name ) ) {
						if ( node.name in shared ) {
							// this helper function depends on another one
							generator.uses.add( node.name );

							const alias = generator.alias( node.name );
							if ( alias !== node.name ) code.overwrite( node.start, node.end, alias );
						}
					}
				},

				leave ( node ) {
					if ( node._scope ) scope = scope.parent;
				}
			});

			const alias = generator.alias( fn.id.name );
			if ( alias !== fn.id.name ) code.overwrite( fn.id.start, fn.id.end, alias );

			builders.main.addBlock( code.toString() );
		});
	}

	return generator.generate( builders.main.toString(), options, { name, format } );
}
