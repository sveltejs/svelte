import { appendNode, assign, createElement, createText, detachNode, dispatchObservers, insertNode, noop, proto, setAttribute } from "svelte/shared.js";

var template = (function () {
	return {
		data: function () {
			return { foo: 42 }
		}
	};
}());

function add_css () {
	var style = createElement( 'style' );
	style.id = 'svelte-2421768003-style';
	style.textContent = "\r\n\tp[svelte-2421768003], [svelte-2421768003] p {\r\n\t\tcolor: red;\r\n\t}\r\n";
	appendNode( style, document.head );
}

function create_main_fragment ( state, component ) {
	var p, text_value, text;

	return {
		create: function () {
			p = createElement( 'p' );
			text = createText( text_value = state.foo );
			this.hydrate();
		},

		hydrate: function ( nodes ) {
			setAttribute( p, 'svelte-2421768003', '' );
		},

		mount: function ( target, anchor ) {
			insertNode( p, target, anchor );
			appendNode( text, p );
		},

		update: function ( changed, state ) {
			if ( text_value !== ( text_value = state.foo ) ) {
				text.data = text_value;
			}
		},

		unmount: function () {
			detachNode( p );
		},

		destroy: noop
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
	if ( !document.getElementById( 'svelte-2421768003-style' ) ) add_css();

	this._fragment = create_main_fragment( this._state, this );

	this._protectDomUpdate = false;
	if ( options.target ) {
		this._fragment.create();
		this._fragment.mount( options.target, null );
	} else {
		this._protectDomUpdate = true;
	}
	this._protectDomUpdate = false;
}

assign( SvelteComponent.prototype, proto );

SvelteComponent.prototype._set = function _set ( newState, withoutDomUpdate ) {
	var oldState = this._state;
	this._state = assign( {}, oldState, newState );
	dispatchObservers( this, this._observers.pre, newState, oldState );

	withoutDomUpdate || this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

SvelteComponent.prototype.teardown = SvelteComponent.prototype.destroy = function destroy ( detach ) {
	this.fire( 'destroy' );

	if ( detach !== false ) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

export default SvelteComponent;