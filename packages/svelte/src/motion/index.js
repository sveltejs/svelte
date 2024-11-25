import { MediaQuery } from 'svelte/reactivity';

export * from './spring.js';
export * from './tweened.js';

/**
 * A media query that matches if the user has requested reduced motion.
 * @type {MediaQuery}
 */
export const prefersReducedMotion = /*@__PURE__*/ new MediaQuery(
	'(prefers-reduced-motion: reduce)'
);
