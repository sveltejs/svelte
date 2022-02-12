import { run_all, subscribe, noop, safe_not_equal, is_function, get_store_value } from 'svelte/internal';

/** Callback to inform of a value updates. */
export type Subscriber<T> = (value: T) => void;

/** Unsubscribes from value updates. */
export type Unsubscriber = () => void;

/** Callback to update a value. */
export type Updater<T> = (value: T) => T;

/** Cleanup logic callback. */
type Invalidator<T> = (value?: T) => void;

/** Start and stop notification callbacks. */
export type StartStopNotifier<T> = (set: Subscriber<T>) => Unsubscriber | void;

/** Readable interface for subscribing. */
export interface Readable<T> {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
}

/** Writable interface for both updating and subscribing. */
export interface Writable<T> extends Readable<T> {
	/**
	 * Set value and inform subscribers.
	 * @param value to set
	 */
	set(this: void, value: T): void;

	/**
	 * Update value using callback and inform subscribers.
	 * @param updater callback
	 */
	update(this: void, updater: Updater<T>): void;
}

/** Pair of subscriber and invalidator. */
type SubscribeInvalidateTuple<T> = [Subscriber<T>, Invalidator<T>];

const subscriber_queue = [];

/**
 * Creates a store whose value cannot be set from 'outside', the first argument is the store's initial value, and the second argument to `readable` is the same as the second argument to `writable`.
 * 
 * ```ts
 * import { readable } from 'svelte/store';
 * 
 * const time = readable(null, set => {
 * 	set(new Date());
 * 
 * 	const interval = setInterval(() => {
 * 		set(new Date());
 * 	}, 1000);
 * 
 * 	return () => clearInterval(interval);
 * });
 * ```
 * 
 * @param initialValue 
 * @param start 
 * @returns 
 */
export function readable<T>(initialValue?: T, start?: StartStopNotifier<T>): Readable<T> {
	return {
		subscribe: writable(initialValue, start).subscribe
	};
}

/**
 * Function that creates a store which has values that can be set from 'outside' components. It gets created as an object with additional `set` and `update` methods.
 * 
 * `set` is a method that takes one argument which is the value to be set. The store value gets set to the value of the argument if the store value is not already equal to it.
 * 
 * `update` is a method that takes one argument which is a callback. The callback takes the existing store value as its argument and returns the new value to be set to the store.
 * 
 * ```ts
 * import { writable } from 'svelte/store';
 * 
 * const count = writable(0);
 * 
 * count.subscribe(value => {
 * 	console.log(value);
 * }); // logs '0'
 * 
 * count.set(1); // logs '1'
 * 
 * count.update(n => n + 1); // logs '2'
 * ```
 * 
 * ---
 * 
 * If a function is passed as the second argument, it will be called when the number of subscribers goes from zero to one (but not from one to two, etc). That function will be passed a `set` function which changes the value of the store. It must return a `stop` function that is called when the subscriber count goes from one to zero.
 * 
 * ```ts
 * import { writable } from 'svelte/store';
 * 
 * const count = writable(0, () => {
 * 	console.log('got a subscriber');
 * 	return () => console.log('no more subscribers');
 * });
 * 
 * count.set(1); // does nothing
 * 
 * const unsubscribe = count.subscribe(value => {
 * 	console.log(value);
 * }); // logs 'got a subscriber', then '1'
 * 
 * unsubscribe(); // logs 'no more subscribers'
 * ```
 * 
 * Note that the value of a `writable` is lost when it is destroyed, for example when the page is refreshed. However, you can write your own logic to sync the value to for example the `localStorage`.
 * 
 * @param initial_value 
 * @param start 
 * @returns 
 */
export function writable<T>(initialValue?: T, start: StartStopNotifier<T> = noop): Writable<T> {
	let stop: Unsubscriber;
	const subscribers: Set<SubscribeInvalidateTuple<T>> = new Set();

	function set(new_value: T): void {
		if (safe_not_equal(initialValue, new_value)) {
			initialValue = new_value;
			if (stop) { // store is ready
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, initialValue);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) {
						subscriber_queue[i][0](subscriber_queue[i + 1]);
					}
					subscriber_queue.length = 0;
				}
			}
		}
	}

	function update(fn: Updater<T>): void {
		set(fn(initialValue));
	}

	function subscribe(run: Subscriber<T>, invalidate: Invalidator<T> = noop): Unsubscriber {
		const subscriber: SubscribeInvalidateTuple<T> = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) {
			stop = start(set) || noop;
		}
		run(initialValue);

		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0) {
				stop();
				stop = null;
			}
		};
	}

	return { set, update, subscribe };
}

