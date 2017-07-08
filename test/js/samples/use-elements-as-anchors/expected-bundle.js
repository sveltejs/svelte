function noop() {}

function assign(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function createElement(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function createComment() {
	return document.createComment('');
}

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, newState, oldState) {
	for (var key in group) {
		if (!(key in newState)) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		if (differs(newValue, oldValue)) {
			var callbacks = group[key];
			if (!callbacks) continue;

			for (var i = 0; i < callbacks.length; i += 1) {
				var callback = callbacks[i];
				if (callback.__calling) continue;

				callback.__calling = true;
				callback.call(component, newValue, oldValue);
				callback.__calling = false;
			}
		}
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function observe(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	this._root._flush();
}

function callAll(fns) {
	while (fns && fns.length) fns.pop()();
}

function _flush() {
	callAll(this._oncreate);
	callAll(this._bindings);
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
	var div, text, p, text_1, text_2, text_3, text_4, p_1, text_5, text_6, text_8, if_block_4_anchor;

	var if_block = (state.a) && create_if_block( state, component );

	var if_block_1 = (state.b) && create_if_block_1( state, component );

	var if_block_2 = (state.c) && create_if_block_2( state, component );

	var if_block_3 = (state.d) && create_if_block_3( state, component );

	var if_block_4 = (state.e) && create_if_block_4( state, component );

	return {
		create: function () {
			div = createElement( 'div' );
			if ( if_block ) if_block.create();
			text = createText( "\n\n\t" );
			p = createElement( 'p' );
			text_1 = createText( "this can be used as an anchor" );
			text_2 = createText( "\n\n\t" );
			if ( if_block_1 ) if_block_1.create();
			text_3 = createText( "\n\n\t" );
			if ( if_block_2 ) if_block_2.create();
			text_4 = createText( "\n\n\t" );
			p_1 = createElement( 'p' );
			text_5 = createText( "so can this" );
			text_6 = createText( "\n\n\t" );
			if ( if_block_3 ) if_block_3.create();
			text_8 = createText( "\n\n" );
			if ( if_block_4 ) if_block_4.create();
			if_block_4_anchor = createComment();
		},

		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
			if ( if_block ) if_block.mount( div, null );
			appendNode( text, div );
			appendNode( p, div );
			appendNode( text_1, p );
			appendNode( text_2, div );
			if ( if_block_1 ) if_block_1.mount( div, null );
			appendNode( text_3, div );
			if ( if_block_2 ) if_block_2.mount( div, null );
			appendNode( text_4, div );
			appendNode( p_1, div );
			appendNode( text_5, p_1 );
			appendNode( text_6, div );
			if ( if_block_3 ) if_block_3.mount( div, null );
			insertNode( text_8, target, anchor );
			if ( if_block_4 ) if_block_4.mount( target, anchor );
			insertNode( if_block_4_anchor, target, anchor );
		},

		update: function ( changed, state ) {
			if ( state.a ) {
				if ( !if_block ) {
					if_block = create_if_block( state, component );
					if_block.create();
					if_block.mount( div, text );
				}
			} else if ( if_block ) {
				if_block.unmount();
				if_block.destroy();
				if_block = null;
			}

			if ( state.b ) {
				if ( !if_block_1 ) {
					if_block_1 = create_if_block_1( state, component );
					if_block_1.create();
					if_block_1.mount( div, text_3 );
				}
			} else if ( if_block_1 ) {
				if_block_1.unmount();
				if_block_1.destroy();
				if_block_1 = null;
			}

			if ( state.c ) {
				if ( !if_block_2 ) {
					if_block_2 = create_if_block_2( state, component );
					if_block_2.create();
					if_block_2.mount( div, text_4 );
				}
			} else if ( if_block_2 ) {
				if_block_2.unmount();
				if_block_2.destroy();
				if_block_2 = null;
			}

			if ( state.d ) {
				if ( !if_block_3 ) {
					if_block_3 = create_if_block_3( state, component );
					if_block_3.create();
					if_block_3.mount( div, null );
				}
			} else if ( if_block_3 ) {
				if_block_3.unmount();
				if_block_3.destroy();
				if_block_3 = null;
			}

			if ( state.e ) {
				if ( !if_block_4 ) {
					if_block_4 = create_if_block_4( state, component );
					if_block_4.create();
					if_block_4.mount( if_block_4_anchor.parentNode, if_block_4_anchor );
				}
			} else if ( if_block_4 ) {
				if_block_4.unmount();
				if_block_4.destroy();
				if_block_4 = null;
			}
		},

		unmount: function () {
			detachNode( div );
			if ( if_block ) if_block.unmount();
			if ( if_block_1 ) if_block_1.unmount();
			if ( if_block_2 ) if_block_2.unmount();
			if ( if_block_3 ) if_block_3.unmount();
			detachNode( text_8 );
			if ( if_block_4 ) if_block_4.unmount();
			detachNode( if_block_4_anchor );
		},

		destroy: function () {
			if ( if_block ) if_block.destroy();
			if ( if_block_1 ) if_block_1.destroy();
			if ( if_block_2 ) if_block_2.destroy();
			if ( if_block_3 ) if_block_3.destroy();
			if ( if_block_4 ) if_block_4.destroy();
		}
	};
}

function create_if_block ( state, component ) {
	var p, text;

	return {
		create: function () {
			p = createElement( 'p' );
			text = createText( "a" );
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
			text = createText( "b" );
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

function create_if_block_2 ( state, component ) {
	var p, text;

	return {
		create: function () {
			p = createElement( 'p' );
			text = createText( "c" );
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

function create_if_block_3 ( state, component ) {
	var p, text;

	return {
		create: function () {
			p = createElement( 'p' );
			text = createText( "d" );
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

function create_if_block_4 ( state, component ) {
	var p, text;

	return {
		create: function () {
			p = createElement( 'p' );
			text = createText( "e" );
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

SvelteComponent.prototype.teardown = SvelteComponent.prototype.destroy = function destroy ( detach ) {
	this.fire( 'destroy' );

	if ( detach !== false ) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

export default SvelteComponent;
