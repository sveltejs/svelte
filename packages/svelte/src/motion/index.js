import { MediaQuery } from 'svelte/reactivity';

export * from './spring.js';
export * from './tweened.js';

/**
 * A [media query](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery) that matches if the user [prefers reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
 *
 * ```svelte
 * <script>
 * 	import { prefersReducedMotion } from 'svelte/motion';
 * 	import { fly } from 'svelte/transition';
 *
 * 	let visible = $state(false);
 * </script>
 *
 * <button onclick={() => visible = !visible}>
 * 	toggle
 * </button>
 *
 * {#if visible}
 * 	<p transition:fly={{ y: prefersReducedMotion.current ? 0 : 200 }}>
 * 		flies in, unless the user prefers reduced motion
 * 	</p>
 * {/if}
 * ```
 * @type {MediaQuery}
 * @since 5.7.0
 */
export const prefersReducedMotion = /*@__PURE__*/ new MediaQuery(
	'(prefers-reduced-motion: reduce)'
);
