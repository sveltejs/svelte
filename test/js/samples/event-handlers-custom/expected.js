import { appendNode, assign, createElement, createText, detachNode, dispatchObservers, insertNode, noop, proto } from "svelte/shared.js";

var template = (function () {
	return {
		methods: {
			foo ( bar ) {
				console.log( bar );
			}
		},
		events: {
			foo ( node, callback ) {
				// code goes here
			}
		}
	};
}());

function create_main_fragment ( root, component ) {
	var button = createElement( 'button' );

	var foo_handler = template.events.foo.call( component, button, function ( event ) {
		var root = component.get();
		component.foo( root.bar );
	});

	appendNode( createText( "foo" ), button );

	return {
		mount: function ( target, anchor ) {
			insertNode( button, target, anchor );
		},

		update: noop,

		destroy: function ( detach ) {
			foo_handler.teardown();

			if ( detach ) {
				detachNode( button );
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

assign( SvelteComponent.prototype, template.methods, proto );

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