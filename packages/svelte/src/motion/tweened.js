/** @import { Task } from '../internal/client/types' */
/** @import { Tweened } from './public' */
/** @import { TweenedOptions } from './private' */
import { writable } from '../store/shared/index.js';
import { raf } from '../internal/client/timing.js';
import { loop } from '../internal/client/loop.js';
import { linear } from '../easing/index.js';
import { is_date } from './utils.js';
import { set, source } from '../internal/client/reactivity/sources.js';
import { get, render_effect } from 'svelte/internal/client';

/**
 * @template T
 * @param {T} a
 * @param {T} b
 * @returns {(t: number) => T}
 */
function get_interpolator(a, b) {
	if (a === b || a !== a) return () => a;

	const type = typeof a;
	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
		throw new Error('Cannot interpolate values of different type');
	}

	if (Array.isArray(a)) {
		const arr = /** @type {Array<any>} */ (b).map((bi, i) => {
			return get_interpolator(/** @type {Array<any>} */ (a)[i], bi);
		});

		// @ts-ignore
		return (t) => arr.map((fn) => fn(t));
	}

	if (type === 'object') {
		if (!a || !b) {
			throw new Error('Object cannot be null');
		}

		if (is_date(a) && is_date(b)) {
			const an = a.getTime();
			const bn = b.getTime();
			const delta = bn - an;

			// @ts-ignore
			return (t) => new Date(an + t * delta);
		}

		const keys = Object.keys(b);

		/** @type {Record<string, (t: number) => T>} */
		const interpolators = {};
		keys.forEach((key) => {
			// @ts-ignore
			interpolators[key] = get_interpolator(a[key], b[key]);
		});

		// @ts-ignore
		return (t) => {
			/** @type {Record<string, any>} */
			const result = {};
			keys.forEach((key) => {
				result[key] = interpolators[key](t);
			});
			return result;
		};
	}

	if (type === 'number') {
		const delta = /** @type {number} */ (b) - /** @type {number} */ (a);
		// @ts-ignore
		return (t) => a + t * delta;
	}

	throw new Error(`Cannot interpolate ${type} values`);
}

/**
 * A tweened store in Svelte is a special type of store that provides smooth transitions between state values over time.
 *
 * @deprecated Use [`Tween`](https://svelte.dev/docs/svelte/svelte-motion#Tween) instead
 * @template T
 * @param {T} [value]
 * @param {TweenedOptions<T>} [defaults]
 * @returns {Tweened<T>}
 */
export function tweened(value, defaults = {}) {
	const store = writable(value);
	/** @type {Task} */
	let task;
	let target_value = value;
	/**
	 * @param {T} new_value
	 * @param {TweenedOptions<T>} [opts]
	 */
	function set(new_value, opts) {
		target_value = new_value;

		if (value == null) {
			store.set((value = new_value));
			return Promise.resolve();
		}

		/** @type {Task | null} */
		let previous_task = task;

		let started = false;
		let {
			delay = 0,
			duration = 400,
			easing = linear,
			interpolate = get_interpolator
		} = { ...defaults, ...opts };

		if (duration === 0) {
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}
			store.set((value = target_value));
			return Promise.resolve();
		}

		const start = raf.now() + delay;

		/** @type {(t: number) => T} */
		let fn;
		task = loop((now) => {
			if (now < start) return true;
			if (!started) {
				fn = interpolate(/** @type {any} */ (value), new_value);
				if (typeof duration === 'function')
					duration = duration(/** @type {any} */ (value), new_value);
				started = true;
			}
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}
			const elapsed = now - start;
			if (elapsed > /** @type {number} */ (duration)) {
				store.set((value = new_value));
				return false;
			}
			// @ts-ignore
			store.set((value = fn(easing(elapsed / duration))));
			return true;
		});
		return task.promise;
	}
	return {
		set,
		update: (fn, opts) =>
			set(fn(/** @type {any} */ (target_value), /** @type {any} */ (value)), opts),
		subscribe: store.subscribe
	};
}

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
 * @template T
 * @since 5.8.0
 */
export class Tween {
	#current = source(/** @type {T} */ (undefined));
	#target = source(/** @type {T} */ (undefined));

	/** @type {TweenedOptions<T>} */
	#defaults;

	/** @type {import('../internal/client/types').Task | null} */
	#task = null;

	/**
	 * @param {T} value
	 * @param {TweenedOptions<T>} options
	 */
	constructor(value, options = {}) {
		this.#current.v = this.#target.v = value;
		this.#defaults = options;
	}

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
	 * @template U
	 * @param {() => U} fn
	 * @param {TweenedOptions<U>} [options]
	 */
	static of(fn, options) {
		const tween = new Tween(fn(), options);

		render_effect(() => {
			tween.set(fn());
		});

		return tween;
	}

	/**
	 * Sets `tween.target` to `value` and returns a `Promise` that resolves if and when `tween.current` catches up to it.
	 *
	 * If `options` are provided, they will override the tween's defaults.
	 * @param {T} value
	 * @param {TweenedOptions<T>} [options]
	 * @returns
	 */
	set(value, options) {
		set(this.#target, value);

		let previous_value = this.#current.v;
		let previous_task = this.#task;

		let started = false;
		let {
			delay = 0,
			duration = 400,
			easing = linear,
			interpolate = get_interpolator
		} = { ...this.#defaults, ...options };

		const start = raf.now() + delay;

		/** @type {(t: number) => T} */
		let fn;

		this.#task = loop((now) => {
			if (now < start) {
				return true;
			}

			if (!started) {
				started = true;

				fn = interpolate(/** @type {any} */ (previous_value), value);

				if (typeof duration === 'function') {
					duration = duration(/** @type {any} */ (previous_value), value);
				}

				previous_task?.abort();
			}

			const elapsed = now - start;

			if (elapsed > /** @type {number} */ (duration)) {
				set(this.#current, value);
				return false;
			}

			set(this.#current, fn(easing(elapsed / /** @type {number} */ (duration))));
			return true;
		});

		return this.#task.promise;
	}

	get current() {
		return get(this.#current);
	}

	get target() {
		return get(this.#target);
	}

	set target(v) {
		this.set(v);
	}
}
