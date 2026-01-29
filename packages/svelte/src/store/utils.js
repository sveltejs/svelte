/** @import { Readable } from './public' */
import { untrack } from '../index-client.js';
import { noop } from '../internal/shared/utils.js';

/**
 * @template T
 * @param {Readable<T> | null | undefined} store
 * @param {(value: T) => void} run
 * @param {(value: T) => void} [invalidate]
 * @returns {() => void}
 */
// Track current values being processed for stores during subscription callbacks
// This allows $value to be current even when read inside manual subscription callbacks
const store_current_values = new WeakMap();

export function subscribe_to_store(store, run, invalidate) {
	if (store == null) {
		// @ts-expect-error
		run(undefined);

		// @ts-expect-error
		if (invalidate) invalidate(undefined);

		return noop;
	}

	// Svelte store takes a private second argument
	// StartStopNotifier could mutate state, and we want to silence the corresponding validation error
	const unsub = untrack(() =>
		store.subscribe(
			/** @param {any} v */
			(v) => {
				// Track the current value being processed for this store
				store_current_values.set(store, v);
				run(v);
			},
			// @ts-expect-error
			invalidate
		)
	);

	// Also support RxJS
	// @ts-expect-error TODO fix this in the types?
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

/**
 * Get the current value being processed for a store, if available
 * @template T
 * @param {Readable<T> | null | undefined} store
 * @returns {T | undefined}
 */
export function get_store_current_value(store) {
	if (store == null) return undefined;
	return store_current_values.get(store);
}
