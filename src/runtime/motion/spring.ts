import { Store, onEachFrame } from 'svelte/internal';

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
class MotionStore<T> extends Store<T> {
	elapsed = 0.0;
	running = false;
	setTick: (prev_value: T, next_value: T) => (current_value: T, elapsed: number, dt: number) => boolean;
	tick: (current_value: T, elapsed: number, dt: number) => boolean;
	constructor(value, startSetTick) {
		super(value);
		this.setTick = startSetTick(super.set.bind(this));
	}
	set(next_value: T) {
		this.elapsed = 0.0;
		this.tick = this.setTick(this.value, next_value);
		if (this.running) return;
		else this.running = true;
		onEachFrame((dt) => (this.running = this.tick(this.value, (this.elapsed += dt), dt)));
	}
}
export function spring(value, params) {
	const { mass = 1.0, damping = 10.0, stiffness = 100.0, precision = 0.001, soft = false } = params || {};
	return new MotionStore(
		value,
		parseStructure(value, (set) => {
			let velocity = 0.0,
				calc;
			return (from_value, to_value) => {
				calc = solve_spring(from_value, velocity, to_value, { mass, damping, stiffness, soft });
				return (current, elapsed, dt) =>
					precision > Math.abs((velocity = (-current + (current = calc(elapsed))) / dt)) &&
					precision > Math.abs(to_value - current)
						? (set(to_value), !!(velocity = 0.0))
						: (set(current), true);
			};
		})
	);
}
function parseStructure(obj, schema) {
	if (typeof obj === 'object' && obj !== null) {
		const keys = Object.keys(obj);
		let i = 0,
			k = '',
			setTickers = keys.map((key) => parseStructure(obj[key], schema)((next_value) => (obj[key] = next_value))),
			tickers,
			pending = 0;
		const target = { ...obj };
		const isArray = Array.isArray(obj);
		obj = isArray ? [...obj] : { ...obj };
		return (set) => (_from_value, to_value) => {
			for (k in to_value) if (to_value[k] !== obj[k]) target[k] = to_value[k];
			tickers = setTickers.map((setTicker, i) => ((pending |= 1 << i), setTicker(obj[keys[i]], target[keys[i]])));
			return (_current, elapsed, dt) => {
				for (i = 0; i < tickers.length; i++)
					if (pending & (1 << i) && !tickers[i](obj[keys[i]], elapsed, dt)) pending &= ~(1 << i);
				set(isArray ? [...obj] : { ...obj });
				return !!pending;
			};
		};
	}
	return schema;
}
