import { schedule_update, flush } from './scheduler.js';
import { set_current_component } from './lifecycle.js'
import { run_all } from './utils.js';
import { blankObject } from './utils.js';

export class SvelteComponent {
	constructor(options) {
		this.$$onprops = [];
		this.$$onmount = [];
		this.$$onupdate = [];
		this.$$ondestroy = [];

		this.$$callbacks = blankObject();

		this.$$slotted = options.slots;

		set_current_component(this);
		const [get_state, inject_props, inject_refs] = this.$$init(
			key => this.$$make_dirty(key)
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
			this.$$mount(options.target);
			flush();
		}
	}

	$on(type, callback) {
		const callbacks = (this.$$callbacks[type] || (this.$$callbacks[type] = []));
		callbacks.push(callback);

		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	$destroy() {
		this.$$destroy(true);
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
		this.$$fragment.m(target, anchor);
		this.$$.inject_refs(this.$$refs);

		const ondestroy = this.$$onmount.map(fn => fn()).filter(Boolean);
		this.$$ondestroy.push(...ondestroy);
		this.$$onmount = [];
	}

	$set(values) {
		if (this.$$) {
			this.$$.inject_props(values);
			run_all(this.$$onprops);

			for (const key in values) this.$$make_dirty(key);
		}
	}

	$$update() {
		this.$$fragment.p(this.$$dirty, this.$$.get_state());
		this.$$.inject_refs(this.$$refs);
		run_all(this.$$onupdate);
		this.$$dirty = null;
	}

	$$destroy(detach) {
		if (this.$$) {
			this.$$fragment.d(detach);
			run_all(this.$$ondestroy);

			// TODO null out other refs
			this.$$ondestroy = this.$$fragment = this.$$ = null;
		}
	}
}