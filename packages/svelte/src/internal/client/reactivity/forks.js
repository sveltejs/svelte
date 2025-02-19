/** @import { Effect, Source } from '#client' */

import { flush_sync } from '../runtime.js';
import { internal_set } from './sources.js';

/** @type {Set<Fork>} */
const forks = new Set();

/** @type {Fork | null} */
export let active_fork = null;

let uid = 1;

export class Fork {
	id = uid++;

	/** @type {Map<Source, any>} */
	previous = new Map();

	/** @type {Set<Effect>} */
	skipped_effects = new Set();

	#pending = 0;

	/**
	 * @param {Source} source
	 * @param {any} value
	 */
	capture(source, value) {
		if (!this.previous.has(source)) {
			this.previous.set(source, value);
		}
	}

	/**
	 *
	 * @param {() => void} fn
	 */
	flush(fn) {
		var values = new Map();

		for (const fork of forks) {
			if (fork === this) continue;

			for (const [source, previous] of fork.previous) {
				if (this.previous.has(source)) continue;

				values.set(source, source.v);
				source.v = previous;
				// internal_set(source, previous);
			}
		}

		try {
			fn();
		} finally {
			for (const [source, value] of values) {
				// internal_set(source, value);
				source.v = value;
			}
		}
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
	}

	/**
	 * @param {() => void} fn
	 */
	run(fn) {
		active_fork = this;

		flush_sync(fn);

		active_fork = null;
	}

	increment() {
		this.#pending += 1;
	}

	decrement() {
		this.#pending -= 1;
	}

	settled() {
		return this.#pending === 0;
	}

	static ensure() {
		if (active_fork === null) {
			active_fork = new Fork();
			forks.add(active_fork); // TODO figure out where we remove this
		}

		return active_fork;
	}

	static unset() {
		active_fork = null;
	}
}
