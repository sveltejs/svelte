import { appendNode, assign, createElement, createText, detachNode, dispatchObservers, insertNode, proto, setAttribute } from "svelte/shared.js";

var template = (function () {
	return {
		data: function () {
			return { foo: 42 }
		}
	};
}());

function add_css () {
	var style = createElement( 'style' );
	style.id = "svelte-3842350206-style";
	style.textContent = "\n\tp[svelte-3842350206], [svelte-3842350206] p {\n\t\tcolor: red;\n\t}\n";
	appendNode( style, document.head );
}

function create_main_fragment ( state, component ) {
	var text_value;

	var p = createElement( 'p' );
	setAttribute( p, 'svelte-3842350206', '' );
	var text = createText( text_value = state.foo );
	appendNode( text, p );

	return {
		mount: function ( target, anchor ) {
			insertNode( p, target, anchor );
		},

		update: function ( changed, state ) {
			if ( text_value !== ( text_value = state.foo ) ) {
				text.data = text_value;
			}
		},

		destroy: function ( detach ) {
			if ( detach ) {
				detachNode( p );
			}
		}
	};
}

function SvelteComponent ( options ) {
	options = options || {};
	this._state = assign( template.data(), options.data );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;
	if ( !document.getElementById( "svelte-3842350206-style" ) ) add_css();

	this._fragment = create_main_fragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
}

assign( SvelteComponent.prototype, proto );

SvelteComponent.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = assign( {}, oldState, newState );
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

SvelteComponent.prototype.teardown = SvelteComponent.prototype.destroy = function destroy ( detach ) {
	this.fire( 'destroy' );

	this._fragment.destroy( detach !== false );
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

export default SvelteComponent;
