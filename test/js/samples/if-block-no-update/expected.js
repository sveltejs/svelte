import { appendNode, assign, createComment, createElement, createText, detachNode, dispatchObservers, insertNode, noop, proto } from "svelte/shared.js";

function create_main_fragment ( state, component ) {
	function get_block ( state ) {
		if ( state.foo ) return create_if_block;
		return create_if_block_1;
	}

	var current_block = get_block( state );
	var if_block = current_block( state, component );

	var if_block_anchor = createComment();

	return {
		mount: function ( target, anchor ) {
			if_block.mount( target, anchor );
			insertNode( if_block_anchor, target, anchor );
		},

		update: function ( changed, state ) {
			if ( current_block !== ( current_block = get_block( state ) ) ) {
				{
					if_block.unmount();
					if_block.destroy();
				}
				if_block = current_block( state, component );
				if_block.mount( if_block_anchor.parentNode, if_block_anchor );
			}
		},

		unmount: function () {
			detachNode( if_block_anchor );
		},

		destroy: function () {
			{
						if_block.unmount();
						if_block.destroy();
					}
		}
	};
}

function create_if_block ( state, component ) {
	var p = createElement( 'p' );
	appendNode( createText( "foo!" ), p );

	return {
		mount: function ( target, anchor ) {
			insertNode( p, target, anchor );
		},

		unmount: function () {
			detachNode( p );
		},

		destroy: noop
	};
}

function create_if_block_1 ( state, component ) {
	var p = createElement( 'p' );
	appendNode( createText( "not foo!" ), p );

	return {
		mount: function ( target, anchor ) {
			insertNode( p, target, anchor );
		},

		unmount: function () {
			detachNode( p );
		},

		destroy: noop
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

	this._fragment = create_main_fragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
}

assign( SvelteComponent.prototype, proto );

SvelteComponent.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = assign( {}, oldState, newState );
	dispatchObservers( this, this._observers.pre, newState, oldState );
	this._fragment.update( newState, this._state );
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