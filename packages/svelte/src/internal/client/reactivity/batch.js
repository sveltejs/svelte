/** @import { Effect, Source } from '#client' */
import { CLEAN, DIRTY } from '#client/constants';
import {
	flush_queued_effects,
	process_effects,
	schedule_effect,
	set_queued_root_effects,
	set_signal_status,
	update_effect
} from '../runtime.js';
import { raf } from '../timing.js';
import { internal_set, mark_reactions, pending } from './sources.js';

/** @type {Set<Batch>} */
const batches = new Set();

/** @type {Batch | null} */
export let current_batch = null;

export function remove_current_batch() {
	current_batch = null;
}

/** Update `$effect.pending()` */
function update_pending() {
	internal_set(pending, batches.size > 0);
}

let uid = 1;

export class Batch {
	#id = uid++;

	/** @type {Map<Source, any>} */
	#previous = new Map();

	/** @type {Map<Source, any>} */
	#current = new Map();

	/** @type {Set<() => void>} */
	#callbacks = new Set();

	#pending = 0;

	/** @type {Effect[]} */
	async_effects = [];

	/** @type {Effect[]} */
	render_effects = [];

	/** @type {Effect[]} */
	effects = [];

	/** @type {Set<Effect>} */
	skipped_effects = new Set();

	apply() {}

	/**
	 *
	 * @param {Effect[]} root_effects
	 */
	process(root_effects) {
		set_queued_root_effects([]);

		var current_values = new Map();

		for (const batch of batches) {
			if (batch === this) continue;

			for (const [source, previous] of batch.#previous) {
				if (!this.#current.has(source)) {
					current_values.set(source, source.v);
					source.v = previous;
				}
			}
		}

		for (const [source, current] of this.#current) {
			// TODO this shouldn't be necessary, but tests fail otherwise,
			// presumably because we need a try-finally somewhere, and the
			// source wasn't correctly reverted after the previous batch
			source.v = current;
		}

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

		for (const root of root_effects) {
			process_effects(this, root);
		}

		if (this.async_effects.length === 0 && this.settled()) {
			var render_effects = this.render_effects;
			var effects = this.effects;

			this.render_effects = [];
			this.effects = [];

			this.commit();

			flush_queued_effects(render_effects);
			flush_queued_effects(effects);
		} else {
			for (const e of this.render_effects) set_signal_status(e, CLEAN);
			for (const e of this.effects) set_signal_status(e, CLEAN);

			for (const [source, value] of current_values) {
				source.v = value;
			}

			for (const effect of this.async_effects) {
				update_effect(effect);
			}

			this.async_effects = [];
		}
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

		for (var batch of batches) {
			if (batch.#id < this.#id) {
				// other batch is older than this
				for (var source of this.#previous.keys()) {
					batch.#previous.delete(source);
				}
			} else {
				// other batch is newer than this
				for (var source of batch.#previous.keys()) {
					if (this.#previous.has(source)) {
						batch.#previous.set(source, source.v);
					}
				}
			}
		}
	}

	/**
	 * @param {() => void} fn
	 */
	run(fn) {
		current_batch = this;
		fn();
	}

	commit() {
		// commit changes
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
			this.commit();
		}
	}

	settled() {
		return this.#pending === 0;
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

			current_batch = new Batch();
			batches.add(current_batch);
		}

		return current_batch;
	}
}
