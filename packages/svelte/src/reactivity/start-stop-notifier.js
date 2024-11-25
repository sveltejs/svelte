import { tick, untrack } from '../internal/client/runtime.js';
import { effect_tracking, render_effect } from '../internal/client/reactivity/effects.js';

/**
 * Returns a function that, when invoked in a reactive context, calls the `start` function once,
 * and calls the `stop` function returned from `start` when all reactive contexts it's called in
 * are destroyed. This is useful for creating a notifier that starts and stops when the
 * "subscriber" count goes from 0 to 1 and back to 0.
 * @param {() => () => void} start
 */
export function createStartStopNotifier(start) {
	let subscribers = 0;
	/** @type {() => void} */
	let stop;

	return () => {
		if (effect_tracking()) {
			render_effect(() => {
				if (subscribers === 0) {
					stop = untrack(start);
				}

				subscribers += 1;

				return () => {
					tick().then(() => {
						// Only count down after timeout, else we would reach 0 before our own render effect reruns,
						// but reach 1 again when the tick callback of the prior teardown runs. That would mean we
						// re-subcribe unnecessarily and create a memory leak because the old subscription is never cleaned up.
						subscribers -= 1;

						if (subscribers === 0) {
							stop();
						}
					});
				};
			});
		}
	};
}
