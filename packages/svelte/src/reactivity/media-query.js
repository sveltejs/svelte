import { get } from '../internal/client/runtime.js';
import { set, source } from '../internal/client/reactivity/sources.js';
import { effect_tracking } from '../internal/client/reactivity/effects.js';
import { createStartStopNotifier } from './start-stop-notifier.js';

/**
 * Creates a media query and provides a `current` property that reflects whether or not it matches.
 */
export class MediaQuery {
	#version = source(0);
	#query;
	#notify;

	get current() {
		if (effect_tracking()) {
			get(this.#version);
			this.#notify();
		}

		return this.#query.matches;
	}

	/**
	 * @param {string} query A media query string (don't forget the braces)
	 * @param {boolean} [matches] Fallback value for the server
	 */
	constructor(query, matches) {
		this.#query = window.matchMedia(query);
		this.#notify = createStartStopNotifier(() => {
			const listener = () => set(this.#version, this.#version.v + 1);
			this.#query.addEventListener('change', listener);
			return () => this.#query.removeEventListener('change', listener);
		});
	}
}
