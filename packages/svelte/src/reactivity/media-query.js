import { get } from '../internal/client/runtime.js';
import { source } from '../internal/client/reactivity/sources.js';
import { effect_tracking } from '../internal/client/reactivity/effects.js';
import { createStartStopNotifier } from './start-stop-notifier.js';
import { on } from '../events/index.js';
import { increment } from './utils.js';

/**
 * Creates a media query and provides a `current` property that reflects whether or not it matches.
 */
export class MediaQuery {
	#query;
	#version = source(0);
	#notify = createStartStopNotifier(() => {
		return on(this.#query, 'change', () => increment(this.#version));
	});

	get current() {
		if (effect_tracking()) {
			get(this.#version);
			this.#notify();
		}

		return this.#query.matches;
	}

	/**
	 * @param {string} query A media query string
	 * @param {boolean} [matches] Fallback value for the server
	 */
	constructor(query, matches) {
		// For convenience (and because people likely forget them) we add the parentheses; double parantheses are not a problem
		this.#query = window.matchMedia(`(${query})`);
	}
}
