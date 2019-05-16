import { writable } from 'svelte/store'; // eslint-disable-line import/no-unresolved
import { assign, loop, now } from 'svelte/internal'; // eslint-disable-line import/no-unresolved
import { linear } from 'svelte/easing'; // eslint-disable-line import/no-unresolved
import { is_date } from './utils.js';

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

export function tweened(value, defaults = {}) {
	const store = writable(value);

	let task;
	let target_value = value;

	function set(new_value, opts) {
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

			store.set(value = fn(easing(elapsed / duration)));
			return true;
		});

		return task.promise;
	}

	return {
		set,
		update: (fn, opts) => set(fn(target_value, value), opts),
		subscribe: store.subscribe
	};
}