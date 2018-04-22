import { Base } from './Base.js';
import { assign, callAll, noop } from './utils.js';

export class Component extends Base {
	constructor(options) {
		super();
		this._init(options);
	}

	destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = this.get = noop;

		if (detach !== false) this._fragment.u();
		this._fragment.d();
		this._fragment = this._state = null;
	}

	set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		this.root._lock = true;
		callAll(this.root._beforecreate);
		callAll(this.root._oncreate);
		callAll(this.root._aftercreate);
		this.root._lock = false;
	}

	_init(options) {
		this._bind = options._bind;
		this._slotted = options.slots || {};

		this.options = options;
		this.root = options.root || this;
		this.store = this.root.store || options.store;

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this.refs = {};
		this.slots = {};
	}

	_set(newState) {
		const previous = this._state;
		const changed = {};
		let dirty = false;

		for (var key in newState) {
			if (this._differs(newState[key], previous[key])) changed[key] = dirty = 1;
		}

		if (!dirty) return;

		this._state = assign(assign({}, previous), newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

		if (this._fragment) {
			this.fire("state", { changed, current: this._state, previous });
			this._fragment.p(changed, this._state);
			this.fire("update", { changed, current: this._state, previous });
		}
	}

	_mount(target, anchor) {
		this._fragment[this._fragment.i ? 'i' : 'm'](target, anchor || null);
	}

	_recompute() {}

	_unmount() {
		if (this._fragment) this._fragment.u();
	}
}

export class ComponentDev extends Component {
	constructor(options) {
		if (!options || (!options.target && !options.root)) {
			throw new Error(`'target' is a required option`);
		}

		super(options);
	}

	destroy(detach) {
		super.destroy(detach);
		this.destroy = () => {
			console.warn('Component was already destroyed');
		};
	}

	set(newState) {
		if (typeof newState !== 'object') {
			throw new Error(`${this._debugName}.set was called without an object of data key-values to update.`);
		}

		this._checkReadOnly(newState);
		super.set(newState);
	}

	_checkReadOnly() {}
}