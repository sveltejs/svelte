import { createSubscriber } from './create-subscriber.js';
import { on } from '../events/index.js';

/**
 * Creates a media query and provides a `current` property that reflects whether or not it matches.
 *
 * Use it carefully — during server-side rendering, there is no way to know what the correct value should be, potentially causing content to change upon hydration.
 * If you can use the media query in CSS to achieve the same effect, do that.
 *
 * ```svelte
 * <script>
 * 	import { MediaQuery } from 'svelte/reactivity';
 *
 * 	const large = new MediaQuery('min-width: 800px');
 * </script>
 *
 * <h1>{large.current ? 'large screen' : 'small screen'}</h1>
 * ```
 * @since 5.7.0
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
		// For convenience (and because people likely forget them) we add the parentheses; double parentheses are not a problem
		this.#query = window.matchMedia(`(${query})`);
	}
}
