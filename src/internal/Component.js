import { schedule_update, flush, intro } from './scheduler.js';
import { set_current_component } from './lifecycle.js'
import { run_all } from './utils.js';
import { blankObject } from './utils.js';

export class $$Component {
	constructor(options) {
		this.$$onprops = [];
		this.$$onmount = [];
		this.$$onupdate = [];
		this.$$ondestroy = [];

		this.$$bindings = blankObject();
		this.$$callbacks = blankObject();
		this.$$slotted = options.slots;

		set_current_component(this);
		const [get_state, inject_props, inject_refs] = this.$$init(
			key => {
				this.$$make_dirty(key);
				if (this.$$bindings[key]) this.$$bindings[key](get_state()[key]);
			}
		);

		this.$$ = { get_state, inject_props, inject_refs };

		this.$$refs = {};

		this.$$dirty = null;
		this.$$bindingGroups = []; // TODO find a way to not have this here?

		if (options.props) {
			this.$$.inject_props(options.props);
		}

		this.$$fragment = this.$$create_fragment(this, this.$$.get_state());

		if (options.target) {
			intro.enabled = !!options.intro;
			this.$$mount(options.target);
			flush();
			intro.enabled = true;
		}
	}

	$destroy() {
		this.$$destroy(true);
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
			this.$$.inject_props(values);
			run_all(this.$$onprops); // TODO should this be deferred until the update?

			for (const key in values) this.$$make_dirty(key);
		}
	}

	$$bind(name, callback) {
		this.$$bindings[name] = callback;
		callback(this.$$.get_state()[name]);
	}

	$$destroy(detach) {
		if (this.$$) {
			this.$$fragment.d(detach);
			run_all(this.$$ondestroy);

			// TODO null out other refs
			this.$$ondestroy = this.$$fragment = this.$$ = null;
		}
	}

	$$make_dirty(key) {
		if (!this.$$dirty) {
			schedule_update(this);
			this.$$dirty = {};
		}
		this.$$dirty[key] = true;
	}

	$$mount(target, anchor) {
		this.$$fragment.c();
		this.$$fragment[this.$$fragment.i ? 'i' : 'm'](target, anchor);
		this.$$.inject_refs(this.$$refs);

		const ondestroy = this.$$onmount.map(fn => fn()).filter(Boolean);
		this.$$ondestroy.push(...ondestroy);
		this.$$onmount = [];
	}

	$$update() {
		this.$$fragment.p(this.$$dirty, this.$$.get_state());
		this.$$.inject_refs(this.$$refs);
		run_all(this.$$onupdate);
		this.$$dirty = null;
	}
}

export class $$ComponentDev extends $$Component {
	constructor(options) {
		if (!options || !options.target) {
			throw new Error(`'target' is a required option`);
		}

		super(options);
	}
}