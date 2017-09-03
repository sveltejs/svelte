import { appendNode, assign, createComment, createElement, createText, detachNode, insertNode, noop, proto } from "svelte/shared.js";

function create_main_fragment ( state, component ) {
	var if_block_anchor;

	var if_block = (state.foo) && create_if_block( state, component );

	return {
		create: function () {
			if ( if_block ) if_block.create();
			if_block_anchor = createComment();
		},

		mount: function ( target, anchor ) {
			if ( if_block ) if_block.mount( target, anchor );
			insertNode( if_block_anchor, target, anchor );
		},

		update: function ( changed, state ) {
			if ( state.foo ) {
				if ( !if_block ) {
					if_block = create_if_block( state, component );
					if_block.create();
					if_block.mount( if_block_anchor.parentNode, if_block_anchor );
				}
			} else if ( if_block ) {
				if_block.unmount();
				if_block.destroy();
				if_block = null;
			}
		},

		unmount: function () {
			if ( if_block ) if_block.unmount();
			detachNode( if_block_anchor );
		},

		destroy: function () {
			if ( if_block ) if_block.destroy();
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