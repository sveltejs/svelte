function assign ( target ) {
	for ( var i = 1; i < arguments.length; i += 1 ) {
		var source = arguments[i];
		for ( var k in source ) target[k] = source[k];
	}

	return target;
}

function appendNode ( node, target ) {
	target.appendChild( node );
}

function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

function detachBetween ( before, after ) {
	while ( before.nextSibling && before.nextSibling !== after ) {
		before.parentNode.removeChild( before.nextSibling );
	}
}

function destroyEach ( iterations, detach, start ) {
	for ( var i = start; i < iterations.length; i += 1 ) {
		if ( iterations[i] ) iterations[i].destroy( detach );
	}
}

function createElement ( name ) {
	return document.createElement( name );
}

function createText ( data ) {
	return document.createTextNode( data );
}

var transitionManager = {
	running: false,
	transitions: [],

	add: function ( transition ) {
		transitionManager.transitions.push( transition );

		if ( !this.running ) {
			this.running = true;
			this.next();
		}
	},

	next: function () {
		transitionManager.running = false;

		var now = window.performance.now();
		var i = transitionManager.transitions.length;

		while ( i-- ) {
			var transition = transitionManager.transitions[i];

			if ( transition.program && now >= transition.program.end ) {
				transition.done();
			}

			if ( transition.pending && now >= transition.pending.start ) {
				transition.start( transition.pending );
			}

			if ( transition.running ) {
				transition.update( now );
				transitionManager.running = true;
			} else if ( !transition.pending ) {
				transitionManager.transitions.splice( i, 1 );
			}
		}

		if ( transitionManager.running ) {
			requestAnimationFrame( transitionManager.next );
		}
	}
};

function differs ( a, b ) {
	return ( a !== b ) || ( a && ( typeof a === 'object' ) || ( typeof a === 'function' ) );
}

function dispatchObservers ( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) continue;

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( differs( newValue, oldValue ) ) {
			var callbacks = group[ key ];
			if ( !callbacks ) continue;

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) continue;

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}
}

function get ( key ) {
	return key ? this._state[ key ] : this._state;
}

function fire ( eventName, data ) {
	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
	if ( !handlers ) return;

	for ( var i = 0; i < handlers.length; i += 1 ) {
		handlers[i].call( this, data );
	}
}

function observe ( key, callback, options ) {
	var group = ( options && options.defer ) ? this._observers.post : this._observers.pre;

	( group[ key ] || ( group[ key ] = [] ) ).push( callback );

	if ( !options || options.init !== false ) {
		callback.__calling = true;
		callback.call( this, this._state[ key ] );
		callback.__calling = false;
	}

	return {
		cancel: function () {
			var index = group[ key ].indexOf( callback );
			if ( ~index ) group[ key ].splice( index, 1 );
		}
	};
}

function on ( eventName, handler ) {
	if ( eventName === 'teardown' ) return this.on( 'destroy', handler );

	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
	handlers.push( handler );

	return {
		cancel: function () {
			var index = handlers.indexOf( handler );
			if ( ~index ) handlers.splice( index, 1 );
		}
	};
}

function set ( newState ) {
	this._set( assign( {}, newState ) );
	this._root._flush();
}

function _flush () {
	if ( !this._renderHooks ) return;

	while ( this._renderHooks.length ) {
		this._renderHooks.pop()();
	}
}

var proto = {
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	_flush: _flush
};

function create_main_fragment ( state, component ) {
	var text_1_value;

	var each_block_value = state.comments;

	var each_block_iterations = [];

	for ( var i = 0; i < each_block_value.length; i += 1 ) {
		each_block_iterations[i] = create_each_block( state, each_block_value, each_block_value[i], i, component );
	}

	var text = createText( "\n\n" );
	var p = createElement( 'p' );
	var text_1 = createText( text_1_value = state.foo );
	appendNode( text_1, p );

	return {
		mount: function ( target, anchor ) {
			for ( var i = 0; i < each_block_iterations.length; i += 1 ) {
				each_block_iterations[i].mount( target, null );
			}

			insertNode( text, target, anchor );
			insertNode( p, target, anchor );
		},

		update: function ( changed, state ) {
			var each_block_value = state.comments;

			if ( 'comments' in changed || 'elapsed' in changed || 'time' in changed ) {
				for ( var i = 0; i < each_block_value.length; i += 1 ) {
					if ( each_block_iterations[i] ) {
						each_block_iterations[i].update( changed, state, each_block_value, each_block_value[i], i );
					} else {
						each_block_iterations[i] = create_each_block( state, each_block_value, each_block_value[i], i, component );
						each_block_iterations[i].mount( text.parentNode, text );
					}
				}

				destroyEach( each_block_iterations, true, each_block_value.length );
				each_block_iterations.length = each_block_value.length;
			}

			if ( text_1_value !== ( text_1_value = state.foo ) ) {
				text_1.data = text_1_value;
			}
		},

		destroy: function ( detach ) {
			destroyEach( each_block_iterations, detach, 0 );

			if ( detach ) {
				detachNode( text );
				detachNode( p );
			}
		}
	};
}

function create_each_block ( state, each_block_value, comment, i, component ) {
	var text_value, text_2_value, text_4_value;

	var div = createElement( 'div' );
	div.className = "comment";
	var strong = createElement( 'strong' );
	appendNode( strong, div );
	var text = createText( text_value = i );
	appendNode( text, strong );
	appendNode( createText( "\n\n\t\t" ), div );
	var span = createElement( 'span' );
	appendNode( span, div );
	span.className = "meta";
	var text_2 = createText( text_2_value = comment.author );
	appendNode( text_2, span );
	appendNode( createText( " wrote " ), span );
	var text_4 = createText( text_4_value = state.elapsed(comment.time, state.time) );
	appendNode( text_4, span );
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

		update: function ( changed, state, each_block_value, comment, i ) {
			if ( text_value !== ( text_value = i ) ) {
				text.data = text_value;
			}

			if ( text_2_value !== ( text_2_value = comment.author ) ) {
				text_2.data = text_2_value;
			}

			if ( text_4_value !== ( text_4_value = state.elapsed(comment.time, state.time) ) ) {
				text_4.data = text_4_value;
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
