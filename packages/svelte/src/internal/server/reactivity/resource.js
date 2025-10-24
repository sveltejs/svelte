/** @import { Resource as ResourceType } from '#shared' */

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {ResourceType<T>}
 */
export function resource(fn) {
	return /** @type {ResourceType<T>} */ (new Resource(fn));
}

/**
 * @template T
 * @implements {Partial<Promise<T>>}
 */
class Resource {
	/** @type {Promise<void>} */
	#promise;
	#ready = false;
	#loading = true;

	/** @type {T | undefined} */
	#current = undefined;
	#error = undefined;

	/**
	 * @param {() => Promise<T>} fn
	 */
	constructor(fn) {
		this.#promise = Promise.resolve(fn()).then(
			(val) => {
				this.#ready = true;
				this.#loading = false;
				this.#current = val;
				this.#error = undefined;
			},
			(error) => {
				this.#error = error;
				this.#loading = false;
			}
		);
	}

	get then() {
		// @ts-expect-error
		return (onfulfilled, onrejected) =>
			this.#promise.then(
				() => onfulfilled?.(this.#current),
				() => onrejected?.(this.#error)
			);
	}

	get catch() {
		return (/** @type {any} */ onrejected) => this.then(undefined, onrejected);
	}

	get finally() {
		return (/** @type {any} */ onfinally) => this.then(onfinally, onfinally);
	}

	get current() {
		return this.#current;
	}

	get error() {
		return this.#error;
	}

	/**
	 * Returns true if the resource is loading or reloading.
	 */
	get loading() {
		return this.#loading;
	}

	/**
	 * Returns true once the resource has been loaded for the first time.
	 */
	get ready() {
		return this.#ready;
	}

	refresh = () => {
		throw new Error('TODO Cannot refresh a resource on the server');
	};

	/**
	 * @param {T} value
	 */
	set = (value) => {
		this.#ready = true;
		this.#loading = false;
		this.#error = undefined;
		this.#current = value;
		this.#promise = Promise.resolve();
	};
}
