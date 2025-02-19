/** @import { Effect, Source } from '#client' */

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

	enable() {
		active_fork = this;
		// TODO revert other forks
	}

	disable() {
		active_fork = null;
		// TODO restore state
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
		return (active_fork ??= new Fork());
	}

	static unset() {
		active_fork = null;
	}
}
