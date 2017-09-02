import { appendNode, assign, createElement, createText, detachNode, insertNode, noop, proto, setAttribute } from "svelte/shared.js";

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