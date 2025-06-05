/** @import { Derived, Effect, Source } from '#client' */
import { CLEAN, DIRTY } from '#client/constants';
import {
	flush_queued_effects,
	flush_queued_root_effects,
	process_effects,
	schedule_effect,
	set_queued_root_effects,
	set_signal_status,
	update_effect
} from '../runtime.js';
import { raf } from '../timing.js';
import { internal_set, pending } from './sources.js';

/** @type {Set<Batch>} */
const batches = new Set();

/** @type {Batch | null} */
export let current_batch = null;

/** Update `$effect.pending()` */
function update_pending() {
	internal_set(pending, batches.size > 0);
}

/** @type {Map<Derived, any> | null} */
export let batch_deriveds = null;

/** TODO handy for debugging, but we should probably eventually delete it */
let uid = 1;

export class Batch {
	id = uid++;

	/** @type {Map<Source, any>} */
	#previous = new Map();

	/** @type {Map<Source, any>} */
	#current = new Map();

	/** @type {Set<() => void>} */
	#callbacks = new Set();

	#pending = 0;

	/** @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null} */
	// TODO replace with Promise.withResolvers once supported widely enough
	deferred = null;

	/** @type {Effect[]} */
	async_effects = [];

	/** @type {Effect[]} */
	render_effects = [];

	/** @type {Effect[]} */
	effects = [];

	/** @type {Set<Effect>} */
	skipped_effects = new Set();

	/**
	 *
	 * @param {Effect[]} root_effects
	 */
	process(root_effects) {
		set_queued_root_effects([]);

		/** @type {Map<Source, { v: unknown, wv: number }> | null} */
		var current_values = null;
		var time_travelling = false;

		for (const batch of batches) {
			if (batch !== this) {
				time_travelling = true;
				break;
			}
		}

		if (time_travelling) {
			current_values = new Map();
			batch_deriveds = new Map();

			for (const [source, current] of this.#current) {
				current_values.set(source, { v: source.v, wv: source.wv });
				source.v = current;
			}

			for (const batch of batches) {
				if (batch === this) continue;

				for (const [source, previous] of batch.#previous) {
					if (!current_values.has(source)) {
						current_values.set(source, { v: source.v, wv: source.wv });
						source.v = previous;
					}
				}
			}
		}

		for (const root of root_effects) {
			process_effects(this, root);
		}

		if (this.async_effects.length === 0 && this.#pending === 0) {
			var merged = false;

			// if there are older batches with overlapping
			// state, we can't commit this batch. instead,
			// we merge it into the older batches
			for (const batch of batches) {
				if (batch === this) break;

				for (const [source] of batch.#current) {
					if (this.#current.has(source)) {
						merged = true;

						for (const [source, value] of this.#current) {
							batch.#current.set(source, value);
							// TODO what about batch.#previous?
						}

						for (const e of this.render_effects) {
							set_signal_status(e, CLEAN);
							// TODO use sets instead of arrays
							if (!batch.render_effects.includes(e)) {
								batch.render_effects.push(e);
							}
						}

						for (const e of this.effects) {
							set_signal_status(e, CLEAN);
							// TODO use sets instead of arrays
							if (!batch.effects.includes(e)) {
								batch.effects.push(e);
							}
						}

						for (const e of this.skipped_effects) {
							batch.skipped_effects.add(e);
						}

						for (const fn of this.#callbacks) {
							batch.#callbacks.add(fn);
						}

						this.remove();
						break;
					}
				}
			}

			if (merged) {
				this.remove();
			} else {
				var render_effects = this.render_effects;
				var effects = this.effects;

				this.render_effects = [];
				this.effects = [];

				this.commit();

				flush_queued_effects(render_effects);
				flush_queued_effects(effects);

				this.deferred?.resolve();
			}
		} else {
			for (const e of this.render_effects) set_signal_status(e, CLEAN);
			for (const e of this.effects) set_signal_status(e, CLEAN);
		}

		if (current_values) {
			for (const [source, { v, wv }] of current_values) {
				// reset the source to the current value (unless
				// it got a newer value as a result of effects running)
				if (source.wv <= wv) {
					source.v = v;
				}
			}

			batch_deriveds = null;
		}

		for (const effect of this.async_effects) {
			update_effect(effect);
		}

		this.async_effects = [];
	}

	/**
	 * @param {Source} source
	 * @param {any} value
	 */
	capture(source, value) {
		if (!this.#previous.has(source)) {
			this.#previous.set(source, value);
		}

		this.#current.set(source, source.v);
	}

	remove() {
		batches.delete(this);
	}

	restore() {
		current_batch = this;
	}

	flush() {
		flush_queued_root_effects();

		if (current_batch !== this) {
			return;
		}

		if (this.#pending === 0) {
			this.remove();
		}

		current_batch = null;
	}

	commit() {
		for (const fn of this.#callbacks) {
			fn();
		}

		this.#callbacks.clear();

		raf.tick(update_pending);
	}

	increment() {
		this.#pending += 1;
	}

	decrement() {
		this.#pending -= 1;

		if (this.#pending === 0) {
			for (const e of this.render_effects) {
				set_signal_status(e, DIRTY);
				schedule_effect(e);
			}

			for (const e of this.effects) {
				set_signal_status(e, DIRTY);
				schedule_effect(e);
			}

			this.render_effects = [];
			this.effects = [];

			this.commit();
		}
	}

	/** @param {() => void} fn */
	add_callback(fn) {
		this.#callbacks.add(fn);
	}

	static ensure() {
		if (current_batch === null) {
			if (batches.size === 0) {
				raf.tick(update_pending);
			}

			const batch = (current_batch = new Batch());
			batches.add(current_batch);

			queueMicrotask(() => {
				if (current_batch !== batch) {
					// a flushSync happened in the meantime
					return;
				}

				batch.flush();
			});
		}

		return current_batch;
	}
}
