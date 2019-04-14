import { add_render_callback, flush, schedule_update, dirty_components } from './scheduler.js';
import { current_component, set_current_component } from './lifecycle.js';
import { blank_object, is_function, run, run_all, noop } from './utils.js';
import { children } from './dom.js';

export function bind(component, name, callback) {
	if (component.$$.props.indexOf(name) === -1) return;
	component.$$.bound[name] = callback;
	callback(component.$$.ctx[name]);
}

export function mount_component(component, target, anchor) {
	const { fragment, on_mount, on_destroy, after_render } = component.$$;

	fragment.m(target, anchor);

	// onMount happens after the initial afterUpdate. Because
	// afterUpdate callbacks happen in reverse order (inner first)
	// we schedule onMount callbacks before afterUpdate callbacks
	add_render_callback(() => {
		const new_on_destroy = on_mount.map(run).filter(is_function);
		if (on_destroy) {
			on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});

	after_render.forEach(add_render_callback);
}

function destroy(component, detaching) {
	if (component.$$) {
		run_all(component.$$.on_destroy);
		component.$$.fragment.d(detaching);

		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		component.$$.on_destroy = component.$$.fragment = null;
		component.$$.ctx = {};
	}
}

function make_dirty(component, key) {
	if (!component.$$.dirty) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty = {};
	}
	component.$$.dirty[key] = true;
}

export function init(component, options, instance, create_fragment, not_equal, prop_names) {
	const parent_component = current_component;
	set_current_component(component);

	const props = options.props || {};

	const $$ = component.$$ = {
		fragment: null,
		ctx: null,

		// state
		props: prop_names,
		update: noop,
		not_equal,
		bound: blank_object(),

		// lifecycle
		on_mount: [],
		on_destroy: [],
		before_render: [],
		after_render: [],
		context: new Map(parent_component ? parent_component.$$.context : []),

		// everything else
		callbacks: blank_object(),
		dirty: null
	};

	let ready = false;

	$$.ctx = instance
		? instance(component, props, (key, value) => {
			if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
				if ($$.bound[key]) $$.bound[key](value);
				if (ready) make_dirty(component, key);
			}
		})
		: props;

	$$.update();
	ready = true;
	run_all($$.before_render);
	$$.fragment = create_fragment($$.ctx);

	if (options.target) {
		if (options.hydrate) {
			$$.fragment.l(children(options.target));
		} else {
			$$.fragment.c();
		}

		if (options.intro && component.$$.fragment.i) component.$$.fragment.i();
		mount_component(component, options.target, options.anchor);
		flush();
	}

	set_current_component(parent_component);
}

export let SvelteElement;
if (typeof HTMLElement !== 'undefined') {
	SvelteElement = class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
		}

		connectedCallback() {
			for (const key in this.$$.slotted) {
				this.appendChild(this.$$.slotted[key]);
			}
		}

		attributeChangedCallback(attr, oldValue, newValue) {
			this[attr] = newValue;
		}

		$destroy() {
			destroy(this, true);
			this.$destroy = noop;
		}

		$on(type, callback) {
			// TODO should this delegate to addEventListener?
			const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
			callbacks.push(callback);

			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		$set() {
			// overridden by instance, if it has props
		}
	};
}

export class SvelteComponent {
	$destroy() {
		destroy(this, true);
		this.$destroy = noop;
	}

	$on(type, callback) {
		const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
		callbacks.push(callback);

		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	$set() {
		// overridden by instance, if it has props
	}
}

export class SvelteComponentDev extends SvelteComponent {
	constructor(options) {
		if (!options || (!options.target && !options.$$inline)) {
			throw new Error(`'target' is a required option`);
		}

		super();
	}

	$destroy() {
		super.$destroy();
		this.$destroy = () => {
			console.warn(`Component was already destroyed`); // eslint-disable-line no-console
		};
	}
}