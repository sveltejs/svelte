/** @import { Task } from '#client' */
/** @import { SpringOpts, SpringUpdateOpts, TickContext } from './private.js' */
/** @import { Spring as SpringStore } from './public.js' */
import { writable } from '../store/shared/index.js';
import { loop } from '../internal/client/loop.js';
import { raf } from '../internal/client/timing.js';
import { is_date } from './utils.js';
import { set, source } from '../internal/client/reactivity/sources.js';
import { render_effect } from '../internal/client/reactivity/effects.js';
import { get } from '../internal/client/runtime.js';
import { deferred, noop } from '../internal/shared/utils.js';

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
			return is_date(current_value) ? new Date(current_value.getTime() + d) : current_value + d;
		}
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
 * The spring function in Svelte creates a store whose value is animated, with a motion that simulates the behavior of a spring. This means when the value changes, instead of transitioning at a steady rate, it "bounces" like a spring would, depending on the physics parameters provided. This adds a level of realism to the transitions and can enhance the user experience.
 *
 * @deprecated Use [`Spring`](https://svelte.dev/docs/svelte/svelte-motion#Spring) instead
 * @template [T=any]
 * @param {T} [value]
 * @param {SpringOpts} [opts]
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

	let last_value = /** @type {T} */ (value);
	let target_value = /** @type {T | undefined} */ (value);

	let inv_mass = 1;
	let inv_mass_recovery_rate = 0;
	let cancel_task = false;
	/**
	 * @param {T} new_value
	 * @param {SpringUpdateOpts} opts
	 * @returns {Promise<void>}
	 */
	function set(new_value, opts = {}) {
		target_value = new_value;
		const token = (current_token = {});
		if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
			cancel_task = true; // cancel any running animation
			last_time = raf.now();
			last_value = new_value;
			store.set((value = target_value));
			return Promise.resolve();
		} else if (opts.soft) {
			const rate = opts.soft === true ? 0.5 : +opts.soft;
			inv_mass_recovery_rate = 1 / (rate * 60);
			inv_mass = 0; // infinite mass, unaffected by spring forces
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
				inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);

				// clamp elapsed time to 1/30th of a second, so that longer pauses
				// (blocked thread or inactive tab) don't cause the spring to go haywire
				const elapsed = Math.min(now - last_time, 1000 / 30);

				/** @type {TickContext} */
				const ctx = {
					inv_mass,
					opts: spring,
					settled: true,
					dt: (elapsed * 60) / 1000
				};
				// @ts-ignore
				const next_value = tick_spring(ctx, last_value, value, target_value);
				last_time = now;
				last_value = /** @type {T} */ (value);
				store.set((value = /** @type {T} */ (next_value)));
				if (ctx.settled) {
					task = null;
				}
				return !ctx.settled;
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
	#stiffness = source(0.15);
	#damping = source(0.8);
	#precision = source(0.01);

	#current = source(/** @type {T} */ (undefined));
	#target = source(/** @type {T} */ (undefined));

	#last_value = /** @type {T} */ (undefined);
	#last_time = 0;

	#inverse_mass = 1;
	#momentum = 0;

	/** @type {import('../internal/client/types').Task | null} */
	#task = null;

	/** @type {ReturnType<typeof deferred> | null} */
	#deferred = null;

	/**
	 * @param {T} value
	 * @param {SpringOpts} [options]
	 */
	constructor(value, options = {}) {
		this.#current.v = this.#target.v = value;

		if (typeof options.stiffness === 'number') this.#stiffness.v = clamp(options.stiffness, 0, 1);
		if (typeof options.damping === 'number') this.#damping.v = clamp(options.damping, 0, 1);
		if (typeof options.precision === 'number') this.#precision.v = options.precision;
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
	 * @param {SpringOpts} [options]
	 */
	static of(fn, options) {
		const spring = new Spring(fn(), options);

		render_effect(() => {
			spring.set(fn());
		});

		return spring;
	}

	/** @param {T} value */
	#update(value) {
		set(this.#target, value);

		this.#current.v ??= value;
		this.#last_value ??= this.#current.v;

		if (!this.#task) {
			this.#last_time = raf.now();

			var inv_mass_recovery_rate = 1000 / (this.#momentum * 60);

			this.#task ??= loop((now) => {
				this.#inverse_mass = Math.min(this.#inverse_mass + inv_mass_recovery_rate, 1);

				// clamp elapsed time to 1/30th of a second, so that longer pauses
				// (blocked thread or inactive tab) don't cause the spring to go haywire
				const elapsed = Math.min(now - this.#last_time, 1000 / 30);

				/** @type {import('./private').TickContext} */
				const ctx = {
					inv_mass: this.#inverse_mass,
					opts: {
						stiffness: this.#stiffness.v,
						damping: this.#damping.v,
						precision: this.#precision.v
					},
					settled: true,
					dt: (elapsed * 60) / 1000
				};

				var next = tick_spring(ctx, this.#last_value, this.#current.v, this.#target.v);
				this.#last_value = this.#current.v;
				this.#last_time = now;
				set(this.#current, next);

				if (ctx.settled) {
					this.#task = null;
				}

				return !ctx.settled;
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
	 * @param {SpringUpdateOpts} [options]
	 */
	set(value, options) {
		this.#deferred?.reject(new Error('Aborted'));

		if (options?.instant || this.#current.v === undefined) {
			this.#task?.abort();
			this.#task = null;
			set(this.#current, set(this.#target, value));
			this.#last_value = value;
			return Promise.resolve();
		}

		if (options?.preserveMomentum) {
			this.#inverse_mass = 0;
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
