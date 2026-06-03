import { on } from '../events/index.js';
import { ReactiveValue } from './reactive-value.js';

const parenthesis_regex = /\(.+\)/;

// these keywords are valid media queries but they need to be without parenthesis
//
// eg: new MediaQuery('screen')
//
// however because of the auto-parenthesis logic in the constructor since there's no parenthesis
// in the media query they'll be surrounded by parenthesis
//
// however we can check if the media query is only composed of these keywords
// and skip the auto-parenthesis
//
// https://github.com/sveltejs/svelte/issues/15930
const non_parenthesized_keywords = new Set(['all', 'print', 'screen', 'and', 'or', 'not', 'only']);

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
		let final_query =
			parenthesis_regex.test(query) ||
			// we need to use `some` here because technically this `window.matchMedia('random,screen')` still returns true
			query.split(/[\s,]+/).some((keyword) => non_parenthesized_keywords.has(keyword.trim()))
				? query
				: `(${query})`;
		const q = window.matchMedia(final_query);
		super(
			() => q.matches,
			(update) => on(q, 'change', update)
		);
	}
}
