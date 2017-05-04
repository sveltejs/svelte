import MagicString from 'magic-string';
import { parseExpressionAt } from 'acorn';
import annotateWithScopes from '../../utils/annotateWithScopes.js';
import isReference from '../../utils/isReference.js';
import { walk } from 'estree-walker';
import deindent from '../../utils/deindent.js';
import CodeBuilder from '../../utils/CodeBuilder.js';
import visit from './visit.js';
import shared from './shared.js';
import Generator from '../Generator.js';
import preprocess from './preprocess.js';

class DomGenerator extends Generator {
	constructor ( parsed, source, name, options ) {
		super( parsed, source, name, options );
		this.blocks = [];
		this.uses = new Set();

		this.readonly = new Set();

		// initial values for e.g. window.innerWidth, if there's a <:Window> meta tag
		this.metaBindings = [];
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

	const state = {
		namespace,
		parentNode: null,
		isTopLevel: true
	};

	const block = preprocess( generator, state, parsed.html );

	parsed.html.children.forEach( node => {
		visit( generator, block, state, node );
	});

	const builders = {
		main: new CodeBuilder(),
		_set: new CodeBuilder()
	};

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

	builders._set.addBlock( deindent`
		${options.dev && deindent`
			if ( typeof newState !== 'object' ) {
				throw new Error( 'Component .set was called without an object of data key-values to update.' );
			}

			${Array.from( generator.readonly ).map( prop =>
				`if ( '${prop}' in newState && !this._updatingReadonlyProperty ) throw new Error( "Cannot set read-only property '${prop}'" );`
			)}
		`}

		var oldState = this._state;
		this._state = ${generator.helper( 'assign' )}( {}, oldState, newState );
		${computations.length && `${generator.alias( 'recompute' )}( this._state, newState, oldState, false )`}
		${generator.helper( 'dispatchObservers' )}( this, this._observers.pre, newState, oldState );
		${block.hasUpdateMethod && `this._fragment.update( newState, this._state );`}
		${generator.helper( 'dispatchObservers' )}( this, this._observers.post, newState, oldState );
		${generator.hasComplexBindings && `while ( this._bindings.length ) this._bindings.pop()();`}
		${( generator.hasComponents || generator.hasIntroTransitions ) && `this._flush();`}
	` );

	if ( hasJs ) {
		builders.main.addBlock( `[✂${parsed.js.content.start}-${parsed.js.content.end}✂]` );
	}

	if ( generator.css && options.css !== false ) {
		builders.main.addBlock( deindent`
			function ${generator.alias( 'add_css' )} () {
				var style = ${generator.helper( 'createElement' )}( 'style' );
				style.id = ${JSON.stringify( generator.cssId + '-style' )};
				style.textContent = ${JSON.stringify( generator.css )};
				${generator.helper( 'appendNode' )}( style, document.head );
			}
		` );
	}

	generator.blocks.forEach( block => {
		builders.main.addBlock( block.render() );
	});

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

	// TODO deprecate component.teardown()
	builders.main.addBlock( deindent`
		function ${name} ( options ) {
			options = options || {};
			${options.dev && `if ( !options.target && !options._root ) throw new Error( "'target' is a required option" );`}
			${generator.usesRefs && `this.refs = {};`}
			this._state = ${templateProperties.data ? `${generator.helper( 'assign' )}( ${generator.alias( 'template' )}.data(), options.data )` : `options.data || {}`};
			${generator.metaBindings}
			${computations.length && `${generator.alias( 'recompute' )}( this._state, this._state, {}, true );`}
			${options.dev && Array.from( generator.expectedProperties ).map( prop => `if ( !( '${prop}' in this._state ) ) console.warn( "Component was created without expected data property '${prop}'" );`)}
			${generator.bindingGroups.length && `this._bindingGroups = [ ${Array( generator.bindingGroups.length ).fill( '[]' ).join( ', ' )} ];`}

			this._observers = {
				pre: Object.create( null ),
				post: Object.create( null )
			};

			this._handlers = Object.create( null );

			this._root = options._root || this;
			this._yield = options._yield;

			this._torndown = false;
			${parsed.css && options.css !== false && `if ( !document.getElementById( ${JSON.stringify( generator.cssId + '-style' )} ) ) ${generator.alias( 'add_css' )}();`}
			${( generator.hasComponents || generator.hasIntroTransitions ) && `this._renderHooks = [];`}
			${generator.hasComplexBindings && `this._bindings = [];`}

			this._fragment = ${generator.alias( 'create_main_fragment' )}( this._state, this );
			if ( options.target ) this._fragment.mount( options.target, null );
			${generator.hasComplexBindings && `while ( this._bindings.length ) this._bindings.pop()();`}
			${( generator.hasComponents || generator.hasIntroTransitions ) && `this._flush();`}

			${templateProperties.oncreate && deindent`
				if ( options._root ) {
					options._root._renderHooks.push( ${generator.alias( 'template' )}.oncreate.bind( this ) );
				} else {
					${generator.alias( 'template' )}.oncreate.call( this );
				}
			`}
		}

		${generator.helper( 'assign' )}( ${prototypeBase}, ${proto});

		${name}.prototype._set = function _set ( newState ) {
			${builders._set}
		};

		${name}.prototype.teardown = ${name}.prototype.destroy = function destroy ( detach ) {
			this.fire( 'destroy' );
			${templateProperties.ondestroy && `${generator.alias( 'template' )}.ondestroy.call( this );`}

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
			const str = shared[ key ];
			const code = new MagicString( str );
			const expression = parseExpressionAt( str, 0 );

			let scope = annotateWithScopes( expression );

			walk( expression, {
				enter ( node, parent ) {
					if ( node._scope ) scope = node._scope;

					if ( node.type === 'Identifier' && isReference( node, parent ) && !scope.has( node.name ) ) {
						if ( node.name in shared ) {
							// this helper function depends on another one
							const dependency = node.name;
							generator.uses.add( dependency );

							const alias = generator.alias( dependency );
							if ( alias !== node.name ) code.overwrite( node.start, node.end, alias );
						}
					}
				},

				leave ( node ) {
					if ( node._scope ) scope = scope.parent;
				}
			});

			if ( key === 'transitionManager' ) { // special case
				const global = `_svelteTransitionManager`;

				builders.main.addBlock(
					`var ${generator.alias( 'transitionManager' )} = window.${global} || ( window.${global} = ${code});`
				);
			} else {
				const alias = generator.alias( expression.id.name );
				if ( alias !== expression.id.name ) code.overwrite( expression.id.start, expression.id.end, alias );

				builders.main.addBlock( code.toString() );
			}
		});
	}

	return generator.generate( builders.main.toString(), options, { name, format } );
}
