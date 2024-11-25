import { get, tick } from '../internal/client/runtime.js';
import { set, source } from '../internal/client/reactivity/sources.js';
import { effect_tracking, render_effect } from '../internal/client/reactivity/effects.js';

/**
 * Creates a media query and provides a `current` property that reflects whether or not it matches.
 */
export class MediaQuery {
	#version = source(0);
	#subscribers = 0;
	#query;
	/** @type {any} */
	#listener;

	get current() {
		if (effect_tracking()) {
			get(this.#version);

			render_effect(() => {
				if (this.#subscribers === 0) {
					this.#listener = () => set(this.#version, this.#version.v + 1);
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

		return this.#query.matches;
	}

	/**
	 * @param {string} query A media query string (don't forget the braces)
	 * @param {boolean} [matches] Fallback value for the server
	 */
	constructor(query, matches) {
		this.#query = window.matchMedia(query);
	}
}
