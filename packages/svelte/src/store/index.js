import { EMPTY_FUNC } from '../internal/common.js';

const value_key = Symbol('value');
const is_derived_key = Symbol('is_derived');
const is_syncing_key = Symbol('is_syncing');
const subscribers_key = Symbol('subscribers');
const notify_key = Symbol('notify');
const set_key = Symbol('set');
const update_key = Symbol('update');

/**
 * Extended `symbol` properties of `Store` that cannot be defined outside of
 * this file without exporting the `symbol`s.
 *
 * @template T
 * @typedef {{
 *   [value_key]: T,
 *   [is_derived_key]?: boolean,
 *   [is_syncing_key]?: boolean,
 *   [subscribers_key]: import('./private.js').Subscribers<T>,
 *   [notify_key]: (is_changed: boolean) => void,
 *   [set_key]: import('./public.js').Setter<T>,
 *   [update_key]: (fn: import('./public.js').Updater<T>) => void
 * }} StoreSymbols
 */

/**
 * `Readable` with extended `symbol` properties.
 *
 * @template T
 * @typedef {import('./public.js').Readable<T> & StoreSymbols<T>} Readable
 */
/**
 * `Writable` with extended `symbol` properties.
 *
 * @template T
 * @typedef {import('./public.js').Writable<T> & StoreSymbols<T>} Writable
 */

/** @returns {void} */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

/**
 * Return `true` if `a` and `b` are unequal. Unlike usual, identical `Function`s
 * and non-`null` `Object`s are considered to be unequal to themselves.
 * Also unlike usual, `NaN` *is* considered to be equal to itself.
 *
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export function safe_not_equal(a, b) {
	// eslint-disable-next-line eqeqeq
	return a != a
		? // eslint-disable-next-line eqeqeq
		  b == b
		: a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

/**
 * Create a `DisableableSetterUpdater<T>` for the given store.
 *
 * @template T
 * @param {Readable<T>} store
 * @returns {import('./private.js').DisableableSetterUpdater<T>}
 */
const create_disableable_setter_updater = (store) => {
	/** @type {import('./private.js').DisableableSetterUpdater<T>} */
	const state = {
		enabled: true,
		set(value) {
			if (this.enabled) store[set_key](value);
		},
		update(fn) {
			if (this.enabled) store[update_key](fn);
		}
	};
	state.set = state.set.bind(state);
	state.update = state.update.bind(state);
	return state;
};

/**
 * Create an internal store.
 *
 * @template T
 * @param {T} [initial_value] Initial value
 * @param {(
 *   import('./public.js').OnStart<T>
 *   | import('./private.js').DerivedOnStart<T>
 * )} [on_start = noop]
 *   A function called when the store receives its first subscriber.
 * @returns {Readable<T>}
 */
const create_store = (initial_value, on_start = noop) => {
	/** @type {import('./private.js').Subscribers<T>} */
	const subscribers = [];
	let on_stop = noop;

	/** @type {Readable<T>} */
	const store = {
		[value_key]: /** @type {T} */ (initial_value),
		[subscribers_key]: subscribers,

		[notify_key](is_changed) {
			for (const subscriber of subscribers) {
				if (Array.isArray(subscriber)) {
					if (is_changed || this[is_derived_key]) {
						subscriber[0](this[value_key], is_changed);
					}
				} else {
					if (is_changed) subscriber(this[value_key]);
				}
			}
		},

		[set_key](value) {
			const is_changed = safe_not_equal(value, this[value_key]);

			if (is_changed && !this[is_syncing_key]) {
				for (const subscriber of subscribers) {
					if (Array.isArray(subscriber)) subscriber[1]();
				}
			}

			if (is_changed) this[value_key] = value;

			if (!this[is_syncing_key]) this[notify_key](is_changed);
		},

		[update_key](fn) {
			this[set_key](fn(this[value_key]));
		},

		subscribe(subscriber) {
			/** @type {import('./private.js').DisableableSetterUpdater<T>} */
			let setter_updater;

			if (subscribers.length === 0) {
				if (this[is_derived_key]) {
					// @ts-ignore
					on_stop = on_start(this) || noop;
				} else {
					setter_updater = create_disableable_setter_updater(this);
					// @ts-ignore
					on_stop = on_start(setter_updater.set, setter_updater.update) || noop;
				}
			}

			subscribers.push(subscriber);
			(Array.isArray(subscriber) ? subscriber[0] : subscriber)(this[value_key]);

			return function unsubscribe() {
				const subscriber_index = subscribers.indexOf(subscriber);
				if (subscriber_index !== -1) subscribers.splice(subscriber_index, 1);

				if (subscribers.length === 0) {
					on_stop();
					if (setter_updater !== undefined) setter_updater.enabled = false;
				}
			};
		}
	};

	// Allow consumers to pass around a store's `subscribe` method (e.g., to
	// another function) more liberally without breaking it.
	store.subscribe = store.subscribe.bind(store);

	return store;
};

