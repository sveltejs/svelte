import { schedule_update, flush } from './scheduler';

export class SvelteComponent {
	constructor(options) {
		this.$$get_state = this.$$init(
			fn => this.$$inject_props = fn,
			fn => this.$$inject_refs = fn,
			key => this.$$make_dirty(key)
		);

		this.$$dirty = null;

		if (options.props) {
			this.$$inject_props(options.props);
		}

		this.$$fragment = this.$$create_fragment(this, this.$$get_state());

		if (options.target) {
			this.$$mount(options.target);
			flush();
		}
	}

	$on(eventName, callback) {

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
	}

	$$set(key, value) {
		this.$$inject_props({ [key]: value });
		this.$$make_dirty(key);
	}

	$$update() {
		this.$$fragment.p(this.$$dirty, this.$$get_state());
		this.$$dirty = null;
	}

	$$destroy(detach) {
		this.$$fragment.d(detach);
	}
}