import { createSubscriber } from './create-subscriber.js';

/**
 * @template T
 */
export class ReactiveValue {
	#fn;
	#subscribe;

	/**
	 *
	 * @param {() => T} fn
	 * @param {(update: () => void) => void} onsubscribe
	 */
	constructor(fn, onsubscribe) {
		this.#fn = fn;
		this.#subscribe = createSubscriber(onsubscribe);
	}

	get current() {
		this.#subscribe();
		return this.#fn();
	}
}
