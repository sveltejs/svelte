/** @import { Effect, Source } from '#client' */
import { DIRTY } from '#client/constants';
import { noop } from '../../shared/utils.js';
import { flushSync } from '../runtime.js';
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
	// internal_set(pending, batches.size > 0);
}

let uid = 1;

export class Batch {
	id = uid++;

	/** @type {Map<Source, any>} */
	previous = new Map();

	/** @type {Map<Source, any>} */
	current = new Map();

	/** @type {Set<Effect>} */
	skipped_effects = new Set();

	/** @type {Set<() => void>} */
	#callbacks = new Set();

	pending = 0;

	apply() {
		if (batches.size === 1) {
			// if this is the latest (and only) batch, we have nothing to do
			return noop;
		}

		var current_values = new Map();

		// TODO this shouldn't be necessary, but tests fail otherwise,
		// presumably because we need a try-finally somewhere
		for (const [source, current] of this.current) {
			source.v = current;
		}

		for (const batch of batches) {
			if (batch === this) continue;

			for (const [source, previous] of batch.previous) {
				if (!this.previous.has(source)) {
					// mark_reactions(source, DIRTY);
					current_values.set(source, source.v);
					source.v = previous;
				}
			}
		}

		return () => {
			for (const [source, value] of current_values) {
				source.v = value;
			}
		};
	}

	/**
	 * @param {Source} source
	 * @param {any} value
	 */
	capture(source, value) {
		if (!this.previous.has(source)) {
			this.previous.set(source, value);
		}

		this.current.set(source, source.v);
	}

	remove() {
		batches.delete(this);

		for (var batch of batches) {
			if (batch.id < this.id) {
				// other batch is older than this
				for (var source of this.previous.keys()) {
					batch.previous.delete(source);
				}
			} else {
				// other batch is newer than this
				for (var source of batch.previous.keys()) {
					if (this.previous.has(source)) {
						batch.previous.set(source, source.v);
					}
				}
			}
		}

		update_pending();
	}

	/**
	 * @param {() => void} fn
	 */
	run(fn) {
		current_batch = this;
		fn();
	}

	increment() {
		this.pending += 1;
	}

	decrement() {
		this.pending -= 1;
	}

	settled() {
		return this.pending === 0;
	}

	/** @param {() => void} fn */
	add_callback(fn) {
		this.#callbacks.add(fn);
	}

	commit() {
		for (const fn of this.#callbacks) {
			fn();
		}

		this.#callbacks.clear();
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
