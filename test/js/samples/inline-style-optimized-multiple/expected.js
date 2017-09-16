import { assign, createElement, detachNode, insertNode, noop, proto, setStyle } from "svelte/shared.js";

function create_main_fragment(state, component) {
	var div;

	return {
		create: function() {
			div = createElement("div");
			this.hydrate();
		},

		hydrate: function(nodes) {
			setStyle(div, "color", state.color);
			setStyle(div, "transform", "translate(" + state.x + "px," + state.y + "px)");
		},

		mount: function(target, anchor) {
			insertNode(div, target, anchor);
		},

		update: function(changed, state) {
			if ( changed.color ) {
				setStyle(div, "color", state.color);
			}

			if ( changed.x || changed.y ) {
				setStyle(div, "transform", "translate(" + state.x + "px," + state.y + "px)");
			}
		},

		unmount: function() {
			detachNode(div);
		},

		destroy: noop
	};
}

function SvelteComponent(options) {
	this.options = options;
	this._state = options.data || {};

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root || this;
	this._yield = options._yield;
	this._bind = options._bind;

	this._fragment = create_main_fragment(this._state, this);

	if (options.target) {
		this._fragment.create();
		this._fragment.mount(options.target, options.anchor || null);
	}
}

assign(SvelteComponent.prototype, proto);

export default SvelteComponent;