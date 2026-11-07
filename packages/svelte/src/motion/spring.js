/** @import { Task } from '#client' */
/** @import { TickContext, SpringState } from './private.js' */
/** @import { Spring as SpringStore, SpringOptions, SpringUpdateOptions } from './public.js' */
import { writable } from '../store/shared/index.js';
import { loop } from '../internal/client/loop.js';
import { raf } from '../internal/client/timing.js';
import { is_date } from './utils.js';
import { set, state } from '../internal/client/reactivity/sources.js';
import { render_effect } from '../internal/client/reactivity/effects.js';
import { tag } from '../internal/client/dev/tracing.js';
import { get } from '../internal/client/runtime.js';
import { deferred, noop } from '../internal/shared/utils.js';
import { DEV } from 'esm-env';

/**
 * @template T
 * @param {TickContext} ctx
 * @param {T} last_value
 * @param {T} current_value
 * @param {T} target_value
 * @returns {T}
 */
function tick_spring(ctx, last_value, current_value, target_value) {
	if (typeof current_value === 'number' || is_date(current_value)) {
		// @ts-ignore
		const delta = target_value - current_value;
		// @ts-ignore
		const velocity = current_value - last_value;
		const spring = ctx.opts.stiffness * delta;
		const damper = ctx.opts.damping * velocity;
		const acceleration = (spring - damper) * ctx.inv_mass;
		let d = velocity + acceleration;
		if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
			if (ctx.dt === 1) return target_value; // settled
			d = delta;
		} else {
			ctx.settled = false; // signal loop to keep ticking
		}
		// @ts-ignore
		return is_date(current_value)
			? new Date(current_value.getTime() + d * ctx.dt)
			: current_value + d * ctx.dt;
	} else if (Array.isArray(current_value)) {
		// @ts-ignore
		return current_value.map((_, i) =>
			// @ts-ignore
			tick_spring(ctx, last_value[i], current_value[i], target_value[i])
		);
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

/**
 * Advance the simulation in 60 Hz steps, independently of the rendering frequency.
 * Interpolate towards the next step for frames between simulation ticks, without
 * feeding the interpolated position back into the velocity calculation.
 * @template T
 * @param {TickContext} ctx
 * @param {SpringState<T>} state
 * @param {T} target
 * @param {number} elapsed Time in 60 Hz frames, clamped by the caller
 */
function advance_spring(ctx, state, target, elapsed) {
	state.time += elapsed;
	const steps = Math.floor(state.time + 1e-9);
	// Round away floating-point error at simulation boundaries.
	state.time = Math.max(0, state.time - steps);
	if (state.time < 1e-9) state.time = 0;
	ctx.settled = false;

	for (let i = 0; i < steps; i++) {
		ctx.inv_mass = Math.min(ctx.inv_mass + ctx.recovery_rate, 1);
		ctx.dt = 1;
		ctx.settled = true;
		const next = tick_spring(ctx, state.last, state.current, state.target);
		state.last = state.current;
		state.current = next;

		// A soft or momentum retarget must finish the old step with its original mass, then
		// start recovery before the next step (including within a two-step frame).
		if (state.pending_recovery_rate !== undefined) {
			ctx.inv_mass = 0;
			ctx.recovery_rate = state.pending_recovery_rate;
			state.pending_recovery_rate = undefined;
		}

		const settled = ctx.settled && state.target === target;
		// Keep the target fixed throughout an unfinished simulation step.
		state.target = target;
		ctx.settled = settled;
		if (settled) {
			state.time = 0;
			return next;
		}
	}

	if (state.time > 0) {
		const inv_mass = ctx.inv_mass;
		ctx.inv_mass = Math.min(inv_mass + ctx.recovery_rate, 1);
		ctx.dt = state.time;
		const next = tick_spring(ctx, state.last, state.current, state.target);
		ctx.inv_mass = inv_mass;
		// Only completed simulation steps can settle the spring.
		ctx.settled = false;
		return next;
	}

	return state.current;
}

/**
 * The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.
 *
 * @deprecated Use [`Spring`](https://svelte.dev/docs/svelte/svelte-motion#Spring) instead
 * @template [T=any]
 * @param {T} [value]
 * @param {SpringOptions} [opts]
 * @returns {SpringStore<T>}
 */
export function spring(value, opts = {}) {
	const store = writable(value);
	const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
	/** @type {number} */
	let last_time;
	/** @type {Task | null} */
	let task;
	/** @type {object} */
	let current_token;

	/** @type {SpringState<T>} */
	let spring_state = {
		last: /** @type {T} */ (value),
		current: /** @type {T} */ (value),
		target: /** @type {T} */ (value),
		time: 0
	};
	let target_value = /** @type {T | undefined} */ (value);

	let inv_mass = 1;
	let inv_mass_recovery_rate = 0;
	let cancel_task = false;
	/** @param {number} now */
	function advance(now) {
		// An earlier task in the same frame may have sampled a newer input time.
		now = Math.max(now, last_time);
		// clamp elapsed time to 1/30th of a second, so that longer pauses
		// (blocked thread or inactive tab) don't cause the spring to go haywire
		const elapsed = Math.min(now - last_time, 1000 / 30);

		/** @type {TickContext} */
		const ctx = {
			inv_mass,
			recovery_rate: inv_mass_recovery_rate,
			opts: spring,
			settled: true,
			dt: 1
		};
		const next = advance_spring(
			ctx,
			spring_state,
			/** @type {T} */ (target_value),
			(elapsed * 60) / 1000
		);
		inv_mass = ctx.inv_mass;
		inv_mass_recovery_rate = ctx.recovery_rate;
		last_time = now;
		return { next, settled: ctx.settled };
	}

	/**
	 * @param {T} new_value
	 * @param {SpringUpdateOptions} opts
	 * @returns {Promise<void>}
	 */
	function set(new_value, opts = {}) {
		// Sample the old target up to the input time, even between RAF callbacks.
		if (task && !opts.hard) advance(raf.now());
		target_value = new_value;
		if (spring_state.time === 0) spring_state.target = new_value;
		const token = (current_token = {});
		if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
			cancel_task = true; // cancel any running animation
			last_time = raf.now();
			spring_state = { last: new_value, current: new_value, target: new_value, time: 0 };
			store.set((value = target_value));
			return Promise.resolve();
		} else if (opts.soft) {
			const rate = opts.soft === true ? 0.5 : +opts.soft;
			const recovery_rate = 1 / (rate * 60);
			if (spring_state.time > 0) {
				spring_state.pending_recovery_rate = recovery_rate;
			} else {
				inv_mass_recovery_rate = recovery_rate;
				inv_mass = 0; // infinite mass, unaffected by spring forces
			}
		}
		if (!task) {
			last_time = raf.now();
			cancel_task = false;
			task = loop((now) => {
				if (cancel_task) {
					cancel_task = false;
					task = null;
					return false;
				}

				const { next, settled } = advance(now);
				store.set((value = next));
				if (settled) {
					task = null;
				}
				return !settled;
			});
		}
		return new Promise((fulfil) => {
			/** @type {Task} */ (task).promise.then(() => {
				if (token === current_token) fulfil();
			});
		});
	}
	/** @type {SpringStore<T>} */
	// @ts-expect-error - class-only properties are missing
	const spring = {
		set,
		update: (fn, opts) => set(fn(/** @type {T} */ (target_value), /** @type {T} */ (value)), opts),
		subscribe: store.subscribe,
		stiffness,
		damping,
		precision
	};
	return spring;
}

