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

interface Options<T> {
	delay?: number;
	duration?: number | ((from: T, to: T) => number)
	easing?: (t: number) => number;
	interpolate?: (a: T, b: T) => (t: number) => T
}

type Updater<T> = (target_value: T, value: T) => T;

interface Tweened<T> extends Readable<T> {
	set(value: T, opts: Options<T>): Promise<void>;

	update(updater: Updater<T>, opts: Options<T>): Promise<void>;
}

export function tweened<T>(value: T, defaults: Options<T> = {}):Tweened<T> {
	const store = writable(value);

	let task: Task;
	let target_value = value;

	function set(new_value: T, opts: Options<T>) {
		target_value = new_value;

		let previous_task = task;
		let started = false;

		let {
			delay = 0,
			duration = 400,
			easing = linear,
			interpolate = get_interpolator
		} = assign(assign({}, defaults), opts);

		const start = now() + delay;
		let fn;

		task = loop(now => {
			if (now < start) return true;

			if (!started) {
				fn = interpolate(value, new_value);
				if (typeof duration === 'function') duration = duration(value, new_value);
				started = true;
			}

			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}

			const elapsed = now - start;

			if (elapsed > duration) {
				store.set(value = new_value);
				return false;
			}

			// @ts-ignore
			store.set(value = fn(easing(elapsed / duration)));
			return true;
		});

		return task.promise;
	}

	return {
		set,
		update: (fn, opts:Options<T>) => set(fn(target_value, value), opts),
		subscribe: store.subscribe
	};
}
