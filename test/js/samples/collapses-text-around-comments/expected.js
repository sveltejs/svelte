import { appendNode, assign, createElement, createText, detachNode, insertNode, noop, proto, setAttribute } from "svelte/shared.js";

var template = (function() {
	return {
		data: function () {
			return { foo: 42 }
		}
	};
}());

function encapsulateStyles(node) {
	setAttribute(node, "svelte-3590263702", "");
}

function add_css() {
	var style = createElement("style");
	style.id = 'svelte-3590263702-style';
	style.textContent = "p[svelte-3590263702],[svelte-3590263702] p{color:red}";
	appendNode(style, document.head);
}

function create_main_fragment(state, component) {
	var p, text;

	return {
		create: function() {
			p = createElement("p");
			text = createText(state.foo);
			this.hydrate();
		},

		hydrate: function(nodes) {
			encapsulateStyles(p);
		},

		mount: function(target, anchor) {
			insertNode(p, target, anchor);
			appendNode(text, p);
		},

		update: function(changed, state) {
			if ( changed.foo ) {
				text.data = state.foo;
			}
		},

		unmount: function() {
			detachNode(p);
		},

		destroy: noop
	};
}

function SvelteComponent(options) {
	this.options = options;
	this._state = assign(template.data(), options.data);

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root || this;
	this._yield = options._yield;
	this._bind = options._bind;

	if (!document.getElementById("svelte-3590263702-style")) add_css();

	this._fragment = create_main_fragment(this._state, this);

	if (options.target) {
		this._fragment.create();
		this._fragment.mount(options.target, options.anchor || null);
	}
}

assign(SvelteComponent.prototype, proto );

export default SvelteComponent;