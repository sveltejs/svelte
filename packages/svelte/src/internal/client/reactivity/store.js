import { subscribe_to_store } from '../../../store/utils.js';
import { noop } from '../../common.js';
import { UNINITIALIZED } from '../constants.js';
import { get, set_ignore_mutation_validation, untrack } from '../runtime.js';
import { user_effect } from './effects.js';
import { mutable_source, set } from './sources.js';

/**
 * Gets the current value of a store. If the store isn't subscribed to yet, it will create a proxy
 * signal that will be updated when the store is. The store references container is needed to
 * track reassignments to stores and to track the correct component context.
 * @template V
 * @param {import('#client').Store<V> | null | undefined} store
 * @param {string} store_name
 * @param {import('#client').StoreReferencesContainer} stores
 * @returns {V}
 */
export function store_get(store, store_name, stores) {
	/** @type {import('#client').StoreReferencesContainer[''] | undefined} */
	let entry = stores[store_name];
	const is_new = entry === undefined;

	if (is_new) {
		entry = {
			store: null,
			last_value: null,
			value: mutable_source(UNINITIALIZED),
			unsubscribe: noop
		};
		// TODO: can we remove this code? it was refactored out when we split up source/comptued signals
		// push_destroy_fn(entry.value, () => {
		// 	/** @type {import('#client').StoreReferencesContainer['']} */ (entry).last_value =
		// 		/** @type {import('#client').StoreReferencesContainer['']} */ (entry).value.value;
		// });
		stores[store_name] = entry;
	}

	if (is_new || entry.store !== store) {
		entry.unsubscribe();
		entry.store = store ?? null;
		entry.unsubscribe = connect_store_to_signal(store, entry.value);
	}

	const value = get(entry.value);
	// This could happen if the store was cleaned up because the component was destroyed and there's a leak on the user side.
	// In that case we don't want to fail with a cryptic Symbol error, but rather return the last value we got.
	return value === UNINITIALIZED ? entry.last_value : value;
}

/**
 * @template V
 * @param {import('#client').Store<V> | null | undefined} store
 * @param {import('#client').Source<V>} source
 */
function connect_store_to_signal(store, source) {
	if (store == null) {
		set(source, undefined);
		return noop;
	}

	/** @param {V} v */
	const run = (v) => {
		set_ignore_mutation_validation(true);
		set(source, v);
		set_ignore_mutation_validation(false);
	};
	return subscribe_to_store(store, run);
}

/**
 * Sets the new value of a store and returns that value.
 * @template V
 * @param {import('#client').Store<V>} store
 * @param {V} value
 * @returns {V}
 */
export function store_set(store, value) {
	store.set(value);
	return value;
}

/**
 * Unsubscribes from all auto-subscribed stores on destroy
 * @param {import('#client').StoreReferencesContainer} stores
 */
export function unsubscribe_on_destroy(stores) {
	on_destroy(() => {
		let store_name;
		for (store_name in stores) {
			const ref = stores[store_name];
			ref.unsubscribe();
			// TODO: can we remove this code? it was refactored out when we split up source/comptued signals
			// destroy_signal(ref.value);
		}
	});
}

/**
 * Updates a store with a new value.
 * @param {import('#client').Store<V>} store  the store to update
 * @param {any} expression  the expression that mutates the store
 * @param {V} new_value  the new store value
 * @template V
 */
export function mutate_store(store, expression, new_value) {
	store.set(new_value);
	return expression;
}

/**
 * @template V
 * @param {unknown} val
 * @returns {val is import('#client').Store<V>}
 */
export function is_store(val) {
	return (
		typeof val === 'object' &&
		val !== null &&
		typeof (/** @type {import('#client').Store<V>} */ (val).subscribe) === 'function'
	);
}

/**
 * @param {import('#client').Store<number>} store
 * @param {number} store_value
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update_store(store, store_value, d = 1) {
	store.set(store_value + d);
	return store_value;
}

/**
 * @param {import('#client').Store<number>} store
 * @param {number} store_value
 * @param {1 | -1} [d]
 * @returns {number}
 */
export function update_pre_store(store, store_value, d = 1) {
	const value = store_value + d;
	store.set(value);
	return value;
}

/**
 * Schedules a callback to run immediately before the component is unmounted.
 * @param {() => any} fn
 * @returns {void}
 */
function on_destroy(fn) {
	user_effect(() => () => untrack(fn));
}
