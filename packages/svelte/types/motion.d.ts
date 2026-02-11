/// <reference path="./ambient.d.ts" />
import type { Brand, Branded, Component, ComponentConstructorOptions, ComponentEvents, ComponentInternals, ComponentProps, ComponentType, DispatchOptions, EventDispatcher, Fork, Getters, MountOptions, NotFunction, Properties, Snippet, SnippetReturn, SvelteComponent, SvelteComponentTyped, afterUpdate, beforeUpdate, brand, createContext, createEventDispatcher, createRawSnippet, flushSync, fork, getAbortSignal, getAllContexts, getContext, hasContext, hydratable, hydrate, mount, onDestroy, onMount, setContext, settled, tick, unmount, untrack } from './shared';
// TODO we do declaration merging here in order to not have a breaking change (renaming the Spring interface)
// this means both the Spring class and the Spring interface are merged into one with some things only
// existing on one side. In Svelte 6, remove the type definition and move the jsdoc onto the class in spring.js

export interface Spring<T> extends Readable<T> {
	set(new_value: T, opts?: SpringUpdateOpts): Promise<void>;
	/**
	 * @deprecated Only exists on the legacy `spring` store, not the `Spring` class
	 */
	update: (fn: Updater<T>, opts?: SpringUpdateOpts) => Promise<void>;
	/**
	 * @deprecated Only exists on the legacy `spring` store, not the `Spring` class
	 */
	subscribe(fn: (value: T) => void): Unsubscriber;
	precision: number;
	damping: number;
	stiffness: number;
}

/**
 * A wrapper for a value that behaves in a spring-like fashion. Changes to `spring.target` will cause `spring.current` to
 * move towards it over time, taking account of the `spring.stiffness` and `spring.damping` parameters.
 *
 * ```svelte
 * <script>
 * 	import { Spring } from 'svelte/motion';
 *
 * 	const spring = new Spring(0);
 * </script>
 *
 * <input type="range" bind:value={spring.target} />
 * <input type="range" bind:value={spring.current} disabled />
 * ```
 * @since 5.8.0
 */
export class Spring<T> {
	constructor(value: T, options?: SpringOpts);

	/**
	 * Create a spring whose value is bound to the return value of `fn`. This must be called
	 * inside an effect root (for example, during component initialisation).
	 *
	 * ```svelte
	 * <script>
	 * 	import { Spring } from 'svelte/motion';
	 *
	 * 	let { number } = $props();
	 *
	 * 	const spring = Spring.of(() => number);
	 * </script>
	 * ```
	 */
	static of<U>(fn: () => U, options?: SpringOpts): Spring<U>;

	/**
	 * Sets `spring.target` to `value` and returns a `Promise` that resolves if and when `spring.current` catches up to it.
	 *
	 * If `options.instant` is `true`, `spring.current` immediately matches `spring.target`.
	 *
	 * If `options.preserveMomentum` is provided, the spring will continue on its current trajectory for
	 * the specified number of milliseconds. This is useful for things like 'fling' gestures.
	 */
	set(value: T, options?: SpringUpdateOpts): Promise<void>;

	damping: number;
	precision: number;
	stiffness: number;
	/**
	 * The end value of the spring.
	 * This property only exists on the `Spring` class, not the legacy `spring` store.
	 */
	target: T;
	/**
	 * The current value of the spring.
	 * This property only exists on the `Spring` class, not the legacy `spring` store.
	 */
	get current(): T;
}

export interface Tweened<T> extends Readable<T> {
	set(value: T, opts?: TweenedOptions<T>): Promise<void>;
	update(updater: Updater<T>, opts?: TweenedOptions<T>): Promise<void>;
}
/** Callback to inform of a value updates. */
export type Subscriber<T> = (value: T) => void;

/** Unsubscribes from value updates. */
export type Unsubscriber = () => void;

/** Readable interface for subscribing. */
export interface Readable<T> {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	subscribe(this: void, run: Subscriber<T>, invalidate?: () => void): Unsubscriber;
}
export interface SpringOpts {
	stiffness?: number;
	damping?: number;
	precision?: number;
}

export interface SpringUpdateOpts {
	/**
	 * @deprecated Only use this for the spring store; does nothing when set on the Spring class
	 */
	hard?: any;
	/**
	 * @deprecated Only use this for the spring store; does nothing when set on the Spring class
	 */
	soft?: string | number | boolean;
	/**
	 * Only use this for the Spring class; does nothing when set on the spring store
	 */
	instant?: boolean;
	/**
	 * Only use this for the Spring class; does nothing when set on the spring store
	 */
	preserveMomentum?: number;
}

export type Updater<T> = (target_value: T, value: T) => T;

export interface TweenedOptions<T> {
	delay?: number;
	duration?: number | ((from: T, to: T) => number);
	easing?: (t: number) => number;
	interpolate?: (a: T, b: T) => (t: number) => T;
}
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
 * @since 5.7.0
 */
export const prefersReducedMotion: MediaQuery;
/**
 * The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.
 *
 * @deprecated Use [`Spring`](https://svelte.dev/docs/svelte/svelte-motion#Spring) instead
 * */
export function spring<T = any>(value?: T | undefined, opts?: SpringOpts | undefined): Spring<T>;
/**
 * A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.
 *
 * @deprecated Use [`Tween`](https://svelte.dev/docs/svelte/svelte-motion#Tween) instead
 * */
export function tweened<T>(value?: T | undefined, defaults?: TweenedOptions<T> | undefined): Tweened<T>;
/**
 * A wrapper for a value that tweens smoothly to its target value. Changes to `tween.target` will cause `tween.current` to
 * move towards it over time, taking account of the `delay`, `duration` and `easing` options.
 *
 * ```svelte
 * <script>
 * 	import { Tween } from 'svelte/motion';
 *
 * 	const tween = new Tween(0);
 * </script>
 *
 * <input type="range" bind:value={tween.target} />
 * <input type="range" bind:value={tween.current} disabled />
 * ```
 * @since 5.8.0
 */
export class Tween<T> {
	/**
	 * Create a tween whose value is bound to the return value of `fn`. This must be called
	 * inside an effect root (for example, during component initialisation).
	 *
	 * ```svelte
	 * <script>
	 * 	import { Tween } from 'svelte/motion';
	 *
	 * 	let { number } = $props();
	 *
	 * 	const tween = Tween.of(() => number);
	 * </script>
	 * ```
	 * 
	 */
	static of<U>(fn: () => U, options?: TweenedOptions<U> | undefined): Tween<U>;
	
	constructor(value: T, options?: TweenedOptions<T>);
	/**
	 * Sets `tween.target` to `value` and returns a `Promise` that resolves if and when `tween.current` catches up to it.
	 *
	 * If `options` are provided, they will override the tween's defaults.
	 * */
	set(value: T, options?: TweenedOptions<T> | undefined): Promise<void>;
	get current(): T;
	set target(v: T);
	get target(): T;
	#private;
}
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
export class MediaQuery extends ReactiveValue<boolean> {
	/**
	 * @param query A media query string
	 * @param fallback Fallback value for the server
	 */
	constructor(query: string, fallback?: boolean | undefined);
}
export class ReactiveValue<T> {
	
	constructor(fn: () => T, onsubscribe: (update: () => void) => void);
	get current(): T;
	#private;
}

export {};

