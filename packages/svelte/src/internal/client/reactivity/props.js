/** @import { Source } from './types.js' */
import { DEV } from 'esm-env';
import {
	PROPS_IS_BINDABLE,
	PROPS_IS_IMMUTABLE,
	PROPS_IS_LAZY_INITIAL,
	PROPS_IS_RUNES,
	PROPS_IS_UPDATED
} from '../../../constants.js';
import { get_descriptor, is_function } from '../../shared/utils.js';
import { mutable_source, set, source } from './sources.js';
import { derived, derived_safe_equal } from './deriveds.js';
import {
	active_effect,
	get,
	captured_signals,
	set_active_effect,
	untrack,
	update
} from '../runtime.js';
import { safe_equals } from './equality.js';
import * as e from '../errors.js';
import {
	BRANCH_EFFECT,
	LEGACY_DERIVED_PROP,
	LEGACY_PROPS,
	ROOT_EFFECT,
	STATE_SYMBOL
} from '../constants.js';
import { proxy } from '../proxy.js';
import { capture_store_binding } from './store.js';
import { legacy_mode_flag } from '../../flags/index.js';

/**
 * @param {((value?: number) => number)} fn
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update_prop(fn, d = 1) {
	const value = fn();
	fn(value + d);
	return value;
}

/**
 * @param {((value?: number) => number)} fn
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update_pre_prop(fn, d = 1) {
	const value = fn() + d;
	fn(value);
	return value;
}

/**
 * The proxy handler for rest props (i.e. `const { x, ...rest } = $props()`).
 * Is passed the full `$$props` object and excludes the named props.
 * @type {ProxyHandler<{ props: Record<string | symbol, unknown>, exclude: Array<string | symbol>, name?: string }>}}
 */
const rest_props_handler = {
	get(target, key) {
		if (target.exclude.includes(key)) return;
		return target.props[key];
	},
	set(target, key) {
		if (DEV) {
			// TODO should this happen in prod too?
			e.props_rest_readonly(`${target.name}.${String(key)}`);
		}

		return false;
	},
	getOwnPropertyDescriptor(target, key) {
		if (target.exclude.includes(key)) return;
		if (key in target.props) {
			return {
				enumerable: true,
				configurable: true,
				value: target.props[key]
			};
		}
	},
	has(target, key) {
		if (target.exclude.includes(key)) return false;
		return key in target.props;
	},
	ownKeys(target) {
		return Reflect.ownKeys(target.props).filter((key) => !target.exclude.includes(key));
	}
};

/**
 * @param {Record<string, unknown>} props
 * @param {string[]} exclude
 * @param {string} [name]
 * @returns {Record<string, unknown>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function rest_props(props, exclude, name) {
	return new Proxy(
		DEV ? { props, exclude, name, other: {}, to_proxy: [] } : { props, exclude },
		rest_props_handler
	);
}

/**
 * The proxy handler for legacy $$restProps and $$props
 * @type {ProxyHandler<{ props: Record<string | symbol, unknown>, exclude: Array<string | symbol>, special: Record<string | symbol, (v?: unknown) => unknown>, version: Source<number> }>}}
 */
const legacy_rest_props_handler = {
	get(target, key) {
		if (target.exclude.includes(key)) return;
		get(target.version);
		return key in target.special ? target.special[key]() : target.props[key];
	},
	set(target, key, value) {
		if (!(key in target.special)) {
			// Handle props that can temporarily get out of sync with the parent
			/** @type {Record<string, (v?: unknown) => unknown>} */
			target.special[key] = prop(
				{
					get [key]() {
						return target.props[key];
					}
				},
				/** @type {string} */ (key),
				PROPS_IS_UPDATED
			);
		}

		target.special[key](value);
		update(target.version); // $$props is coarse-grained: when $$props.x is updated, usages of $$props.y etc are also rerun
		return true;
	},
	getOwnPropertyDescriptor(target, key) {
		if (target.exclude.includes(key)) return;
		if (key in target.props) {
			return {
				enumerable: true,
				configurable: true,
				value: target.props[key]
			};
		}
	},
	deleteProperty(target, key) {
		// Svelte 4 allowed for deletions on $$restProps
		if (target.exclude.includes(key)) return true;
		target.exclude.push(key);
		update(target.version);
		return true;
	},
	has(target, key) {
		if (target.exclude.includes(key)) return false;
		return key in target.props;
	},
	ownKeys(target) {
		return Reflect.ownKeys(target.props).filter((key) => !target.exclude.includes(key));
	}
};

