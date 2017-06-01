import Imported from 'Imported.html';

import { assign, createText, detachNode, dispatchObservers, insertNode, proto } from "svelte/shared.js";

var template = (function () {
	return {
		components: {
			NonImported
		}
	};
}());

function create_main_fragment ( state, component ) {
	var imported = new Imported({
		target: null,
		_root: component._root
	});

	var text = createText( "\n" );

	var nonimported = new template.components.NonImported({
		target: null,
		_root: component._root
	});

	return {
		mount: function ( target, anchor ) {
			imported._fragment.mount( target, anchor );
			insertNode( text, target, anchor );
			nonimported._fragment.mount( target, anchor );
		},

		unmount: function () {
			imported._fragment.unmount();
			detachNode( text );
			nonimported._fragment.unmount();
		},

		destroy: function () {
			imported.destroy( false );
			nonimported.destroy( false );
		}
	};
}

function SvelteComponent ( options ) {
	options = options || {};
	this._state = options.data || {};

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;
	this._renderHooks = [];

	this._fragment = create_main_fragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
	this._flush();
}

assign( SvelteComponent.prototype, proto );

SvelteComponent.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = assign( {}, oldState, newState );
	dispatchObservers( this, this._observers.pre, newState, oldState );
	dispatchObservers( this, this._observers.post, newState, oldState );
	this._flush();
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