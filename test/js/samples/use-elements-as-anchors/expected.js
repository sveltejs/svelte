import { appendNode, assign, createComment, createElement, createText, detachNode, dispatchObservers, insertNode, proto } from "svelte/shared.js";

function create_main_fragment ( state, component ) {
	var div = createElement( 'div' );

	var if_block = (state.a) && create_if_block( state, component );

	if ( if_block ) if_block.mount( div, null );
	var text = createText( "\n\n\t" );
	appendNode( text, div );
	var p = createElement( 'p' );
	appendNode( p, div );
	appendNode( createText( "this can be used as an anchor" ), p );
	appendNode( createText( "\n\n\t" ), div );

	var if_block_1 = (state.b) && create_if_block_1( state, component );

	if ( if_block_1 ) if_block_1.mount( div, null );
	var text_3 = createText( "\n\n\t" );
	appendNode( text_3, div );

	var if_block_2 = (state.c) && create_if_block_2( state, component );

	if ( if_block_2 ) if_block_2.mount( div, null );
	var text_4 = createText( "\n\n\t" );
	appendNode( text_4, div );
	var p_1 = createElement( 'p' );
	appendNode( p_1, div );
	appendNode( createText( "so can this" ), p_1 );
	appendNode( createText( "\n\n\t" ), div );

	var if_block_3 = (state.d) && create_if_block_3( state, component );

	if ( if_block_3 ) if_block_3.mount( div, null );
	var text_7 = createText( "\n\n\t" );
	appendNode( text_7, div );
	var text_8 = createText( "\n\n" );
	var if_block_4_anchor = createComment();

	var if_block_4 = (state.e) && create_if_block_4( state, component );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
			insertNode( text_8, target, anchor );
			insertNode( if_block_4_anchor, target, anchor );
			if ( if_block_4 ) if_block_4.mount( target, null );
		},

		update: function ( changed, state ) {
			if ( state.a ) {
				if ( !if_block ) {
					if_block = create_if_block( state, component );
					if_block.mount( div, text );
				}
			} else if ( if_block ) {
				if_block.destroy( true );
				if_block = null;
			}

			if ( state.b ) {
				if ( !if_block_1 ) {
					if_block_1 = create_if_block_1( state, component );
					if_block_1.mount( div, text_3 );
				}
			} else if ( if_block_1 ) {
				if_block_1.destroy( true );
				if_block_1 = null;
			}

			if ( state.c ) {
				if ( !if_block_2 ) {
					if_block_2 = create_if_block_2( state, component );
					if_block_2.mount( div, text_4 );
				}
			} else if ( if_block_2 ) {
				if_block_2.destroy( true );
				if_block_2 = null;
			}

			if ( state.d ) {
				if ( !if_block_3 ) {
					if_block_3 = create_if_block_3( state, component );
					if_block_3.mount( div, text_7 );
				}
			} else if ( if_block_3 ) {
				if_block_3.destroy( true );
				if_block_3 = null;
			}

			if ( state.e ) {
				if ( !if_block_4 ) {
					if_block_4 = create_if_block_4( state, component );
					if_block_4.mount( if_block_4_anchor.parentNode, if_block_4_anchor );
				}
			} else if ( if_block_4 ) {
				if_block_4.destroy( true );
				if_block_4 = null;
			}
		},

		destroy: function ( detach ) {
			if ( if_block ) if_block.destroy( false );
			if ( if_block_1 ) if_block_1.destroy( false );
			if ( if_block_2 ) if_block_2.destroy( false );
			if ( if_block_3 ) if_block_3.destroy( false );
			if ( if_block_4 ) if_block_4.destroy( detach );

			if ( detach ) {
				detachNode( div );
				detachNode( text_8 );
				detachNode( if_block_4_anchor );
			}
		}
	};
}

function create_if_block ( state, component ) {
	var p = createElement( 'p' );
	appendNode( createText( "a" ), p );

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

function create_if_block_1 ( state, component ) {
	var p = createElement( 'p' );
	appendNode( createText( "b" ), p );

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

function create_if_block_2 ( state, component ) {
	var p = createElement( 'p' );
	appendNode( createText( "c" ), p );

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

function create_if_block_3 ( state, component ) {
	var p = createElement( 'p' );
	appendNode( createText( "d" ), p );

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

function create_if_block_4 ( state, component ) {
	var p = createElement( 'p' );
	appendNode( createText( "e" ), p );

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

	this._fragment.destroy( detach !== false );
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

export default SvelteComponent;