/**
 * @param {Record<string, unknown>} props
 * @param {string[]} exclude
 * @returns {Record<string, unknown>}
 */
export function legacy_rest_props(props, exclude) {
	return new Proxy({ props, exclude, special: {}, version: source(0) }, legacy_rest_props_handler);
}

/**
 * The proxy handler for spread props. Handles the incoming array of props
 * that looks like `() => { dynamic: props }, { static: prop }, ..` and wraps
 * them so that the whole thing is passed to the component as the `$$props` argument.
 * @template {Record<string | symbol, unknown>} T
 * @type {ProxyHandler<{ props: Array<T | (() => T)> }>}}
 */
const spread_props_handler = {
	get(target, key) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			if (typeof p === 'object' && p !== null && key in p) return p[key];
		}
	},
	set(target, key, value) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			const desc = get_descriptor(p, key);
			if (desc && desc.set) {
				desc.set(value);
				return true;
			}
		}
		return false;
	},
	getOwnPropertyDescriptor(target, key) {
		let i = target.props.length;
		while (i--) {
			let p = target.props[i];
			if (is_function(p)) p = p();
			if (typeof p === 'object' && p !== null && key in p) {
				const descriptor = get_descriptor(p, key);
				if (descriptor && !descriptor.configurable) {
					// Prevent a "Non-configurability Report Error": The target is an array, it does
					// not actually contain this property. If it is now described as non-configurable,
					// the proxy throws a validation error. Setting it to true avoids that.
					descriptor.configurable = true;
				}
				return descriptor;
			}
		}
	},
	has(target, key) {
		// To prevent a false positive `is_entry_props` in the `prop` function
		if (key === STATE_SYMBOL || key === LEGACY_PROPS) return false;

		for (let p of target.props) {
			if (is_function(p)) p = p();
			if (p != null && key in p) return true;
		}

		return false;
	},
	ownKeys(target) {
		/** @type {Array<string | symbol>} */
		const keys = [];

		for (let p of target.props) {
			if (is_function(p)) p = p();
			for (const key in p) {
				if (!keys.includes(key)) keys.push(key);
			}
		}

		return keys;
	}
};

/**
 * @param {Array<Record<string, unknown> | (() => Record<string, unknown>)>} props
 * @returns {any}
 */
export function spread_props(...props) {
	return new Proxy({ props }, spread_props_handler);
}

/**
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
function with_parent_branch(fn) {
	var effect = active_effect;
	var previous_effect = active_effect;

	while (effect !== null && (effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
		effect = effect.parent;
	}
	try {
		set_active_effect(effect);
		return fn();
	} finally {
		set_active_effect(previous_effect);
	}
}

/**
 * This function is responsible for synchronizing a possibly bound prop with the inner component state.
 * It is used whenever the compiler sees that the component writes to the prop, or when it has a default prop_value.
 * @template V
 * @param {Record<string, unknown>} props
 * @param {string} key
 * @param {number} flags
 * @param {V | (() => V)} [fallback]
 * @returns {(() => V | ((arg: V) => V) | ((arg: V, mutation: boolean) => V))}
 */
