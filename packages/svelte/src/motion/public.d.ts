import { Readable, type Unsubscriber } from '../store/public.js';

export interface SpringOptions {
	stiffness?: number;
	damping?: number;
	precision?: number;
}

export interface SpringUpdateOptions {
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

export interface TweenOptions<T> {
	delay?: number;
	duration?: number | ((from: T, to: T) => number);
	easing?: (t: number) => number;
	interpolate?: (a: T, b: T) => (t: number) => T;
}

// TODO we do declaration merging here in order to not have a breaking change (renaming the Spring interface)
// this means both the Spring class and the Spring interface are merged into one with some things only
// existing on one side. In Svelte 6, remove the type definition and move the jsdoc onto the class in spring.js

export interface Spring<T> extends Readable<T> {
	set(new_value: T, opts?: SpringUpdateOptions): Promise<void>;
	/**
	 * @deprecated Only exists on the legacy `spring` store, not the `Spring` class
	 */
	update: (fn: Updater<T>, opts?: SpringUpdateOptions) => Promise<void>;
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
	constructor(value: T, options?: SpringOptions);

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
	static of<U>(fn: () => U, options?: SpringOptions): Spring<U>;

	/**
	 * Sets `spring.target` to `value` and returns a `Promise` that resolves if and when `spring.current` catches up to it.
	 *
	 * If `options.instant` is `true`, `spring.current` immediately matches `spring.target`.
	 *
	 * If `options.preserveMomentum` is provided, the spring will continue on its current trajectory for
	 * the specified number of milliseconds. This is useful for things like 'fling' gestures.
	 */
	set(value: T, options?: SpringUpdateOptions): Promise<void>;

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
	set(value: T, opts?: TweenOptions<T>): Promise<void>;
	update(updater: Updater<T>, opts?: TweenOptions<T>): Promise<void>;
}

export { prefersReducedMotion, spring, tweened, Tween } from './index.js';
