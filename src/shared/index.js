import { assign } from './utils.js';
import { noop } from './utils.js';
export * from './dom.js';
export * from './keyed-each.js';
export * from './spread.js';
export * from './transitions.js';
export * from './utils.js';

export function blankObject() {
	return Object.create(null);
}

export class Base {
	constructor() {
		this._handlers = blankObject();
	}

	fire(eventName, data) {
		const handlers = eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (let i = 0; i < handlers.length; i += 1) {
			const handler = handlers[i];

			if (!handler.__calling) {
				handler.__calling = true;
				handler.call(this, data);
				handler.__calling = false;
			}
		}
	}

	get() {
		return this._state;
	}

	on(eventName, handler) {
		const handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function() {
				const index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	_differs(a, b) {
		return _differsImmutable(a, b) || ((a && typeof a === 'object') || typeof a === 'function');
	}
}

export class Component extends Base {
	constructor(options) {
		super();
		this._bind = options._bind;

		this.options = options;
		this.root = options.root || this;
		this.store = this.root.store || options.store;
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
}

export function _differsImmutable(a, b) {
	return a != a ? b == b : a !== b;
}

export function run(fn) {
	fn();
}

export function callAll(fns) {
	while (fns && fns.length) fns.shift()();
}

export function isPromise(value) {
	return value && typeof value.then === 'function';
}

export var PENDING = {};
export var SUCCESS = {};
export var FAILURE = {};

export function removeFromStore() {
	this.store._remove(this);
}