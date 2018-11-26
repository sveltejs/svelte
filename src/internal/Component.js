import { add_render_callback, flush, intro, schedule_update } from './scheduler.js';
import { current_component, set_current_component } from './lifecycle.js'
import { is_function, run, run_all, noop } from './utils.js';
import { blankObject } from './utils.js';
import { children } from './dom.js';

export function bind(component, name, callback) {
	component.$$.bound[name] = callback;
	callback(component.$$.get()[name]);
}

export function mount_component({ $$: { fragment }}, target, anchor, hydrate) {
	if (hydrate) {
		fragment.l(children(target));
		fragment.m(target, anchor); // TODO can we avoid moving DOM?
	} else {
		fragment.c();
		fragment[fragment.i ? 'i' : 'm'](target, anchor);
	}

	component.$$.inject_refs(component.$$.refs);

	// onMount happens after the initial afterUpdate. Because
	// afterUpdate callbacks happen in reverse order (inner first)
	// we schedule onMount callbacks before afterUpdate callbacks
	add_render_callback(() => {
		const onDestroy = component.$$.on_mount.map(run).filter(is_function);
		if (component.$$.on_destroy) {
			component.$$.on_destroy.push(...onDestroy);
		} else {
			// Edge case — component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(onDestroy);
		}
		component.$$.on_mount = [];
	});

	component.$$.after_render.forEach(add_render_callback);
}

function destroy(component, detach) {
	if (component.$$) {
		run_all(component.$$.on_destroy);
		component.$$.fragment.d(detach);

		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		component.$$.on_destroy = component.$$.fragment = null;
		component.$$.get = () => ({});
	}
}

function make_dirty(component, key) {
	if (!component.$$.dirty) {
		schedule_update(component);
		component.$$.dirty = {};
	}
	component.$$.dirty[key] = true;
}

export class $$Component {
	constructor(options, init, create_fragment, not_equal) {
		const previous_component = current_component;
		set_current_component(this);

		this.$$ = {
			fragment: null,

			// state
			get: null,
			set: noop,
			inject_refs: noop,
			not_equal,
			bound: blankObject(),

			// lifecycle
			on_mount: [],
			on_destroy: [],
			before_render: [],
			after_render: [],

			// everything else
			callbacks: blankObject(),
			slotted: options.slots || {},
			refs: {},
			dirty: null,
			binding_groups: []
		};

		init(this, key => {
			make_dirty(this, key);
			if (this.$$.bound[key]) this.$$.bound[key](this.$$.get()[key]);
		});

		if (options.props) {
			this.$$.set(options.props);
		}

		run_all(this.$$.before_render);
		this.$$.fragment = create_fragment(this, this.$$.get());

		if (options.target) {
			intro.enabled = !!options.intro;
			mount_component(this, options.target, options.anchor, options.hydrate);
			flush();
			intro.enabled = true;
		}

		set_current_component(previous_component);
	}

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

	$set(values) {
		if (this.$$) {
			const state = this.$$.get();
			this.$$.set(values);
			for (const key in values) {
				if (this.$$.not_equal(state[key], values[key])) make_dirty(this, key);
			}
		}
	}
}

export class $$ComponentDev extends $$Component {
	constructor(options) {
		if (!options || (!options.target && !options.$$inline)) {
			throw new Error(`'target' is a required option`);
		}

		super(...arguments);
		this.$$checkProps();
	}

	$destroy() {
		super.$destroy();
		this.$destroy = () => {
			console.warn(`Component was already destroyed`);
		};
	}

	$$checkProps() {
		// noop by default
	}
}