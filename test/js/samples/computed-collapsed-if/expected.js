import { assign, differs, noop, proto } from "svelte/shared.js";

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

		update: noop,

		unmount: noop,

		destroy: noop
	};
}

function SvelteComponent ( options ) {
	this.options = options;
	this._state = options.data || {};
	this._recompute( {}, this._state, {}, true );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;
	this._bind = options._bind;

	this._fragment = create_main_fragment( this._state, this );

	if ( !options._root ) {
		this._fragment.create();
		this._fragment.mount( options.target, options.anchor || null );
	}
}

assign( SvelteComponent.prototype, proto );

SvelteComponent.prototype._recompute = function _recompute ( changed, state, oldState, isInitial ) {
	if ( isInitial || changed.x ) {
		if ( differs( ( state.a = template.computed.a( state.x ) ), oldState.a ) ) changed.a = true;
		if ( differs( ( state.b = template.computed.b( state.x ) ), oldState.b ) ) changed.b = true;
	}
}

export default SvelteComponent;