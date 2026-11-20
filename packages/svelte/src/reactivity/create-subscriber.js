/** @import { Reaction } from '#client' */
import {
	active_effect,
	active_reaction,
	get,
	get_abort_signal,
	untrack
} from '../internal/client/runtime.js';
import { effect_tracking, render_effect } from '../internal/client/reactivity/effects.js';
import { source, increment } from '../internal/client/reactivity/sources.js';
import { tag } from '../internal/client/dev/tracing.js';
import { DEV } from 'esm-env';
import { queue_micro_task } from '../internal/client/dom/task.js';
import { CONNECTED, DESTROYED, DESTROYING } from '../internal/client/constants.js';
import { current_batch } from '../internal/client/reactivity/batch.js';

/**
 * Returns a `subscribe` function that integrates external event-based systems with Svelte's reactivity.
 * It's particularly useful for integrating with web APIs like `MediaQuery`, `IntersectionObserver`, or `WebSocket`.
 *
 * If `subscribe` is called inside an effect (including indirectly, for example inside a getter),
 * the `start` callback will be called with an `update` function. Whenever `update` is called, the effect re-runs.
 *
 * If `start` returns a cleanup function, it will be called when the effect is destroyed.
 *
 * If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
 * are active, and the returned teardown function will only be called when all effects are destroyed.
 *
 * It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
 *
 * ```js
 * import { createSubscriber } from 'svelte/reactivity';
 * import { on } from 'svelte/events';
 *
 * export class MediaQuery {
 * 	#query;
 * 	#subscribe;
 *
 * 	constructor(query) {
 * 		this.#query = window.matchMedia(`(${query})`);
 *
 * 		this.#subscribe = createSubscriber((update) => {
 * 			// when the `change` event occurs, re-run any effects that read `this.current`
 * 			const off = on(this.#query, 'change', update);
 *
 * 			// stop listening when all the effects are destroyed
 * 			return () => off();
 * 		});
 * 	}
 *
 * 	get current() {
 * 		// This makes the getter reactive, if read in an effect
 * 		this.#subscribe();
 *
 * 		// Return the current state of the query, whether or not we're in an effect
 * 		return this.#query.matches;
 * 	}
 * }
 * ```
 * @param {(update: () => void) => (() => void) | void} start
 * @since 5.7.0
 */
export function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	/** @type {(() => void) | void} */
	let stop;

	if (DEV) {
		tag(version, 'createSubscriber version');
	}

	return () => {
		if (effect_tracking()) {
			const reaction = /** @type {Reaction} */ (active_reaction);
			const parent = active_effect;

			if (parent && (parent.f & DESTROYED) !== 0) return;
			if (current_batch?.is_fork && !current_batch.linked) return;

			get(version);
			const signal = get_abort_signal(reaction, true);
			if (signal.aborted) return;

			render_effect(() => {
				if (subscribers === 0) {
					stop = untrack(() => start(() => increment(version)));
				}

				subscribers += 1;
				let subscribed = true;

				const unsubscribe = () => {
					if (!subscribed) return;
					subscribed = false;
					signal.removeEventListener('abort', unsubscribe);

					queue_micro_task(() => {
						// A replacement run can subscribe before we reach zero, avoiding an
						// unnecessary stop/start cycle when the same subscriber is read again.
						subscribers -= 1;

						if (subscribers === 0) {
							stop?.();
							stop = undefined;
							// Invalidate cached derived values so that reconnecting them reads
							// the external state again, even if it changed while unsubscribed.
							increment(version);
						}
					});
				};

				signal.addEventListener('abort', unsubscribe, { once: true });

				return () => {
					// A speculative rerun destroys child effects, but the committed run still
					// needs its subscription. Its signal aborts when that run is replaced.
					// Untracked deriveds also need their parent's lifetime as a fallback.
					if ((reaction.f & CONNECTED) === 0 || (parent && (parent.f & DESTROYING) !== 0)) {
						unsubscribe();
					}
				};
			});
		}
	};
}
