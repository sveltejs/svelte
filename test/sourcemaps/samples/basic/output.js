function renderMainFragment ( root, component ) {
	var last_text = root.foo.bar.baz
	var text = createText( last_text );

	return {
		mount: function ( target, anchor ) {
			insertNode( text, target, anchor );
		},
		
		update: function ( changed, root ) {
			var __tmp;
		
			if ( ( __tmp = root.foo.bar.baz ) !== last_text ) {
				text.data = last_text = __tmp;
			}
		},
		
		teardown: function ( detach ) {
			if ( detach ) {
				detachNode( text );
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
	
	this._fragment = renderMainFragment( this._state, this );
	if ( options.target ) this._fragment.mount( options.target, null );
}

SvelteComponent.prototype.get = function get(key) {
     return key ? this._state[key] : this._state;
   };

SvelteComponent.prototype.fire = function fire(eventName, data) {
     var handlers = eventName in this._handlers && this._handlers[eventName].slice();
     if (!handlers) return;
 
     for (var i = 0; i < handlers.length; i += 1) {
       handlers[i].call(this, data);
     }
   };

SvelteComponent.prototype.observe = function observe(key, callback, options) {
     var group = options && options.defer ? this._observers.pre : this._observers.post;
 
     (group[key] || (group[key] = [])).push(callback);
 
     if (!options || options.init !== false) {
       callback.__calling = true;
       callback.call(this, this._state[key]);
       callback.__calling = false;
     }
 
     return {
       cancel: function () {
         var index = group[key].indexOf(callback);
         if (~index) group[key].splice(index, 1);
       }
     };
   };

SvelteComponent.prototype.on = function on(eventName, handler) {
     var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
     handlers.push(handler);
 
     return {
       cancel: function () {
         var index = handlers.indexOf(handler);
         if (~index) handlers.splice(index, 1);
       }
     };
   };

SvelteComponent.prototype.set = function set(newState) {
     this._set(newState);
     (this._root || this)._flush();
   };

SvelteComponent.prototype._flush = function _flush() {
     if (!this._renderHooks) return;
 
     while (this._renderHooks.length) {
       var hook = this._renderHooks.pop();
       hook.fn.call(hook.context);
     }
   };

SvelteComponent.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = Object.assign( {}, oldState, newState );
	
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) this._fragment.update( newState, this._state );
	dispatchObservers( this, this._observers.post, newState, oldState );
};

SvelteComponent.prototype.teardown = SvelteComponent.prototype.destroy = function destroy ( detach ) {
	this.fire( 'teardown' );

	this._fragment.teardown( detach !== false );
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

function createText(data) {
    return document.createTextNode(data);
  }

function insertNode(node, target, anchor) {
    target.insertBefore(node, anchor);
  }

function detachNode(node) {
    node.parentNode.removeChild(node);
  }

function dispatchObservers(component, group, newState, oldState) {
    for (var key in group) {
      if (!(key in newState)) continue;

      var newValue = newState[key];
      var oldValue = oldState[key];

      if (newValue === oldValue && typeof newValue !== 'object') continue;

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

export default SvelteComponent;
//# sourceMappingURL=output.js.map