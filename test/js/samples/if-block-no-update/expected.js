import { appendNode, assign, createComment, createElement, createText, detachNode, dispatchObservers, insertNode, noop, proto } from "svelte/shared.js";

function create_main_fragment ( state, component ) {
	var if_block_anchor;

	var current_block_type = select_block_type( state );
	var if_block = current_block_type( state, component );

	return {
		create: function () {
			if_block.create();
			if_block_anchor = createComment();
		},

		mount: function ( target, anchor ) {
			if_block.mount( target, anchor );
			insertNode( if_block_anchor, target, anchor );
		},

		update: function ( changed, state ) {
			if ( current_block_type !== ( current_block_type = select_block_type( state ) ) ) {
				if_block.unmount();
				if_block.destroy();
				if_block = current_block_type( state, component );
				if_block.create();
				if_block.mount( if_block_anchor.parentNode, if_block_anchor );
			}
		},

		unmount: function () {
			if_block.unmount();
			detachNode( if_block_anchor );
		},

		destroy: function () {
			if_block.destroy();
		}
	};
}

function create_if_block ( state, component ) {
	var p, text;

	return {
		create: function () {
			p = createElement( 'p' );
			text = createText( "foo!" );
		},

		mount: function ( target, anchor ) {
			insertNode( p, target, anchor );
			appendNode( text, p );
		},

		unmount: function () {
			detachNode( p );
		},

		destroy: noop
	};
}

function create_if_block_1 ( state, component ) {
	var p, text;

	return {
		create: function () {
			p = createElement( 'p' );
			text = createText( "not foo!" );
		},

		mount: function ( target, anchor ) {
			insertNode( p, target, anchor );
			appendNode( text, p );
		},

		unmount: function () {
			detachNode( p );
		},

		destroy: noop
	};
}

function select_block_type ( state ) {
	if ( state.foo ) return create_if_block;
	return create_if_block_1;
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
	dispatchObservers( this, this._observers.pre, newState, oldState );
	this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

export default SvelteComponent;