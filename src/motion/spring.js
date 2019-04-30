import { writable } from 'svelte/store'; // eslint-disable-line import/no-unresolved
import { loop } from 'svelte/internal'; // eslint-disable-line import/no-unresolved
import { is_date } from './utils.js';

function tick_spring(ctx, last_value, current_value, target_value) {
	if (typeof current_value === 'number' || is_date(current_value)) {
		const delta = target_value - current_value;
		const velocity = (current_value - last_value) / (ctx.dt||1/60); // guard div by 0
		const spring = ctx.opts.stiffness * delta;
		const damper = ctx.opts.damping * velocity;
		const acceleration = (spring - damper) * ctx.inv_mass;
		const d = (velocity + acceleration) * ctx.dt;

		if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
			return target_value; // settled
		} else {
			ctx.settled = false; // signal loop to keep ticking
			return is_date(current_value) ?
				new Date(current_value.getTime() + d) : current_value + d;
		}
	} else if (Array.isArray(current_value)) {
		return current_value.map((_, i) => 
			tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
	} else if (typeof current_value === 'object') {
		let next_value = {};
		for (const k in current_value)
			next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
		return next_value;
	} else {
		throw new Error(`Cannot spring ${typeof value} values`);
	}
}

export function spring(value, opts = {}) {
	const store = writable(value);
	const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;

	let last_time, task, current_token;
	let last_value = value;
	let target_value = value;

	let inv_mass = 1;
	let inv_mass_recovery_rate = 0;
	let cancel_task = false;

	function set(new_value, opts = {}) {
		target_value = new_value;
		const token = current_token = {};
		
		if (opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
			cancel_task = true; // cancel any running animation
			last_time = window.performance.now();
			last_value = value;
			store.set(value = target_value);
			return new Promise(f => f()); // fulfil immediately
		} else if (opts.soft) {
			let rate = opts.soft === true ? .5 : +opts.soft;
			inv_mass_recovery_rate = 1 / (rate * 60);
			inv_mass = 0; // infinite mass, unaffected by spring forces
		}

		if (!task) {
			last_time = window.performance.now();
			cancel_task = false;
			
			task = loop(now => {
				
				if (cancel_task) {
					cancel_task = false;
					task = null;
					return false;
				}
				
				inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);

				const ctx = {
					inv_mass,
					opts: spring,
					settled: true, // tick_spring may signal false
					dt: (now - last_time) * 60 / 1000
				};
				const next_value = tick_spring(ctx, last_value, value, target_value);

				last_time = now;
				last_value = value;
				store.set(value = next_value);

				if (ctx.settled)
					task = null;
				return !ctx.settled;
			});
		}

		return new Promise(fulfil => {
			task.promise.then(() => {
				if (token === current_token) fulfil();
			});
		});
	}

	const spring = {
		set,
		update: (fn, opts) => set(fn(target_value, value), opts),
		subscribe: store.subscribe,
		stiffness,
		damping,
		precision
	};

	return spring;
}
