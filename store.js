import {
	assign,
	blankObject,
	differs,
	dispatchObservers,
	get,
	observe
} from './shared.js';

function Store(state) {
	this._observers = { pre: blankObject(), post: blankObject() };
	this._changeHandlers = [];
	this._dependents = [];

	this._proto = blankObject();
	this._changed = blankObject();
	this._dependentProps = blankObject();
	this._dirty = blankObject();
	this._state = Object.create(this._proto);

	for (var key in state) {
		this._changed[key] = true;
		this._state[key] = state[key];
	}
}

assign(Store.prototype, {
	get,
	observe
}, {
	_add: function(component, props) {
		this._dependents.push({
			component: component,
			props: props
		});
	},

	_makeDirty: function(prop) {
		var dependentProps = this._dependentProps[prop];
		if (dependentProps) {
			for (var i = 0; i < dependentProps.length; i += 1) {
				var dependentProp = dependentProps[i];
				this._dirty[dependentProp] = this._changed[dependentProp] = true;
				this._makeDirty(dependentProp);
			}
		}
	},

	_init: function(props) {
		var state = {};
		for (let i = 0; i < props.length; i += 1) {
			var prop = props[i];
			state['$' + prop] = this._state[prop];
		}
		return state;
	},

	_remove: function(component) {
		let i = this._dependents.length;
		while (i--) {
			if (this._dependents[i].component === component) {
				this._dependents.splice(i, 1);
				return;
			}
		}
	},

	compute: function(key, deps, fn) {
		var store = this;
		var value;

		store._dirty[key] = true;

		for (var i = 0; i < deps.length; i += 1) {
			var dep = deps[i];
			if (!this._dependentProps[dep]) this._dependentProps[dep] = [];
			this._dependentProps[dep].push(key);
		}

		Object.defineProperty(this._proto, key, {
			enumerable: true,
			get: function() {
				if (store._dirty[key]) {
					var values = deps.map(function(dep) {
						if (dep in store._changed) changed = true;
						return store._state[dep];
					});

					var newValue = fn.apply(null, values);

					if (differs(newValue, value)) {
						value = newValue;
						store._changed[key] = true;

						var dependentProps = store._dependentProps[key];
						if (dependentProps) {
							for (var i = 0; i < dependentProps.length; i += 1) {
								var prop = dependentProps[i];
								store._dirty[prop] = store._changed[prop] = true;
							}
						}
					}

					store._dirty[key] = false;
				}

				return value;
			},
			set: function() {
				throw new Error(`'${key}' is a read-only property`);
			}
		});
	},

	onchange: function(callback) {
		this._changeHandlers.push(callback);
		return {
			cancel: function() {
				var index = this._changeHandlers.indexOf(callback);
				if (~index) this._changeHandlers.splice(index, 1);
			}
		};
	},

	set: function(newState) {
		var oldState = this._state,
			changed = this._changed = {},
			dirty = false;

		for (var key in newState) {
			if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign(Object.create(this._proto), oldState, newState);

		for (var key in changed) this._makeDirty(key);

		for (var i = 0; i < this._changeHandlers.length; i += 1) {
			this._changeHandlers[i](this._state, changed);
		}

		dispatchObservers(this, this._observers.pre, changed, this._state, oldState);

		var dependents = this._dependents.slice(); // guard against mutations
		for (var i = 0; i < dependents.length; i += 1) {
			var dependent = dependents[i];
			var componentState = {};
			dirty = false;

			for (var j = 0; j < dependent.props.length; j += 1) {
				var prop = dependent.props[j];
				if (prop in changed) {
					componentState['$' + prop] = this._state[prop];
					dirty = true;
				}
			}

			if (dirty) dependent.component.set(componentState);
		}

		dispatchObservers(this, this._observers.post, changed, this._state, oldState);
	}
});

function combineStores(store, children) {
	var updates = {};

	for (const key in children) {
		const child = children[key];
		updates[key] = child.get();

		child.onchange(state => {
			var update = {};
			update[key] = state;
			store.set(update);
		});
	}

	console.log('updates', updates);

	store.set(updates);
	return store;
}

export { Store, combineStores };