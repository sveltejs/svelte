import { appendNode, assign, createElement, createText, detachNode, insertNode, noop, proto } from "svelte/shared.js";

function create_main_fragment ( state, component ) {
	var div, text;

	return {
		create: function () {
			div = createElement( 'div' );
			text = createText( "I am shadow DOM" );
		},

		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
			appendNode( text, div );
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

		this._fragment = create_main_fragment( this._state, this );

		if ( !options._root ) {
			this._fragment.create();
			this._fragment.mount( this.attachShadow({ mode: 'open' }), null );
		}
	}
}

customElements.define('custom-element', SvelteComponent);

assign( SvelteComponent.prototype, proto );

export default SvelteComponent;