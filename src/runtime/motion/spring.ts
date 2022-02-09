import { Readable, writable } from 'svelte/store';
import { loop, now, Task } from 'svelte/internal';
import { is_date } from './utils';

interface TickContext<T> {
	inv_mass: number;
	dt: number;
	opts: Spring<T>;
	settled: boolean;
}

function tick_spring<T>(ctx: TickContext<T>, last_value: T, current_value: T, target_value: T): T {
	if (typeof current_value === 'number' || is_date(current_value)) {
		// @ts-ignore
		const delta = target_value - current_value;
		// @ts-ignore
		const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
		const spring = ctx.opts.stiffness * delta;
		const damper = ctx.opts.damping * velocity;
		const acceleration = (spring - damper) * ctx.inv_mass;
		const d = (velocity + acceleration) * ctx.dt;

		if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
			return target_value; // settled
		} else {
			ctx.settled = false; // signal loop to keep ticking
			// @ts-ignore
			return is_date(current_value) ?
				new Date(current_value.getTime() + d) : current_value + d;
		}
	} else if (Array.isArray(current_value)) {
		// @ts-ignore
		return current_value.map((_, i) =>
			tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
	} else if (typeof current_value === 'object') {
		const next_value = {};
		for (const k in current_value) {
			// @ts-ignore
			next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
		}
		// @ts-ignore
		return next_value;
	} else {
		throw new Error(`Cannot spring ${typeof current_value} values`);
	}
}

export interface SpringOptions {
	/**(`number`, default `0.15`) — a value between 0 and 1 where higher means a 'tighter' spring */
	stiffness?: number;
	/**(`number`, default `0.8`) — a value between 0 and 1 where lower means a 'springier' spring */
	damping?: number;
	/**(`number`, default `0.01`) — determines the threshold at which the spring is considered to have 'settled', where lower means more precise */
	precision?: number;
}

export interface SpringUpdateOptions {
	/**`{ hard: true }` sets the target value immediately */
	hard?: any;
	/** `{ soft: n }` preserves existing momentum for `n` seconds before settling. `{ soft: true }` is equivalent to `{ soft: 0.5 }` */
	soft?: string | number | boolean;
}

export type SpringUpdater<T> = (target_value: T, value: T) => T;

export interface Spring<T> extends Readable<T>{
	set: (new_value: T, opts?: SpringUpdateOptions) => Promise<void>;
	update: (fn: SpringUpdater<T>, opts?: SpringUpdateOptions) => Promise<void>;
	/**(`number`, default `0.15`) — a value between 0 and 1 where higher means a 'tighter' spring */
	stiffness: number;
	/**(`number`, default `0.8`) — a value between 0 and 1 where lower means a 'springier' spring */
	damping: number;
	/**(`number`, default `0.01`) — determines the threshold at which the spring is considered to have 'settled', where lower means more precise */
	precision: number;
}
/**
 * 
 * ```ts
 * store = spring(value: any, options)
 * ```
 * 
 * A `spring` store gradually changes to its target value based on its `stiffness` and `damping` parameters. Whereas `tweened` stores change their values over a fixed duration, `spring` stores change over a duration that is determined by their existing velocity, allowing for more natural-seeming motion in many situations. The following options are available:
 * 
 * * `stiffness` (`number`, default `0.15`) — a value between 0 and 1 where higher means a 'tighter' spring
 * * `damping` (`number`, default `0.8`) — a value between 0 and 1 where lower means a 'springier' spring
 * * `precision` (`number`, default `0.01`) — determines the threshold at which the spring is considered to have 'settled', where lower means more precise
 * 
 * ---
 * 
 * As with [`tweened`](https://svelte.dev/docs#run-time-svelte-motion-tweened) stores, `set` and `update` return a Promise that resolves if the spring settles. The `store.stiffness` and `store.damping` properties can be changed while the spring is in motion, and will take immediate effect.
 * 
 * Both `set` and `update` can take a second argument — an object with `hard` or `soft` properties. `{ hard: true }` sets the target value immediately; `{ soft: n }` preserves existing momentum for `n` seconds before settling. `{ soft: true }` is equivalent to `{ soft: 0.5 }`.
 * 
 * [See a full example on the spring tutorial.](https://svelte.dev/tutorial/spring)
 * 
 * ```html
 * <script>
 * 	import { spring } from 'svelte/motion';
 * 
 * 	const coords = spring({ x: 50, y: 50 }, {
 * 		stiffness: 0.1,
 * 		damping: 0.25
 * 	});
 * </script>
 * ```
 * 
 * ---
 * 
 * If the initial value is `undefined` or `null`, the first value change will take effect immediately, just as with `tweened` values (see above).
 * 
 * ```ts
 * const size = spring();
 * $: $size = big ? 100 : 10;
 * ```
 * 
 * @param initialValue 
 * @param opts 
 * @returns spring store
 */
export function spring<T=any>(initialValue?: T, opts: SpringOptions = {}): Spring<T> {
	const store = writable(initialValue);
	const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;

	let last_time: number;
	let task: Task;
	let current_token: object;
	let last_value: T = initialValue;
	let target_value: T = initialValue;

	let inv_mass = 1;
	let inv_mass_recovery_rate = 0;
	let cancel_task = false;

	function set(new_value: T, opts: SpringUpdateOptions = {}): Promise<void> {
		target_value = new_value;
		const token = current_token = {};

		if (initialValue == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
			cancel_task = true; // cancel any running animation
			last_time = now();
			last_value = new_value;
			store.set(initialValue = target_value);
			return Promise.resolve();
		} else if (opts.soft) {
			const rate = opts.soft === true ? .5 : +opts.soft;
			inv_mass_recovery_rate = 1 / (rate * 60);
			inv_mass = 0; // infinite mass, unaffected by spring forces
		}

		if (!task) {
			last_time = now();
			cancel_task = false;

			task = loop(now => {

				if (cancel_task) {
					cancel_task = false;
					task = null;
					return false;
				}

				inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);

				const ctx: TickContext<T> = {
					inv_mass,
					opts: spring,
					settled: true, // tick_spring may signal false
					dt: (now - last_time) * 60 / 1000
				};
				const next_value = tick_spring(ctx, last_value, initialValue, target_value);

				last_time = now;
				last_value = initialValue;
				store.set(initialValue = next_value);

				if (ctx.settled) {
					task = null;
				}
				return !ctx.settled;
			});
		}

		return new Promise(fulfil => {
			task.promise.then(() => {
				if (token === current_token) fulfil();
			});
		});
	}

	const spring: Spring<T> = {
		set,
		update: (fn, opts: SpringUpdateOptions) => set(fn(target_value, initialValue), opts),
		subscribe: store.subscribe,
		stiffness,
		damping,
		precision
	};

	return spring;
}
