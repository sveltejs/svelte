import { writable } from 'svelte/store';
import { loop } from 'svelte/internal';
import { is_date } from './utils.js';

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

			task = loop(() => {
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