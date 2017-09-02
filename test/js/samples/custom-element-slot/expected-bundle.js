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

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = this.get = noop;

	if (detach !== false) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = this._state = null;
}

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, changed, newState, oldState) {
	for (var key in group) {
		if (!changed[key]) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

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
	if (this._root._lock) return;
	this._root._lock = true;
	callAll(this._root._beforecreate);
	callAll(this._root._oncreate);
	callAll(this._root._aftercreate);
	this._root._lock = false;
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign({}, oldState, newState);
	this._recompute(changed, this._state, oldState, false);
	if (this._bind) this._bind(changed, this._state);
	dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
	this._fragment.update(changed, this._state);
	dispatchObservers(this, this._observers.post, changed, this._state, oldState);
}

function callAll(fns) {
	while (fns && fns.length) fns.pop()();
}

var proto = {
	destroy: destroy,
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	teardown: destroy,
	_recompute: noop,
	_set: _set
};

function create_main_fragment ( state, component ) {
	var div, slot, p, text, text_2, slot_1, p_1, text_3;

	return {
		create: function () {
			div = createElement( 'div' );
			slot = createElement( 'slot' );
			p = createElement( 'p' );
			text = createText( "default fallback content" );
			text_2 = createText( "\n\n\t" );
			slot_1 = createElement( 'slot' );
			p_1 = createElement( 'p' );
			text_3 = createText( "foo fallback content" );
			this.hydrate();
		},

		hydrate: function ( nodes ) {
			setAttribute( slot_1, 'name', "foo" );
		},

		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
			appendNode( slot, div );
			appendNode( p, slot );
			appendNode( text, p );
			appendNode( text_2, div );
			appendNode( slot_1, div );
			appendNode( p_1, slot_1 );
			appendNode( text_3, p_1 );
		},

		update: noop,

		unmount: function () {
			detachNode( div );
		},

		destroy: noop
	};
}

class SvelteComponent extends HTMLElement {
	constructor(options = {}) {
		super();
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

		this.attachShadow({ mode: 'open' });

		this._fragment = create_main_fragment( this._state, this );

		if ( !options._root ) {
			this._fragment.create();
			this._fragment.mount( this.shadowRoot, null );
		}
	}

	static get observedAttributes() {
		return [];
	}



	attributeChangedCallback ( attr, oldValue, newValue ) {
		this.set({ [attr]: newValue });
	}
}

customElements.define('custom-element', SvelteComponent);

assign( SvelteComponent.prototype, proto );

export default SvelteComponent;
