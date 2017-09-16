import { appendNode, assign, createElement, detachNode, insertNode, noop, proto, setAttribute } from "svelte/shared.js";

function encapsulateStyles(node) {
	setAttribute(node, "svelte-2363328337", "");
}

function add_css() {
	var style = createElement("style");
	style.id = 'svelte-2363328337-style';
	style.textContent = "@media(min-width: 1px){div[svelte-2363328337],[svelte-2363328337] div{color:red}}";
	appendNode(style, document.head);
}

function create_main_fragment(state, component) {
	var div;

	return {
		create: function() {
			div = createElement("div");
			this.hydrate();
		},

		hydrate: function(nodes) {
			encapsulateStyles(div);
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

	if (!document.getElementById("svelte-2363328337-style")) add_css();

	this._fragment = create_main_fragment(this._state, this);

	if (options.target) {
		this._fragment.create();
		this._fragment.mount(options.target, options.anchor || null);
	}
}

assign(SvelteComponent.prototype, proto);

export default SvelteComponent;