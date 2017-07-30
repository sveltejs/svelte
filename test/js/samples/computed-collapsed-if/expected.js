import { assign, differs, dispatchObservers, noop, proto } from "svelte/shared.js";

function recompute ( state, newState, oldState, isInitial ) {
	if ( isInitial || ( 'x' in newState && differs( state.x, oldState.x ) ) ) {
		state.a = newState.a = template.computed.a( state.x );
		state.b = newState.b = template.computed.b( state.x );
	}
}

var template = (function () {
	return {
		computed: {
			a: x => x * 2,
			b: x => x * 3
		}
	};
}());

function create_main_fragment ( state, component ) {

	return {
		create: noop,

		mount: noop,

		unmount: noop,

		destroy: noop
	};
}

function SvelteComponent ( options ) {
	options = options || {};
	this._state = options.data || {};
	recompute( this._state, this._state, {}, true );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;

	this._destroyed = false;

	this._fragment = create_main_fragment( this._state, this );

	if ( options.target ) {
		this._fragment.create();
		this._fragment.mount( options.target, null );
	}
}

assign( SvelteComponent.prototype, proto );

SvelteComponent.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = assign( {}, oldState, newState );
	recompute( this._state, newState, oldState, false )
	dispatchObservers( this, this._observers.pre, newState, oldState );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

SvelteComponent.prototype.teardown = SvelteComponent.prototype.destroy = function destroy ( detach ) {
	if ( this._destroyed ) return;
	this.fire( 'destroy' );

	if ( detach !== false ) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = null;

	this._state = {};
	this._destroyed = true;
};

export default SvelteComponent;