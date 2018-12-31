import { writable } from './store';
import { assign } from './internal';
import { linear } from './easing';

const tasks = new Set();
let running = false;

function run_tasks() {
	tasks.forEach(task => {
		if (!task[0]()) {
			tasks.delete(task);
			task[1]();
		}
	});

	running = tasks.size > 0;
	if (running) requestAnimationFrame(run_tasks);
}

function add_task(fn) {
	let task;

	if (!running) {
		running = true;
		requestAnimationFrame(run_tasks);
	}

	return {
		promise: new Promise(fulfil => {
			tasks.add(task = [fn, fulfil]);
		}),
		abort() {
			tasks.delete(task);
		}
	};
}

function is_date(obj) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}

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

		const start = window.performance.now() + delay;
		let fn;

		task = add_task(() => {
			const time = window.performance.now();
			if (time < start) return true;

			if (!started) {
				fn = interpolate(value, new_value);
				if (typeof duration === 'function') duration = duration(value, new_value);
				started = true;
			}

			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}

			const elapsed = time - start;

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
		update: fn => set(fn(target_value, value)),
		subscribe: store.subscribe
	};
}