/**
 * Create a `Writable` store that allows both updating and reading by
 * subscription.
 *
 * https://svelte.dev/docs/svelte-store#writable
 *
 * @template T
 * @param {T} [initial_value] Initial value
 * @param {import('./public.js').OnStart<T>} [on_start = noop]
 *   A function called when the store receives its first subscriber.
 * @returns {Writable<T>}
 */
export function writable(initial_value, on_start = noop) {
	const store = /** @type {Writable<T>} */ (create_store(initial_value, on_start));
	store.update = store[update_key].bind(store);
	store.set = store[set_key].bind(store);
	return store;
}

/**
 * Creates a `Readable` store that allows reading by subscription.
 *
 * https://svelte.dev/docs/svelte-store#readable
 *
 * @template T
 * @param {T} [initial_value] Initial value
 * @param {import('./public.js').OnStart<T>} [on_start]
 *   A function called when the store receives its first subscriber.
 * @returns {Readable<T>}
 */
export function readable(initial_value, on_start) {
	return create_store(initial_value, on_start);
}

/** @type {Map<import('./public.js').ExternalReadable<any>, Readable<any>>} */
const wrapped_stores = new Map();
/**
 * Wrap an external (non-native) store as a `Readable`. Stores implementing
 * RxJS's `Observable` interface are accepted.
 *
 * @template {Readable<any>} S
 * @overload
 * @param {S} store Store to wrap.
 * @returns {S}
 */
/**
 * Wrap an external (non-native) store as a `Readable`. Stores implementing
 * RxJS's `Observable` interface are accepted.
 *
 * @template {import('./public.js').ExternalReadable} S
 * @overload
 * @param {S} store Store to wrap.
 * @returns {S extends import('./public.js').ExternalReadable<infer T> ? Readable<T> : never}
 */
/**
 * Wrap an external (non-native) store as a `Readable`. Stores implementing
 * RxJS's `Observable` interface are accepted.
 *
 * @template [T = unknown]
 * @overload
 * @param {import('./public.js').ExternalReadable} store Store to wrap.
 * @returns {Readable<T>}
 */
function wrap_store(
	/** @type {import('./public.js').ExternalReadable<T> | Readable<T>} */
	store
) {
	if (store.hasOwnProperty(set_key)) {
		return /** @type {Readable<T>} */ (store);
	}

	if (wrapped_stores.has(store)) {
		return /** @type {Readable<T>} */ (wrapped_stores.get(store));
	}

	const wrapped_store = readable(
		undefined,
		/** @type {import('./public.js').OnStart<T>} */
		(set) => {
			const unsubscribe = store.subscribe(set);
			return function on_stop() {
				const is_rxjs = typeof unsubscribe !== 'function';
				(is_rxjs ? unsubscribe.unsubscribe : unsubscribe)();
			};
		}
	);
	wrapped_stores.set(store, wrapped_store);
	return wrapped_store;
}

/**
 * Create a new `Readable` store whose value is derived from the value(s) of one
 * or more other `Readable` stores and whose value is re-evaluated whenever one
 * or more dependency store updates.
 *
 * https://svelte.dev/docs/svelte-store#derived
 *
 * @template {import('./private.js').Stores} S
 * @template [T = unknown]
 * @overload
 * @param {S} dependency_or_dependencies Dependency store or array of stores.
 * @param {import('./public.js').ComplexDeriveValue<S, T>} derive_value
 *   Function which derives a value from the dependency stores' values and
 *   optionally calls the passed `set` or `update` functions to change the
 *   store.
 * @param {T} [initial_value] Initial value.
 * @returns {Readable<T>}
 */
