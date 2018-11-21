import { schedule_update, flush, intro } from './scheduler.js';
import { set_current_component } from './lifecycle.js'
import { run_all } from './utils.js';
import { blankObject } from './utils.js';

export class $$Component {
	constructor(options) {
		this.$$beforeRender = [];
		this.$$onMount = [];
		this.$$afterRender = [];
		this.$$onDestroy = [];

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
			run_all(this.$$onDestroy);

			// TODO null out other refs
			this.$$onDestroy = this.$$fragment = this.$$ = null;
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
		run_all(this.$$beforeRender);
		this.$$fragment.c();
		this.$$fragment[this.$$fragment.i ? 'i' : 'm'](target, anchor);
		this.$$.inject_refs(this.$$refs);

		const onDestroy = this.$$onMount.map(fn => fn()).filter(Boolean);
		this.$$onDestroy.push(...onDestroy);
		this.$$onMount = [];
	}

	$$update() {
		run_all(this.$$beforeRender);
		this.$$fragment.p(this.$$dirty, this.$$.get_state());
		this.$$.inject_refs(this.$$refs);
		run_all(this.$$afterRender);
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