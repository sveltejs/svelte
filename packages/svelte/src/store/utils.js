import { noop } from '../internal/common.js';

/**
 * @template T
 * @param {import('./public').Readable<T> | null | undefined} store
 * @param {(value: T) => void} run
 * @param {(value: T) => void} [invalidate]
 * @param {(value: T) => void} [revalidate]
 * @returns {() => void}
 */
export function subscribe_to_store(store, run, invalidate, revalidate) {
	if (store == null) {
		// @ts-expect-error
		run(undefined);

		// @ts-expect-error
		if (invalidate) invalidate(undefined);

		return noop;
	}

	// Svelte store takes a private second argument
	const unsub = store.subscribe(
		run,
		// @ts-expect-error
		invalidate,
		revalidate
	);

	// Also support RxJS
	// @ts-expect-error TODO fix this in the types?
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