/**
 * Create a new `Readable` store whose value is derived from the value(s) of one
 * or more other `Readable` stores and whose value is re-evaluated whenever one
 * or more dependency store updates.
 *
 * https://svelte.dev/docs/svelte-store#derived
 *
 * @template {import('./private.js').Stores} S
 * @template [T = unknown]
 * @overload
 * @param {S} dependency_or_dependencies Dependency store or array of stores.
 * @param {import('./public.js').SimpleDeriveValue<S, T>} derive_value
 *   Function which derives and returns a value from the dependency stores'
 *   values.
 * @param {T} [initial_value] Initial value.
 * @returns {Readable<T>}
 */
/**
 * Create a new `Readable` store whose value is derived from the value(s) of one
 * or more other `Readable` stores and whose value is re-evaluated whenever one
 * or more dependency store updates.
 *
 * https://svelte.dev/docs/svelte-store#derived
 *
 * @template Ts
 * @template [T = unknown]
 * @overload
 * @param {import('./private.js').Stores} dependency_or_dependencies Dependency
 *   store or array of stores.
 * @param {import('./public.js').ComplexDeriveValue<Ts, T>} derive_value
 *   Function which derives a value from the dependency stores' values and
 *   optionally calls the passed `set` or `update` functions to change the store.
 * @param {T} [initial_value] Initial value.
 * @returns {Readable<T>}
 */
/**
 * Create a new `Readable` store whose value is derived from the value(s) of one
 * or more other `Readable` stores and whose value is re-evaluated whenever one
 * or more dependency store updates.
 *
 * https://svelte.dev/docs/svelte-store#derived
 *
 * @template Ts
 * @template [T = unknown]
 * @overload
 * @param {import('./private.js').Stores} dependency_or_dependencies Dependency
 *   store or array of stores.
 * @param {import('./public.js').SimpleDeriveValue<Ts, T>} derive_value
 *   Function which derives and returns a value from the dependency stores'
 *   values.
 * @param {T} [initial_value] Initial value.
 * @returns {Readable<T>}
 */
export function derived(
	/** @type {S} */
	dependency_or_dependencies,
	/** @type {import('./public.js').ComplexDeriveValue<S, T> | import('./public.js').SimpleDeriveValue<S, T>} */
	derive_value,
	/** @type {T} */
	initial_value
) {
	const has_single_dependency = !Array.isArray(dependency_or_dependencies);
	/** @type {import('./private.js').Stores} */
	const dependencies = has_single_dependency
		? [dependency_or_dependencies]
		: dependency_or_dependencies;

	for (const [i, dependency] of dependencies.entries()) {
		if (!dependency) {
			throw Error(`Dependency with index ${i} passed to \`derived()\` is falsy.`);
		}
	}

	/** @type {Array<Readable<any>>} */
	const wrapped_dependencies = dependencies.map(wrap_store);

	const store = create_store(
		initial_value,
		// @ ts-expect-error Required to keep `StoreSymbols<T>` out of the public
		// type definitions.
		/** @type {import('./private.js').DerivedOnStart<T>} */
		(
			function on_start(
				/** @type {Writable<T>} */
				store
			) {
				/** @type {Array<() => void>} */
				const unsubscribers = [];
				let pending_store_count = wrapped_dependencies.length;
				let is_invalid = false;

				let clean_up = noop;
				for (const dependency of wrapped_dependencies) {
					/** @type {import('./private.js').DisableableSetterUpdater<T>} */
					let setter_updater;

					const unsubscribe = dependency.subscribe([
						function on_value_change(_, is_changed = true) {
							if (is_changed) is_invalid = true;
							pending_store_count -= 1;

							if (pending_store_count === 0) {
								const old_value = store[value_key];

								if (is_invalid) {
									clean_up();
									clean_up = noop;
									is_invalid = false;
									store[is_syncing_key] = true;
									const store_values = wrapped_dependencies.map(
										(dependency) => dependency[value_key]
									);
									const store_values_arg = has_single_dependency ? store_values[0] : store_values;

									if (derive_value.length === 1) {
										// @ts-expect-error TypeScript does not narrow types on `Function.length`, and so
										// cannot differentiate `SimpleDeriveValue<S, T>` and `ComplexDeriveValue<S, T>`.
										store[set_key](derive_value(store_values_arg));
									} else {
										setter_updater = create_disableable_setter_updater(store);
										const derived_value = derive_value(
											store_values_arg,
											setter_updater.set,
											setter_updater.update
										);
										clean_up =
											typeof derived_value === 'function'
												? /** @type {typeof noop} */ (derived_value)
												: noop;
									}
									store[is_syncing_key] = false;
								}
								store[notify_key](safe_not_equal(store[value_key], old_value));
							}
						},
						function invalidate() {
							if (pending_store_count === 0) {
								for (const subscriber of store[subscribers_key]) {
									if (Array.isArray(subscriber)) subscriber[1]();
								}
							}
							pending_store_count += 1;
						}
					]);

					unsubscribers.push(() => {
						clean_up();
						if (setter_updater !== undefined) setter_updater.enabled = false;
						unsubscribe();
					});
				}

				return function on_stop() {
					for (const unsubscribe of unsubscribers) unsubscribe();
				};
			}
		)
	);

	store[is_derived_key] = true;

	return store;
}

