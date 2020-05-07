import { SpringMotion, TweenMotion, now } from 'svelte/internal';
import { is_date } from './utils';

function solve_spring(
	prev_value: number,
	prev_velocity: number,
	target_value: number,
	{ stiffness, mass, damping, soft }
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
export function spring(value, { mass = 1.0, damping = 10.0, stiffness = 100.0, precision = 0.001, soft = false } = {}) {
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
		set(next_value, params) {
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
function tween_between(a, b) {
	if (a === b || a !== a) return () => a;
	else if (typeof a === 'number') {
		return (t) => a + t * (b-a);
	} else if (is_date(a) && is_date(b)) {
		a = a.getTime();
		b = b.getTime();
		const delta = b - a;
		return (t) => new Date(a + t * delta);
	} else throw new Error(`Cannot interpolate ${typeof a} values`);
}
export function tween(
	value,
	{
		delay: default_delay = 0,
		duration: default_duration = 400,
		easing: default_easing = (v) => v,
		interpolate: default_interpolate = tween_between,
	}
) {
	let delay = default_delay,
		duration = default_duration,
		easing = default_easing,
		interpolate = default_interpolate;
	const store = new TweenMotion(value, (set) => {
		let end_time = 0,
			calc;
		return (from_value, to_value) => {
			end_time = now() + delay + duration;
			calc = interpolate(from_value, to_value);
			return (t) => {
				t = 1 - (end_time - t) / duration;
				if (t >= 1) return set(calc(easing(1))),  false;
				if (t >= 0) set(calc(easing(t)));
				return true;
			};
		};
	});
	function set(next_value, params) {
		delay = (params && params.delay) || default_delay;
		duration = (params && 'duration' in params && params.duration) || default_duration;
		easing = (params && params.easing) || default_easing;
		interpolate = (params && params.interpolate) || default_interpolate;
		return store.set(next_value);
	}
	return {
		set,
		// update: (fn, params) => set(fn(target_value, value), params),
		setImmediate: store.setImmediate.bind(store),
		subscribe: store.subscribe.bind(store),
		onRest: store.onRest.bind(store),
	};
}
