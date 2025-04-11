import { on } from '../events/index.js';
import { ReactiveValue } from './reactive-value.js';

const parenthesis_regex = /\(.+\)/;

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
 * @extends {ReactiveValue<boolean>}
 * @since 5.7.0
 */
export class MediaQuery extends ReactiveValue {
	/**
	 * @param {string} query A media query string
	 * @param {boolean} [fallback] Fallback value for the server
	 */
	constructor(query, fallback) {
		let final_query = parenthesis_regex.test(query) ? query : `(${query})`;
		const q = window.matchMedia(final_query);
		super(
			() => q.matches,
			(update) => on(q, 'change', update)
		);
	}
}
