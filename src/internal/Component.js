import { add_render_callback, flush, intro, schedule_update } from './scheduler.js';
import { set_current_component } from './lifecycle.js'
import { is_function, run, run_all, noop } from './utils.js';
import { blankObject } from './utils.js';
import { children } from './dom.js';

export class $$Component {
	constructor(options, init, create_fragment, not_equal) {
		this.$$beforeRender = [];
		this.$$onMount = [];
		this.$$afterRender = [];
		this.$$onDestroy = [];

		this.$$bindings = blankObject();
		this.$$callbacks = blankObject();
		this.$$slotted = options.slots || {};

		set_current_component(this);
		const [get_state, inject_props, inject_refs] = init(
			this,
			key => {
				this.$$make_dirty(key);
				if (this.$$bindings[key]) this.$$bindings[key](get_state()[key]);
			}
		);

		this.$$ = { get_state, inject_props, inject_refs, not_equal };

		this.$$refs = {};

		this.$$dirty = null;
		this.$$bindingGroups = []; // TODO find a way to not have this here?

		if (options.props) {
			this.$$.inject_props(options.props);
		}

		run_all(this.$$beforeRender);
		this.$$fragment = create_fragment(this, this.$$.get_state());

		if (options.target) {
			intro.enabled = !!options.intro;
			this.$$mount(options.target, options.anchor, options.hydrate);

			flush();
			intro.enabled = true;
		}
	}

	$destroy() {
		this.$$destroy(true);
		this.$$update = this.$$destroy = noop;
	}

	$on(type, callback) {
		const callbacks = (this.$$callbacks[type] || (this.$$callbacks[type] = []));
		callbacks.push(callback);

		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	$set(values) {
		if (this.$$) {
			const state = this.$$.get_state();
			this.$$.inject_props(values);
			for (const key in values) {
				if (this.$$.not_equal(state[key], values[key])) this.$$make_dirty(key);
			}
		}
	}

	$$bind(name, callback) {
		this.$$bindings[name] = callback;
		callback(this.$$.get_state()[name]);
	}

	$$destroy(detach) {
		if (this.$$) {
			run_all(this.$$onDestroy);
			this.$$fragment.d(detach);

			// TODO null out other refs, including this.$$ (but need to
			// preserve final state?)
			this.$$onDestroy = this.$$fragment = null;
			this.$$.get_state = () => ({});
		}
	}

	$$make_dirty(key) {
		if (!this.$$dirty) {
			schedule_update(this);
			this.$$dirty = {};
		}
		this.$$dirty[key] = true;
	}

	$$mount(target, anchor, hydrate) {
		if (hydrate) {
			this.$$fragment.l(children(target));
			this.$$fragment.m(target, anchor); // TODO can we avoid moving DOM?
		} else {
			this.$$fragment.c();
			this.$$fragment[this.$$fragment.i ? 'i' : 'm'](target, anchor);
		}

		this.$$.inject_refs(this.$$refs);

		// onMount happens after the initial afterRender. Because
		// afterRender callbacks happen in reverse order (inner first)
		// we schedule onMount callbacks before afterRender callbacks
		add_render_callback(() => {
			const onDestroy = this.$$onMount.map(run).filter(is_function);
			if (this.$$onDestroy) {
				this.$$onDestroy.push(...onDestroy);
			} else {
				// Edge case — component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(onDestroy);
			}
			this.$$onMount = [];
		});

		this.$$afterRender.forEach(add_render_callback);
	}

	$$update() {
		run_all(this.$$beforeRender);
		this.$$fragment.p(this.$$dirty, this.$$.get_state());
		this.$$.inject_refs(this.$$refs);
		this.$$dirty = null;

		this.$$afterRender.forEach(add_render_callback);
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
		this.$$destroy = () => {
			console.warn(`Component was already destroyed`);
		};
	}

	$$checkProps() {
		// noop by default
	}
}