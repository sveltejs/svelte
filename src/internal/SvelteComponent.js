import { schedule_update, flush } from './scheduler';

export class SvelteComponent {
	constructor(options) {
		this.__get_state = this.__init(
			fn => this.__inject_props = fn,
			fn => this.__inject_refs = fn,
			key => this.__make_dirty(key)
		);

		this.__dirty = null;

		if (options.props) {
			this.__inject_props(options.props);
		}

		if (options.target) {
			this.__mount(options.target);
			flush();
		}
	}

	$on(eventName, callback) {

	}

	$destroy() {
		this.__destroy(true);
	}

	__make_dirty(key) {
		if (!this.__dirty) {
			schedule_update(this);
			this.__dirty = {};
		}
		this.__dirty[key] = true;
	}

	__mount(target, anchor) {
		this.__fragment = this.__create_fragment(this.__get_state());
		this.__fragment.c();
		this.__fragment.m(target, anchor);
	}

	__set(key, value) {
		this.__inject_props({ [key]: value });
		this.__make_dirty(key);
	}

	__update() {
		this.__fragment.p(this.__dirty, this.__get_state());
		this.__dirty = null;
	}

	__destroy(detach) {
		this.__fragment.d(detach);
	}
}