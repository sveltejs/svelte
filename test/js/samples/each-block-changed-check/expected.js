import { appendNode, assign, createComment, createElement, createText, destroyEach, detachBetween, detachNode, dispatchObservers, insertNode, proto } from "svelte/shared.js";

function create_main_fragment ( root, component ) {
	var each_block_anchor = createComment();
	var each_block_value = root.comments;
	var each_block_iterations = [];

	for ( var i = 0; i < each_block_value.length; i += 1 ) {
		each_block_iterations[i] = create_each_block( root, each_block_value, each_block_value[i], i, component );
	}

	return {
		mount: function ( target, anchor ) {
			insertNode( each_block_anchor, target, anchor );

			for ( var i = 0; i < each_block_iterations.length; i += 1 ) {
				each_block_iterations[i].mount( target, each_block_anchor );
			}
		},

		update: function ( changed, root ) {
			var each_block_value = root.comments;

			if ( 'comments' in changed || 'elapsed' in changed || 'time' in changed ) {
				for ( var i = 0; i < each_block_value.length; i += 1 ) {
					if ( each_block_iterations[i] ) {
						each_block_iterations[i].update( changed, root, each_block_value, each_block_value[i], i );
					} else {
						each_block_iterations[i] = create_each_block( root, each_block_value, each_block_value[i], i, component );
						each_block_iterations[i].mount( each_block_anchor.parentNode, each_block_anchor );
					}
				}

				destroyEach( each_block_iterations, true, each_block_value.length );

				each_block_iterations.length = each_block_value.length;
			}
		},

		destroy: function ( detach ) {
			destroyEach( each_block_iterations, detach, 0 );

			if ( detach ) {
				detachNode( each_block_anchor );
			}
		}
	};
}

function create_each_block ( root, each_block_value, comment, comment_index, component ) {
	var div = createElement( 'div' );
	div.className = "comment";
	var span = createElement( 'span' );
	appendNode( span, div );
	span.className = "meta";
	var text_value = comment.author;
	var text = createText( text_value );
	appendNode( text, span );
	appendNode( createText( " wrote " ), span );
	var text_2_value = root.elapsed(comment.time, root.time);
	var text_2 = createText( text_2_value );
	appendNode( text_2, span );
	appendNode( createText( " ago:" ), span );
	appendNode( createText( "\n\n\t\t" ), div );
	var raw_before = createElement( 'noscript' );
	appendNode( raw_before, div );
	var raw_after = createElement( 'noscript' );
	appendNode( raw_after, div );
	var raw_value = comment.html;
	raw_before.insertAdjacentHTML( 'afterend', raw_value );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},

		update: function ( changed, root, each_block_value, comment, comment_index ) {
			if ( text_value !== ( text_value = comment.author ) ) {
				text.data = text_value;
			}

			if ( text_2_value !== ( text_2_value = root.elapsed(comment.time, root.time) ) ) {
				text_2.data = text_2_value;
			}

			if ( raw_value !== ( raw_value = comment.html ) ) {
				detachBetween( raw_before, raw_after );
				raw_before.insertAdjacentHTML( 'afterend', raw_value );
			}
		},

		destroy: function ( detach ) {
			if ( detach ) {
				detachBetween( raw_before, raw_after );

				detachNode( div );
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