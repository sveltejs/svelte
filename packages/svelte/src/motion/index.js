import { MediaQuery } from 'svelte/reactivity';

export * from './spring.js';
export * from './tweened.js';

/**
 * A [media query](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery) that matches if the user [prefers reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
 * @type {MediaQuery}
 */
export const prefersReducedMotion = /*@__PURE__*/ new MediaQuery(
	'(prefers-reduced-motion: reduce)'
);
