import { createSubscriber } from './create-subscriber.js';
import { on } from '../events/index.js';

/**
 * Creates a media query and provides a `current` property that reflects whether or not it matches.
 */
export class MediaQuery {
	#query;
	#subscribe = createSubscriber((update) => {
		return on(this.#query, 'change', update);
	});

	get current() {
		this.#subscribe();

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
