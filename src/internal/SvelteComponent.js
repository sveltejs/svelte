import { schedule_update } from './scheduler';

export class SvelteComponent {
	constructor(options) {
		this.__get_state = this.__init(
			fn => this.__inject_props = fn
		);

		this.__dirty = null;

		if (options.props) {
			this.__inject_props(options.props);
		}

		if (options.target) {
			this.__mount(options.target);
		}
	}

	$on(eventName, callback) {

	}

	$destroy() {
		this.__destroy(true);
	}

	__make_dirty() {
		if (this.__dirty) return;
		this.__dirty = {};
		schedule_update(this);
	}

	__mount(target, anchor) {
		this.__fragment = this.__create_fragment(this.__get_state());
		this.__fragment.c();
		this.__fragment.m(target, anchor);
	}

	__set(key, value) {
		this.__inject_props({ [key]: value });
		this.__make_dirty();
		this.__dirty[key] = true;
	}

	__update() {
		this.__fragment.p(this.__dirty, this.__get_state());
		this.__dirty = null;
	}

	__destroy(detach) {
		this.__fragment.d(detach);
	}
}