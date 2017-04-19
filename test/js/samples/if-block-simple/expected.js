import { appendNode, assign, createComment, createElement, createText, detachNode, dispatchObservers, insertNode, proto } from "svelte/shared.js";

function create_main_fragment ( state, component ) {
	var if_block_anchor = createComment();

	var if_block = state.foo && create_if_block( state, component );

	return {
		mount: function ( target, anchor ) {
			insertNode( if_block_anchor, target, anchor );
			if ( if_block ) if_block.mount( target, if_block_anchor );
		},

		update: function ( changed, state ) {
			if ( state.foo ) {
				if ( !if_block ) {
					if_block = create_if_block( state, component );
					if_block.mount( if_block_anchor.parentNode, if_block_anchor );
				}
			} else if ( if_block ) {
				if_block.destroy( true );
				if_block = null;
			}
		},

		destroy: function ( detach ) {
			if ( if_block ) if_block.destroy( detach );

			if ( detach ) {
				detachNode( if_block_anchor );
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

		destroy: function ( detach ) {
			if ( detach ) {
				detachNode( p );
			}
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

	this._root = options._root;
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