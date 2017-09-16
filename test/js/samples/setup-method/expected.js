import { assign, noop, proto } from "svelte/shared.js";

var template = (function() {
	return {
		methods: {
			foo ( bar ) {
				console.log( bar );
			}
		},
		setup: (Component) => {
			Component.SOME_CONSTANT = 42;
			Component.factory = function (target) {
				return new Component({
					target: target
				});
			}
			Component.prototype.foo( 'baz' );
		}
	};
}());

function create_main_fragment(state, component) {

	return {
		create: noop,

		mount: noop,

		update: noop,

		unmount: noop,

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

assign(SvelteComponent.prototype, template.methods, proto);

template.setup(SvelteComponent);

export default SvelteComponent;