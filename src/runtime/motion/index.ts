import { SpringMotion, TweenMotion, now, run_duration } from 'svelte/internal';
import { numbers } from 'svelte/interpolate';
interface TweenParams<T> {
	delay?: number;
	duration?: number | ((from: T, to: T) => number);
	easing?: (t: number) => number;
	interpolate?: (from: T, to: T) => (t: number) => T;
}
interface SpringParams {
	stiffness?: number /* { 10 < 100 < 200 } */;
	damping?: number /* { 1 < 10 < 20 } */;
	mass?: number /* { 0.1 < 1 < 20 } */;
	precision?: number /* = 0.001 */;
	soft?: boolean /* disables damping */;
}

function solve_spring(
	prev_value: number,
	prev_velocity: number,
	target_value: number,
	{ stiffness, mass, damping, soft }: SpringParams
) {
	const delta = target_value - prev_value;
	if (soft || 1 <= damping / (2.0 * Math.sqrt(stiffness * mass))) {
		const angular_frequency = -Math.sqrt(stiffness / mass);
		return (t: number) =>
			target_value - (delta + t * (-angular_frequency * delta - prev_velocity)) * Math.exp(t * angular_frequency);
	} else {
		const damping_frequency = Math.sqrt(4.0 * mass * stiffness - damping ** 2);
		const leftover = (damping * delta - 2.0 * mass * prev_velocity) / damping_frequency;
		const dfm = (0.5 * damping_frequency) / mass;
		const dm = -(0.5 * damping) / mass;
		let f = 0.0;
		return (t: number) => target_value - (Math.cos((f = t * dfm)) * delta + Math.sin(f) * leftover) * Math.exp(t * dm);
	}
}

export function spring(
	value?,
	{ mass = 1.0, damping = 10.0, stiffness = 100.0, precision = 0.001, soft = false }: SpringParams = {}
) {
	const store = new SpringMotion(value, (set) => {
		let velocity = 0.0,
			calc;
		return (from_value, to_value) => {
			calc = solve_spring(from_value, velocity, to_value, obj);
			return (current, elapsed, dt) =>
				precision > Math.abs((velocity = (-current + (current = calc(elapsed))) / dt)) &&
				precision > Math.abs(to_value - current)
					? (set(to_value), !!(velocity = 0.0))
					: (set(current), true);
		};
	});
	const obj = {
		mass,
		damping,
		stiffness,
		precision,
		soft,
		set(next_value, params?: SpringParams) {
			if (params) {
				if ('mass' in params) obj.mass = params.mass;
				if ('damping' in params) obj.damping = params.damping;
				if ('stiffness' in params) obj.stiffness = params.stiffness;
				if ('precision' in params) obj.precision = params.precision;
				if ('soft' in params) obj.soft = params.soft;
			}
			return store.set(next_value);
		},
		setImmediate: store.setImmediate.bind(store),
		subscribe: store.subscribe.bind(store),
		onRest: store.onRest.bind(store),
	};
	return obj;
}
export function tweened<T>(
	value?: T,
	{
		delay: default_delay = 0,
		duration: default_duration = 400,
		easing: default_easing = (v) => v,
		interpolate: default_interpolate = numbers,
	}: TweenParams<T> = {}
) {
	let delay = default_delay,
		duration = default_duration,
		easing = default_easing,
		interpolate = default_interpolate;
	const store = new TweenMotion(value, (set) => {
		let end_time = 0,
			this_duration = 0,
			calc;
		return (from_value: T, to_value: T) => {
			end_time = now() + delay + (this_duration = run_duration(duration, from_value, to_value));
			calc = interpolate(from_value, to_value);
			return (t) => {
				t = 1 - (end_time - t) / this_duration;
				if (t >= 1) return set(calc(easing(1))), false;
				if (t >= 0) set(calc(easing(t)));
				return true;
			};
		};
	});
	const set = (next_value, params) => {
		delay = (params && params.delay) || default_delay;
		duration = +((params && 'duration' in params) || default_duration);
		easing = (params && params.easing) || default_easing;
		interpolate = (params && params.interpolate) || default_interpolate;
		return store.set(next_value);
	};
	return {
		set,
		/* todo: test update() with objects */
		update: (fn, params) => set(fn(store.value, value), params),
		setImmediate: store.setImmediate.bind(store),
		subscribe: store.subscribe.bind(store),
		onRest: store.onRest.bind(store),
	};
}