export function prop(props, key, flags, fallback) {
	var immutable = (flags & PROPS_IS_IMMUTABLE) !== 0;
	var runes = !legacy_mode_flag || (flags & PROPS_IS_RUNES) !== 0;
	var bindable = (flags & PROPS_IS_BINDABLE) !== 0;
	var lazy = (flags & PROPS_IS_LAZY_INITIAL) !== 0;
	var is_store_sub = false;
	var prop_value;

	if (bindable) {
		[prop_value, is_store_sub] = capture_store_binding(() => /** @type {V} */ (props[key]));
	} else {
		prop_value = /** @type {V} */ (props[key]);
	}

	// Can be the case when someone does `mount(Component, props)` with `let props = $state({...})`
	// or `createClassComponent(Component, props)`
	var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;

	var setter =
		(bindable &&
			(get_descriptor(props, key)?.set ??
				(is_entry_props && key in props && ((v) => (props[key] = v))))) ||
		undefined;

	var fallback_value = /** @type {V} */ (fallback);
	var fallback_dirty = true;
	var fallback_used = false;

	var get_fallback = () => {
		fallback_used = true;
		if (fallback_dirty) {
			fallback_dirty = false;
			if (lazy) {
				fallback_value = untrack(/** @type {() => V} */ (fallback));
			} else {
				fallback_value = /** @type {V} */ (fallback);
			}
		}

		return fallback_value;
	};

	if (prop_value === undefined && fallback !== undefined) {
		if (setter && runes) {
			e.props_invalid_value(key);
		}

		prop_value = get_fallback();
		if (setter) setter(prop_value);
	}

	/** @type {() => V} */
	var getter;
	if (runes) {
		getter = () => {
			var value = /** @type {V} */ (props[key]);
			if (value === undefined) return get_fallback();
			fallback_dirty = true;
			fallback_used = false;
			return value;
		};
	} else {
		// Svelte 4 did not trigger updates when a primitive value was updated to the same value.
		// Replicate that behavior through using a derived
		var derived_getter = with_parent_branch(() =>
			(immutable ? derived : derived_safe_equal)(() => /** @type {V} */ (props[key]))
		);
		derived_getter.f |= LEGACY_DERIVED_PROP;
		getter = () => {
			var value = get(derived_getter);
			if (value !== undefined) fallback_value = /** @type {V} */ (undefined);
			return value === undefined ? fallback_value : value;
		};
	}

	// easy mode — prop is never written to
	if ((flags & PROPS_IS_UPDATED) === 0) {
		return getter;
	}

	// intermediate mode — prop is written to, but the parent component had
	// `bind:foo` which means we can just call `$$props.foo = value` directly
	if (setter) {
		var legacy_parent = props.$$legacy;
		return function (/** @type {any} */ value, /** @type {boolean} */ mutation) {
			if (arguments.length > 0) {
				// We don't want to notify if the value was mutated and the parent is in runes mode.
				// In that case the state proxy (if it exists) should take care of the notification.
				// If the parent is not in runes mode, we need to notify on mutation, too, that the prop
				// has changed because the parent will not be able to detect the change otherwise.
				if (!runes || !mutation || legacy_parent || is_store_sub) {
					/** @type {Function} */ (setter)(mutation ? getter() : value);
				}
				return value;
			} else {
				return getter();
			}
		};
	}

	// hard mode. this is where it gets ugly — the value in the child should
	// synchronize with the parent, but it should also be possible to temporarily
	// set the value to something else locally.
	var from_child = false;
	var was_from_child = false;

	// The derived returns the current value. The underlying mutable
	// source is written to from various places to persist this value.
	var inner_current_value = mutable_source(prop_value);
	var current_value = with_parent_branch(() =>
		derived(() => {
			var parent_value = getter();
			var child_value = get(inner_current_value);

			if (from_child) {
				from_child = false;
				was_from_child = true;
				return child_value;
			}

			was_from_child = false;
			return (inner_current_value.v = parent_value);
		})
	);

	if (!immutable) current_value.equals = safe_equals;

	return function (/** @type {any} */ value, /** @type {boolean} */ mutation) {
		// legacy nonsense — need to ensure the source is invalidated when necessary
		// also needed for when handling inspect logic so we can inspect the correct source signal
		if (captured_signals !== null) {
			// set this so that we don't reset to the parent value if `d`
			// is invalidated because of `invalidate_inner_signals` (rather
			// than because the parent or child value changed)
			from_child = was_from_child;
			// invoke getters so that signals are picked up by `invalidate_inner_signals`
			getter();
			get(inner_current_value);
		}

		if (arguments.length > 0) {
			const new_value = mutation ? get(current_value) : runes && bindable ? proxy(value) : value;

			if (!current_value.equals(new_value)) {
				from_child = true;
				set(inner_current_value, new_value);
				// To ensure the fallback value is consistent when used with proxies, we
				// update the local fallback_value, but only if the fallback is actively used
				if (fallback_used && fallback_value !== undefined) {
					fallback_value = new_value;
				}
				untrack(() => get(current_value)); // force a synchronisation immediately
			}

			return value;
		}
		return get(current_value);
	};
}
