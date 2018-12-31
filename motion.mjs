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
		update: (fn, opts) => set(fn(target_value, value), opts),
		subscribe: store.subscribe
	};
}

function get_initial_velocity(value) {
	if (typeof value === 'number' || is_date(value)) return 0;

	if (Array.isArray(value)) return value.map(get_initial_velocity);

	if (value && typeof value === 'object') {
		const velocities = {};
		for (const k in value) velocities[k] = get_initial_velocity(value[k]);
		return velocities;
	}

	throw new Error(`Cannot spring ${typeof value} values`);
}

function get_threshold(value, target_value, precision) {
	if (typeof value === 'number' || is_date(value)) return precision * Math.abs((target_value - value));

	if (Array.isArray(value)) return value.map((v, i) => get_threshold(v, target_value[i], precision));

	if (value && typeof value === 'object') {
		const threshold = {};
		for (const k in value) threshold[k] = get_threshold(value[k], target_value[k], precision);
		return threshold;
	}

	throw new Error(`Cannot spring ${typeof value} values`);
}

function tick_spring(velocity, current_value, target_value, stiffness, damping, multiplier, threshold) {
	let settled = true;
	let value;

	if (typeof current_value === 'number' || is_date(current_value)) {
		const delta = target_value - current_value;
		const spring = stiffness * delta;
		const damper = damping * velocity;

		const acceleration = spring - damper;

		velocity += acceleration;
		const d = velocity * multiplier;

		if (is_date(current_value)) {
			value = new Date(current_value.getTime() + d);
		} else {
			value = current_value + d;
		}

		if (Math.abs(d) > threshold) settled = false;
	}

	else if (Array.isArray(current_value)) {
		value = current_value.map((v, i) => {
			const result = tick_spring(
				velocity[i],
				v,
				target_value[i],
				stiffness,
				damping,
				multiplier,
				threshold[i]
			);

			velocity[i] = result.velocity;
			if (!result.settled) settled = false;
			return result.value;
		});
	}

	else if (typeof current_value === 'object') {
		value = {};
		for (const k in current_value) {
			const result = tick_spring(
				velocity[k],
				current_value[k],
				target_value[k],
				stiffness,
				damping,
				multiplier,
				threshold[k]
			);

			velocity[k] = result.velocity;
			if (!result.settled) settled = false;
			value[k] = result.value;
		}
	}

	else {
		throw new Error(`Cannot spring ${typeof value} values`);
	}

	return { velocity, value, settled };
}

export function spring(value, opts = {}) {
	const store = writable(value);

	const { stiffness = 0.15, damping = 0.8 } = opts;
	const velocity = get_initial_velocity(value);

	let task;
	let target_value = value;
	let last_time;
	let settled;
	let threshold;

	function set(new_value) {
		target_value = new_value;
		threshold = get_threshold(value, target_value, 0.000001); // TODO make precision configurable?

		if (!task) {
			last_time = window.performance.now();
			settled = false;

			task = add_task(() => {
				const time = window.performance.now();

				({ value, settled } = tick_spring(
					velocity,
					value,
					target_value,
					spring.stiffness,
					spring.damping,
					(time - last_time) * 60 / 1000,
					threshold
				));

				last_time = time;

				if (settled) {
					value = target_value;
					task = null;
				}

				store.set(value);
				return !settled;
			});
		}

		return task.promise;
	}

	const spring = {
		set,
		update: fn => set(fn(target_value, value)),
		subscribe: store.subscribe,
		stiffness,
		damping
	};

	return spring;
}