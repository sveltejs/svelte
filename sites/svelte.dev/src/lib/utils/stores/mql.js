import { readable, writable } from 'svelte/store';

/**
 * Svelte Media Query Store
 * @param {string} mediaQueryString
 */
export const withMediaQuery = (mediaQueryString) => {
	const { subscribe } = /** @type {import('svelte/store').Readable<boolean>} */ (
		readable(undefined, (set) => {
			if (typeof window === 'undefined') return set(false);

			// Start observing media query
			let mql = window.matchMedia(mediaQueryString);

			// Set first media query result to the store
			set(mql.matches);

			// Called when media query state changes
			const onchange = () => set(mql.matches);

			mql.addEventListener('change', onchange);

			// when no more listeners
			return () => {
				mql.removeEventListener('change', onchange);
			};
		})
	);

	return { subscribe };
};
