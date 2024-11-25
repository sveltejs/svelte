import { get, tick } from '../internal/client/runtime.js';
import { set, source } from '../internal/client/reactivity/sources.js';
import { effect_tracking, render_effect } from '../internal/client/reactivity/effects.js';

/**
 * Creates a media query and provides a `matches` property that reflects its current state.
 */
export class MediaQuery {
	#matches = source(false);
	#subscribers = 0;
	#query;
	/** @type {any} */
	#listener;

	get matches() {
		if (effect_tracking()) {
			render_effect(() => {
				if (this.#subscribers === 0) {
					this.#listener = () => set(this.#matches, this.#query.matches);
					this.#query.addEventListener('change', this.#listener);
				}

				this.#subscribers += 1;

				return () => {
					tick().then(() => {
						// Only count down after timeout, else we would reach 0 before our own render effect reruns,
						// but reach 1 again when the tick callback of the prior teardown runs. That would mean we
						// re-subcribe unnecessarily and create a memory leak because the old subscription is never cleaned up.
						this.#subscribers -= 1;

						if (this.#subscribers === 0) {
							this.#query.removeEventListener('change', this.#listener);
						}
					});
				};
			});
		}

		return get(this.#matches);
	}

	/** @param {string} query */
	constructor(query) {
		this.#query = window.matchMedia(query);
		console.log('MediaQuery.constructor', query, this.#query);
		this.#matches.v = this.#query.matches;
	}
}
