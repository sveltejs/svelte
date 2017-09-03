import { appendNode, assign, createElement, createText, detachNode, insertNode, noop, proto } from "svelte/shared.js";

function create_main_fragment ( state, component ) {
	var h1, text, text_1, text_2;

	return {
		create: function () {
			h1 = createElement( 'h1' );
			text = createText( "Hello " );
			text_1 = createText( state.name );
			text_2 = createText( "!" );
		},

		mount: function ( target, anchor ) {
			insertNode( h1, target, anchor );
			appendNode( text, h1 );
			appendNode( text_1, h1 );
			appendNode( text_2, h1 );
		},

		update: function ( changed, state ) {
			if ( changed.name ) {
				text_1.data = state.name;
			}
		},

		unmount: function () {
			detachNode( h1 );
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
		return ["name"];
	}

	get name() {
		return this.get('name');
	}

	set name(value) {
		this.set({ name: value });
	}

	attributeChangedCallback ( attr, oldValue, newValue ) {
		this.set({ [attr]: newValue });
	}
}

customElements.define('custom-element', SvelteComponent);
assign( SvelteComponent.prototype, proto , {
	_mount(target, anchor) {
		this._fragment.mount(this.shadowRoot, null);
		target.insertBefore(this, anchor);
	},

	_unmount() {
		this.parentNode.removeChild(this);
	}
});

export default SvelteComponent;