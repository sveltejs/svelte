/** @import { Effect, Source } from '#client' */
import { DIRTY } from '#client/constants';
import { noop } from '../../shared/utils.js';
import { flushSync } from '../runtime.js';
import { raf } from '../timing.js';
import { internal_set, mark_reactions, pending } from './sources.js';

/** @type {Set<Fork>} */
const forks = new Set();

/** @type {Fork | null} */
export let active_fork = null;

export function remove_active_fork() {
	active_fork = null;
}

/** Update `$effect.pending()` */
function update_pending() {
	// internal_set(pending, forks.size > 0);
}

let uid = 1;

export class Fork {
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
		if (forks.size === 1) {
			// if this is the latest (and only) fork, we have nothing to do
			return noop;
		}

		var current_values = new Map();

		for (const source of this.previous.keys()) {
			// mark_reactions(source, DIRTY);
			current_values.set(source, source.v);
		}

		for (const [source, current] of this.current) {
			source.v = current;
		}

		for (const fork of forks) {
			if (fork === this) continue;

			for (const [source, previous] of fork.previous) {
				if (!current_values.has(source)) {
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
		forks.delete(this);

		for (var fork of forks) {
			if (fork.id < this.id) {
				// other fork is older than this
				for (var source of this.previous.keys()) {
					fork.previous.delete(source);
				}
			} else {
				// other fork is newer than this
				for (var source of fork.previous.keys()) {
					if (this.previous.has(source)) {
						fork.previous.set(source, source.v);
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
		active_fork = this;
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
		if (active_fork === null) {
			if (forks.size === 0) {
				raf.tick(update_pending);
			}

			active_fork = new Fork();
			forks.add(active_fork); // TODO figure out where we remove this
		}

		return active_fork;
	}
}
