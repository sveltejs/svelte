import { Readable, writable } from 'svelte/store';
import { assign, loop, now, Task } from 'svelte/internal';
import { linear } from 'svelte/easing';
import { is_date } from './utils';

function get_interpolator(a, b) {
	if (a === b || a !== a) return () => a;

	const type = typeof a;

	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
		throw new Error('Cannot interpolate values of different type');
	}

	if (Array.isArray(a)) {
		const arr = b.map((bi, i) => {
			return get_interpolator(a[i], bi);
		});

		return t => arr.map(fn => fn(t));
	}

	if (type === 'object') {
		if (!a || !b) throw new Error('Object cannot be null');

		if (is_date(a) && is_date(b)) {
			a = a.getTime();
			b = b.getTime();
			const delta = b - a;
			return t => new Date(a + t * delta);
		}

		const keys = Object.keys(b);
		const interpolators = {};

		keys.forEach(key => {
			interpolators[key] = get_interpolator(a[key], b[key]);
		});

		return t => {
			const result = {};
			keys.forEach(key => {
				result[key] = interpolators[key](t);
			});
			return result;
		};
	}

	if (type === 'number') {
		const delta = b - a;
		return t => a + t * delta;
	}

	throw new Error(`Cannot interpolate ${type} values`);
}

export interface TweenedOptions<T> {
	/**(`number`, default 0) — milliseconds before starting */ 
	delay?: number;
	/** (`number` | `function`, default 400) — milliseconds the tween lasts*/
	duration?: number | ((from: T, to: T) => number);
	/** (`function`, default `t => t`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing) */
	easing?: (t: number) => number;
	/**
	 * (`function`) —   it allows you to tween between *any* arbitrary values. It must be an `(a, b) => t => value` function, where `a` is the starting value, `b` is the target value, `t` is a number between 0 and 1, and `value` is the result. For example, we can use the [d3-interpolate](https://github.com/d3/d3-interpolate) package to smoothly interpolate between two colours
	 */
	interpolate?: (a: T, b: T) => (t: number) => T;
}

export type TweenedUpdater<T> = (target_value: T, value: T) => T;

export interface Tweened<T> extends Readable<T> {
	set(value: T, opts?: TweenedOptions<T>): Promise<void>;

	update(updater: TweenedUpdater<T>, opts?: TweenedOptions<T>): Promise<void>;
}

/**
 * Tweened stores update their values over a fixed duration. The following options are available:
 * 
 * * `delay` (`number`, default 0) — milliseconds before starting
 * * `duration` (`number` | `function`, default 400) — milliseconds the tween lasts
 * * `easing` (`function`, default `t => t`) — an [easing function](https://svelte.dev/docs#run-time-svelte-easing)
 * * `interpolate` (`function`) — see below
 * 
 * `store.set` and `store.update` can accept a second `options` argument that will override the options passed in upon instantiation.
 * 
 * Both functions return a Promise that resolves when the tween completes. If the tween is interrupted, the promise will never resolve.
 * 
 * ---
 * 
 * Out of the box, Svelte will interpolate between two numbers, two arrays or two objects (as long as the arrays and objects are the same 'shape', and their 'leaf' properties are also numbers).
 * 
 * ```html
 * <script>
 * 	import { tweened } from 'svelte/motion';
 * 	import { cubicOut } from 'svelte/easing';
 * 
 * 	const size = tweened(1, {
 * 		duration: 300,
 * 		easing: cubicOut
 * 	});
 * 
 * 	function handleClick() {
 * 		// this is equivalent to size.update(n => n + 1)
 * 		$size += 1;
 * 	}
 * </script>
 * 
 * <button
 * 	on:click={handleClick}
 * 	style="transform: scale({$size}); transform-origin: 0 0"
 * >embiggen</button>
 * ```
 * 
 * ---
 * 
 * If the initial value is `undefined` or `null`, the first value change will take effect immediately. This is useful when you have tweened values that are based on props, and don't want any motion when the component first renders.
 * 
 * ```ts
 * const size = tweened(undefined, {
 * 	duration: 300,
 * 	easing: cubicOut
 * });
 * 
 * $: $size = big ? 100 : 10;
 * ```
 * 
 * ---
 * 
 * The `interpolate` option allows you to tween between *any* arbitrary values. It must be an `(a, b) => t => value` function, where `a` is the starting value, `b` is the target value, `t` is a number between 0 and 1, and `value` is the result. For example, we can use the [d3-interpolate](https://github.com/d3/d3-interpolate) package to smoothly interpolate between two colours.
 * 
 * ```html
 * <script>
 * 	import { interpolateLab } from 'd3-interpolate';
 * 	import { tweened } from 'svelte/motion';
 * 
 * 	const colors = [
 * 		'rgb(255, 62, 0)',
 * 		'rgb(64, 179, 255)',
 * 		'rgb(103, 103, 120)'
 * 	];
 * 
 * 	const color = tweened(colors[0], {
 * 		duration: 800,
 * 		interpolate: interpolateLab
 * 	});
 * </script>
 * 
 * {#each colors as c}
 * 	<button
 * 		style="background-color: {c}; color: white; border: none;"
 * 		on:click="{e => color.set(c)}"
 * 	>{c}</button>
 * {/each}
 * 
 * <h1 style="color: {$color}">{$color}</h1>
 * ```
 * 
 * @param initialValue 
 * @param defaults 
 * @returns tweened store
 */
export function tweened<T>(initialValue?: T, defaults: TweenedOptions<T> = {}): Tweened<T> {
	const store = writable(initialValue);

	let task: Task;
	let target_value = initialValue;

	function set(new_value: T, opts?: TweenedOptions<T>) {
		if (initialValue == null) {
			store.set(initialValue = new_value);
			return Promise.resolve();
		}

		target_value = new_value;

		let previous_task = task;
		let started = false;

		let {
			delay = 0,
			duration = 400,
			easing = linear,
			interpolate = get_interpolator
		} = assign(assign({}, defaults), opts);

		if (duration === 0) {
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}

			store.set(initialValue = target_value);
			return Promise.resolve();
		}

		const start = now() + delay;
		let fn;

		task = loop(now => {
			if (now < start) return true;

			if (!started) {
				fn = interpolate(initialValue, new_value);
				if (typeof duration === 'function') duration = duration(initialValue, new_value);
				started = true;
			}

			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}

			const elapsed = now - start;

			if (elapsed > duration) {
				store.set(initialValue = new_value);
				return false;
			}

			// @ts-ignore
			store.set(initialValue = fn(easing(elapsed / duration)));
			return true;
		});

		return task.promise;
	}

	return {
		set,
		update: (fn, opts?: TweenedOptions<T>) => set(fn(target_value, initialValue), opts),
		subscribe: store.subscribe
	};
}
