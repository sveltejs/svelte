import { assign, children, claimElement, createElement, detachNode, insertNode, noop, proto } from "svelte/shared.js";

function create_main_fragment(state, component) {
	var div;

	return {
		create: function() {
			div = createElement("div");
			this.hydrate();
		},

		claim: function(nodes) {
			div = claimElement(nodes, "DIV", { "class": true }, false);
			var div_nodes = children(div);

			div_nodes.forEach(detachNode);
			this.hydrate();
		},

		hydrate: function(nodes) {
			div.className = "foo";
		},

		mount: function(target, anchor) {
			insertNode(div, target, anchor);
		},

		update: noop,

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
		var nodes = children(options.target);
		options.hydrate ? this._fragment.claim(nodes) : this._fragment.create();
		nodes.forEach(detachNode);
		this._fragment.mount(options.target, options.anchor || null);
	}
}

assign(SvelteComponent.prototype, proto );

export default SvelteComponent;