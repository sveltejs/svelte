import { get, tick, untrack } from '../internal/client/runtime.js';
import { effect_tracking, render_effect } from '../internal/client/reactivity/effects.js';
import { source } from '../internal/client/reactivity/sources.js';
import { increment } from './utils.js';

/**
 * Returns a function that, when invoked in a reactive context, calls the `start` function once,
 * and calls the `stop` function returned from `start` when all reactive contexts it's called in
 * are destroyed. This is useful for creating a notifier that starts and stops when the
 * "subscriber" count goes from 0 to 1 and back to 0. Call the `update` function passed to the
 * `start` function to notify subscribers of an update.
 *
 * Usage example (reimplementing `MediaQuery`):
 *
 * ```js
 * import { createSubscriber, on } from 'svelte/reactivity';
 *
 * export class MediaQuery {
 * 	#query;
 * 	#subscribe = createSubscriber((update) => {
 * 		// add an event listener to update all subscribers when the match changes
 * 		return on(this.#query, 'change', update);
 * 	});
 *
 * 	get current() {
 * 		// If the `current` property is accessed in a reactive context, start a new
 * 		// subscription if there isn't one already. The subscription will under the
 * 		// hood ensure that whatever reactive context reads `current` will rerun when
 * 		// the match changes
 * 		this.#subscribe();
 * 		// Return the current state of the query
 * 		return this.#query.matches;
 * 	}
 *
 * 	constructor(query) {
 * 		this.#query = window.matchMedia(`(${query})`);
 * 	}
 * }
 * ```
 * @param {(update: () => void) => (() => void) | void} start
 */
export function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	/** @type {(() => void) | void} */
	let stop;

	return () => {
		if (effect_tracking()) {
			get(version);

			render_effect(() => {
				if (subscribers === 0) {
					stop = untrack(() => start(() => increment(version)));
				}

				subscribers += 1;

				return () => {
					tick().then(() => {
						// Only count down after timeout, else we would reach 0 before our own render effect reruns,
						// but reach 1 again when the tick callback of the prior teardown runs. That would mean we
						// re-subcribe unnecessarily and create a memory leak because the old subscription is never cleaned up.
						subscribers -= 1;

						if (subscribers === 0) {
							stop?.();
							stop = undefined;
						}
					});
				};
			});
		}
	};
}