/**
 * Return a `Readable` of an existing `Readable` or `Writable` store.
 *
 * https://svelte.dev/docs/svelte-store#readonly
 *
 * @template T
 * @param {Readable<T>} store Store to make read-only.
 * @returns {Readable<T>}
 */
export function readonly(/** @type {Readable<T>} */ store) {
	/** @type {Readable<T>} */
	const read_only_store = {
		get [value_key]() {
			return store[value_key];
		},
		[subscribers_key]: store[subscribers_key],
		[notify_key]: store[notify_key].bind(store),
		[set_key]: store[set_key].bind(store),
		[update_key]: store[update_key].bind(store),
		subscribe: store.subscribe.bind(store)
	};
	return read_only_store;
}

/**
 * Get the current value from a store by subscribing and immediately
 * unsubscribing. If `allow_stale` is `true`, the current value is read directly
 * from compatible store objects. This is faster but potentially inaccurate.
 *
 * @template T
 * @overload
 * @param {Readable<T>} store Store to get value of.
 * @param {boolean} [allow_stale = false] Allow reading potentially stale values
 *   from the store rather than subscribing and unsubscribing.
 * @returns {T}
 */
/**
 * Get the current value from a store by subscribing and immediately
 * unsubscribing. If `allow_stale` is `true`, the current value is read directly
 * from compatible store objects. This is faster but potentially inaccurate.
 *
 * @template T
 * @overload
 * @param {Readable<T> | import('./public.js').ExternalReadable<T>} store
 *   Store to get value of.
 * @returns {T}
 */
export function get_store_value(store, allow_stale = false) {
	if (allow_stale && store.hasOwnProperty(set_key)) {
		// @ts-expect-error TypeScript does not narrow types on `Object.hasOwnProperty`, and so cannot
		// differentiate `Readable<T>` and `ExternalReadable<T>`.
		return store[value_key];
	}

	/** @type {T} */
	let fresh_value;
	const unsubscribe = store.subscribe((value) => (fresh_value = value));
	const is_rxjs = typeof unsubscribe !== 'function';
	(is_rxjs ? unsubscribe.unsubscribe : unsubscribe)();

	// @ts-expect-error `T | undefined` is more accurate but causes more headache.
	return fresh_value;
}

export { get_store_value as get };

/**
 * @template T
 * @param {import('./public.js').Readable<T> | import('./public.js').ExternalReadable<T> | null | undefined} store
 * @param {(value: T) => void} run
 * @param {(value: T) => void} [invalidate]
 * @returns {() => void}
 */
export function subscribe_to_store(store, run, invalidate) {
	if (store == null) {
		// @ts-expect-error
		run(undefined);

		// @ts-expect-error
		if (invalidate) invalidate(undefined);

		return EMPTY_FUNC;
	}

	// @ts-expect-error `SubscriberInvalidator<T>` is not public.
	const unsubscribe = store.subscribe([run, invalidate]);
	const is_rxjs = typeof unsubscribe !== 'function';
	return is_rxjs ? unsubscribe.unsubscribe : unsubscribe;
}