/** One or more `Readable`s. */
type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;

/** One or more values from `Readable` stores. */
type StoresValues<T> = T extends Readable<infer U> ? U :
	{ [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

/**
 * Derives a store from one or more other stores. The callback runs initially when the first subscriber subscribes and then whenever the store dependencies change.
 * 
 * In the simplest version, `derived` takes a single store, and the callback returns a derived value.
 * 
 * ```ts
 * import { derived } from 'svelte/store';
 * 
 * const doubled = derived(a, $a => $a * 2);
 * ```
 * 
 * ---
 * 
 * The callback can set a value asynchronously by accepting a second argument, `set`, and calling it when appropriate.
 * 
 * In this case, you can also pass a third argument to `derived` — the initial value of the derived store before `set` is first called.
 * 
 * ```ts
 * import { derived } from 'svelte/store';
 * 
 * const delayed = derived(a, ($a, set) => {
 * 	setTimeout(() => set($a), 1000);
 * }, 'one moment...');
 * ```
 * 
 * ---
 * 
 * If you return a function from the callback, it will be called when a) the callback runs again, or b) the last subscriber unsubscribes.
 * 
 * ```ts
 * import { derived } from 'svelte/store';
 * 
 * const tick = derived(frequency, ($frequency, set) => {
 * 	const interval = setInterval(() => {
 * 	  set(Date.now());
 * 	}, 1000 / $frequency);
 * 
 * 	return () => {
 * 		clearInterval(interval);
 * 	};
 * }, 'one moment...');
 * ```
 * 
 * ---
 * 
 * In both cases, an array of arguments can be passed as the first argument instead of a single store.
 * 
 * ```ts
 * import { derived } from 'svelte/store';
 * 
 * const summed = derived([a, b], ([$a, $b]) => $a + $b);
 * 
 * const delayed = derived([a, b], ([$a, $b], set) => {
 * 	setTimeout(() => set($a + $b), 1000);
 * });
 * ```
 * 
 * @param stores 
 * @param fn 
 * @param initial_value 
 */
export function derived<S extends Stores, T>(
	stores: S,
	fn: (values: StoresValues<S>, set: (value: T) => void) => Unsubscriber | void,
	initial_value?: T
): Readable<T>;

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @param stores - input stores
 * @param fn - function callback that aggregates the values
 * @param initial_value - initial value
 */
export function derived<S extends Stores, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T,
	initial_value?: T
): Readable<T>;

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @param stores - input stores
 * @param fn - function callback that aggregates the values
 */
export function derived<S extends Stores, T>(
	stores: S,
	fn: (values: StoresValues<S>) => T
): Readable<T>;

export function derived<T>(stores: Stores, fn: Function, initial_value?: T): Readable<T> {
	const single = !Array.isArray(stores);
	const stores_array: Array<Readable<any>> = single
		? [stores as Readable<any>]
		: stores as Array<Readable<any>>;

	const auto = fn.length < 2;

	return readable(initial_value, (set) => {
		let inited = false;
		const values = [];

		let pending = 0;
		let cleanup = noop;

		const sync = () => {
			if (pending) {
				return;
			}
			cleanup();
			const result = fn(single ? values[0] : values, set);
			if (auto) {
				set(result as T);
			} else {
				cleanup = is_function(result) ? result as Unsubscriber : noop;
			}
		};

		const unsubscribers = stores_array.map((store, i) => subscribe(
			store,
			(value) => {
				values[i] = value;
				pending &= ~(1 << i);
				if (inited) {
					sync();
				}
			},
			() => {
				pending |= (1 << i);
			})
		);

		inited = true;
		sync();

		return function stop() {
			run_all(unsubscribers);
			cleanup();
		};
	});
}

/**
 * Get the current value from a store by subscribing and immediately unsubscribing.
 * @param store readable
 */
export { get_store_value as get };
