import { get, tick, untrack } from '../internal/client/runtime.js';
import { effect_tracking, render_effect } from '../internal/client/reactivity/effects.js';
import { source } from '../internal/client/reactivity/sources.js';
import { tag } from '../internal/client/dev/tracing.js';
import { increment } from './utils.js';
import { DEV } from 'esm-env';

/**
 * Returns a `subscribe` function that bridges external, non-reactive changes
 * to Svelte's reactivity system. It's ideal for integrating with browser APIs,
 * WebSockets, or any event-based source outside of Svelte's control.
 *
 * Call the returned `subscribe()` function inside a getter to make that getter
 * reactive. When the external source changes, you call an `update` function,
 * which in turn causes any effects that depend on the getter to re-run.
 *
 * @param {(update: () => void) => (() => void) | void} start
 *   A callback that runs when the subscription is first activated by an effect.
 *   It receives an `update` function, which you should call to signal that
 *   the external data source has changed. The `start` callback can optionally
 *   return a `cleanup` function, which will be called when the last effect
 *   that depends on it is destroyed.
 * @returns {() => void}
 *   A `subscribe` function that you call inside a getter to establish the
 *   reactive connection.
 *
 * @example
 * ### The Generic Pattern
 *
 * This pattern shows how to create a reusable utility that encapsulates the
 * external state and subscription logic.
 *
 * ```js
 * import { createSubscriber } from 'svelte/reactivity';
 *
 * export function createReactiveExternalState() {
 * 	let state = someInitialValue;
 *
 * 	const subscribe = createSubscriber((update) => {
 * 		// Set up your external listener (DOM event, WebSocket, timer, etc.)
 * 		const cleanup = setupListener(() => {
 * 			state = newValue; // Update your state
 * 			update(); // Call this to trigger Svelte reactivity
 * 		});
 *
 * 		// Return cleanup function
 * 		return () => cleanup();
 * 	});
 *
 * 	return {
 * 		get current() {
 * 			subscribe(); // This "paints" the getter as reactive
 * 			return state;
 * 		}
 * 	};
 * }
 * ```
 *
 * ### Implementation Details
 *
 * Internally, `createSubscriber` creates a hidden reactive `$state` variable
 * that acts as a version number. Calling the `update` function increments this
 * version. When the `subscribe` function is called within an effect, it reads
 * this version number, creating a dependency. This mechanism ensures that
 * getters become reactive to the external changes you signal.
 *
 * This approach is highly efficient:
 * - **Lazy:** The `start` callback is only executed when the getter is first
 *   used inside an active effect.
 * - **Automatic Cleanup:** The returned cleanup function is automatically
 *   called when the last subscribing effect is destroyed.
 * - **Shared:** If multiple effects depend on the same getter, the `start`
 *   callback is still only called once.
 *
 * It's best understood with more examples.
 *
 * @example
 * ### MediaQuery
 *
 * Here's a practical implementation of a reactive `MediaQuery` utility class.
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
 * 		this.#subscribe();
 *
 * 		// Return the current state, whether or not we're in an effect
 * 		return this.#query.matches;
 * 	}
 * }
 * ```
 *
 * @example
 * ### Mouse Position
 *
 * This example creates a utility that reactively tracks mouse coordinates.
 *
 * ```js
 * import { createSubscriber } from 'svelte/reactivity';
 * import { on } from 'svelte/events';
 *
 * export function createMousePosition() {
 * 	let x = 0;
 * 	let y = 0;
 *
 * 	const subscribe = createSubscriber((update) => {
 * 		const handleMouseMove = (event) => {
 * 			x = event.clientX;
 * 			y = event.clientY;
 * 			update(); // Trigger reactivity
 * 		};
 *
 * 		const off = on(window, 'mousemove', handleMouseMove);
 * 		return () => off();
 * 	});
 *
 * 	return {
 * 		get x() {
 * 			subscribe(); // Makes x reactive
 * 			return x;
 * 		},
 * 		get y() {
 * 			subscribe(); // Makes y reactive
 * 			return y;
 * 		}
 * 	};
 * }
 * ```
 *
 * ### When to use `createSubscriber`
 *
 * - To synchronize Svelte's reactivity with external event sources like DOM
 *   events, `postMessage`, or WebSockets.
 * - To create reactive wrappers around browser APIs (`matchMedia`,
 *   `IntersectionObserver`, etc.).
 * - When you have a value that is read from an external source and you need
 *   components to update when that value changes. It is a more direct
 *   alternative to using `$state` and `$effect` for this specific purpose.
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
						// re-subscribe unnecessarily and create a memory leak because the old subscription is never cleaned up.
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
