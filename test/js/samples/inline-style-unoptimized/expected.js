import { assign, createElement, createText, detachNode, insertNode, noop, proto } from "svelte/shared.js";

function create_main_fragment ( state, component ) {
	var div, text, div_1, div_1_style_value;

	return {
		create: function () {
			div = createElement( 'div' );
			text = createText( "\n" );
			div_1 = createElement( 'div' );
			this.hydrate();
		},

		hydrate: function ( nodes ) {
			div.style.cssText = state.style;
			div_1.style.cssText = div_1_style_value = "" + ( state.key ) + ": " + ( state.value );
		},

		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
			insertNode( text, target, anchor );
			insertNode( div_1, target, anchor );
		},

		update: function ( changed, state ) {
			if ( changed.style ) {
				div.style.cssText = state.style;
			}

			if ( ( changed.key || changed.value ) && div_1_style_value !== ( div_1_style_value = "" + ( state.key ) + ": " + ( state.value ) ) ) {
				div_1.style.cssText = div_1_style_value;
			}
		},

		unmount: function () {
			detachNode( div );
			detachNode( text );
			detachNode( div_1 );
		},

		destroy: noop
	};
}

function SvelteComponent ( options ) {
	this.options = options;
	this._state = options.data || {};

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;
	this._bind = options._bind;

	this._fragment = create_main_fragment( this._state, this );

	if ( options.target ) {
		this._fragment.create();
		this._fragment.mount( options.target, options.anchor || null );
	}
}

assign( SvelteComponent.prototype, proto );

export default SvelteComponent;