/**
 * A wrapper for a value that behaves in a spring-like fashion. Changes to `spring.target` will cause `spring.current` to
 * move towards it over time, taking account of the `spring.stiffness` and `spring.damping` parameters.
 *
 * ```svelte
 * <script>
 * 	import { Spring } from 'svelte/motion';
 *
 * 	const spring = new Spring(0);
 * </script>
 *
 * <input type="range" bind:value={spring.target} />
 * <input type="range" bind:value={spring.current} disabled />
 * ```
 * @template T
 * @since 5.8.0
 */
export class Spring {
	#stiffness = state(0.15);
	#damping = state(0.8);
	#precision = state(0.01);

	#current;
	#target;

	/** @type {SpringState<T> | null} */
	#spring_state = null;
	#last_time = 0;

	#inverse_mass = 1;
	#momentum = 0;
	#recovery_rate = 0;

	/** @type {import('../internal/client/types').Task | null} */
	#task = null;

	/** @type {ReturnType<typeof deferred> | null} */
	#deferred = null;

	/**
	 * @param {T} value
	 * @param {SpringOptions} [options]
	 */
	constructor(value, options = {}) {
		this.#current = DEV ? tag(state(value), 'Spring.current') : state(value);
		this.#target = DEV ? tag(state(value), 'Spring.target') : state(value);

		if (typeof options.stiffness === 'number') this.#stiffness.v = clamp(options.stiffness, 0, 1);
		if (typeof options.damping === 'number') this.#damping.v = clamp(options.damping, 0, 1);
		if (typeof options.precision === 'number') this.#precision.v = options.precision;

		if (DEV) {
			tag(this.#stiffness, 'Spring.stiffness');
			tag(this.#damping, 'Spring.damping');
			tag(this.#precision, 'Spring.precision');
			tag(this.#current, 'Spring.current');
			tag(this.#target, 'Spring.target');
		}
	}

	/**
	 * Create a spring whose value is bound to the return value of `fn`. This must be called
	 * inside an effect root (for example, during component initialisation).
	 *
	 * ```svelte
	 * <script>
	 * 	import { Spring } from 'svelte/motion';
	 *
	 * 	let { number } = $props();
	 *
	 * 	const spring = Spring.of(() => number);
	 * </script>
	 * ```
	 * @template U
	 * @param {() => U} fn
	 * @param {SpringOptions} [options]
	 */
	static of(fn, options) {
		const spring = new Spring(fn(), options);

		render_effect(() => {
			spring.set(fn());
		});

		return spring;
	}

	/** @param {number} now */
	#advance(now) {
		// An earlier task in the same frame may have sampled a newer input time.
		now = Math.max(now, this.#last_time);
		// clamp elapsed time to 1/30th of a second, so that longer pauses
		// (blocked thread or inactive tab) don't cause the spring to go haywire
		const elapsed = Math.min(now - this.#last_time, 1000 / 30);

		/** @type {import('./private').TickContext} */
		const ctx = {
			inv_mass: this.#inverse_mass,
			recovery_rate: this.#recovery_rate,
			opts: {
				stiffness: this.#stiffness.v,
				damping: this.#damping.v,
				precision: this.#precision.v
			},
			settled: true,
			dt: 1
		};

		var next = advance_spring(
			ctx,
			/** @type {SpringState<T>} */ (this.#spring_state),
			this.#target.v,
			(elapsed * 60) / 1000
		);
		this.#inverse_mass = ctx.inv_mass;
		this.#last_time = now;
		return { next, settled: ctx.settled };
	}

	/** @param {T} value */
	#update(value) {
		set(this.#target, value);

		this.#current.v ??= value;
		this.#spring_state ??= {
			last: this.#current.v,
			current: this.#current.v,
			target: value,
			time: 0
		};
		if (this.#spring_state.time === 0) this.#spring_state.target = value;

		if (!this.#task) {
			this.#last_time = raf.now();

			this.#recovery_rate = 1000 / (this.#momentum * 60);

			this.#task ??= loop((now) => {
				const { next, settled } = this.#advance(now);
				set(this.#current, next);

				if (settled) {
					this.#task = null;
				}

				return !settled;
			});
		}

		return this.#task.promise;
	}

	/**
	 * Sets `spring.target` to `value` and returns a `Promise` that resolves if and when `spring.current` catches up to it.
	 *
	 * If `options.instant` is `true`, `spring.current` immediately matches `spring.target`.
	 *
	 * If `options.preserveMomentum` is provided, the spring will continue on its current trajectory for
	 * the specified number of milliseconds. This is useful for things like 'fling' gestures.
	 *
	 * @param {T} value
	 * @param {SpringUpdateOptions} [options]
	 */
	set(value, options) {
		this.#deferred?.reject(new Error('Aborted'));

		if (options?.instant || this.#current.v === undefined) {
			this.#task?.abort();
			this.#task = null;
			set(this.#current, set(this.#target, value));
			this.#spring_state = { last: value, current: value, target: value, time: 0 };
			return Promise.resolve();
		}

		if (this.#task) this.#advance(raf.now());

		if (options?.preserveMomentum) {
			if (this.#task && this.#spring_state?.time) {
				this.#spring_state.pending_recovery_rate = this.#recovery_rate;
			} else {
				this.#inverse_mass = 0;
			}
			this.#momentum = options.preserveMomentum;
		}

		var d = (this.#deferred = deferred());
		d.promise.catch(noop);

		this.#update(value).then(() => {
			if (d !== this.#deferred) return;
			d.resolve(undefined);
		});

		return d.promise;
	}

	get current() {
		return get(this.#current);
	}

	get damping() {
		return get(this.#damping);
	}

	set damping(v) {
		set(this.#damping, clamp(v, 0, 1));
	}

	get precision() {
		return get(this.#precision);
	}

	set precision(v) {
		set(this.#precision, v);
	}

	get stiffness() {
		return get(this.#stiffness);
	}

	set stiffness(v) {
		set(this.#stiffness, clamp(v, 0, 1));
	}

	get target() {
		return get(this.#target);
	}

	set target(v) {
		this.set(v);
	}
}

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n));
}
