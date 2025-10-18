/** @import { Source, Derived } from '#client' */
import { state, derived, set, get, tick } from '../../index.js';
import { deferred } from '../../../shared/utils.js';

/**
 * @template T
 * @implements {Partial<Promise<T>>}
 */
export class Resource {
	#init = false;

	/** @type {() => Promise<T>} */
	#fn;

	/** @type {Source<boolean>} */
	#loading = state(true);

	/** @type {Array<(...args: any[]) => void>} */
	#latest = [];

	/** @type {Source<boolean>} */
	#ready = state(false);

	/** @type {Source<T | undefined>} */
	#raw = state(undefined);

	/** @type {Source<Promise<any>>} */
	#promise;

	/** @type {Derived<T | undefined>} */
	#current = derived(() => {
		if (!get(this.#ready)) return undefined;
		return get(this.#raw);
	});

	/** {@type Source<any>} */
	#error = state(undefined);

	/** @type {Derived<Promise<T>['then']>} */
	// @ts-expect-error - I feel this might actually be incorrect but I can't prove it yet.
	// we are technically not returning a promise that resolves to the correct type... but it _is_ a promise that resolves at the correct time
	#then = derived(() => {
		const p = get(this.#promise);

		return async (resolve, reject) => {
			try {
				await p;
				await tick();

				resolve?.(/** @type {T} */ (get(this.#current)));
			} catch (error) {
				reject?.(error);
			}
		};
	});

	/**
	 * @param {() => Promise<T>} fn
	 */
	constructor(fn) {
		this.#fn = fn;
		this.#promise = state(this.#run());
	}

	#run() {
		if (this.#init) {
			tick().then(() => {
				// opt this out of async coordination
				set(this.#loading, true);
			});
		} else {
			this.#init = true;
		}

		const { resolve, reject, promise } = deferred();

		this.#latest.push(resolve);

		Promise.resolve(this.#fn())
			.then((value) => {
				// Skip the response if resource was refreshed with a later promise while we were waiting for this one to resolve
				const idx = this.#latest.indexOf(resolve);
				if (idx === -1) return;

				this.#latest.splice(0, idx).forEach((r) => r());
				set(this.#ready, true);
				set(this.#loading, false);
				set(this.#raw, value);
				set(this.#error, undefined);

				resolve(undefined);
			})
			.catch((e) => {
				const idx = this.#latest.indexOf(resolve);
				if (idx === -1) return;

				this.#latest.splice(0, idx).forEach((r) => r());
				set(this.#error, e);
				set(this.#loading, false);
				reject(e);
			});

		return promise;
	}

	get then() {
		return get(this.#then);
	}

	get catch() {
		get(this.#then);
		return (/** @type {any} */ reject) => {
			return get(this.#then)(undefined, reject);
		};
	}

	get finally() {
		get(this.#then);
		return (/** @type {any} */ fn) => {
			return get(this.#then)(
				() => fn(),
				() => fn()
			);
		};
	}

	get current() {
		return get(this.#current);
	}

	get error() {
		return get(this.#error);
	}

	/**
	 * Returns true if the resource is loading or reloading.
	 */
	get loading() {
		return get(this.#loading);
	}

	/**
	 * Returns true once the resource has been loaded for the first time.
	 */
	get ready() {
		return get(this.#ready);
	}

	/**
	 * @returns {Promise<void>}
	 */
	refresh = async () => {
		const promise = this.#run();
		set(this.#promise, promise);
		await promise;
	};

	/**
	 * @param {T} value
	 */
	set = (value) => {
		set(this.#ready, true);
		set(this.#loading, false);
		set(this.#error, undefined);
		set(this.#raw, value);
		set(this.#promise, Promise.resolve());
	};
}
