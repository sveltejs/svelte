import { run_all, noop, not_equal, safe_not_equal, is_function } from 'svelte/internal';

/** Callback to inform of a value updates. */
type Subscriber<T> = (value: T) => void;

/** Unsubscribes from value updates. */
type Unsubscriber = () => void;

/** Callback to update a value. */
type Updater<T> = (value: T) => T;

/** Cleanup logic callback. */
type Invalidater<T> = (value?: T) => void;

/** Start and stop notification callbacks. */
type StartStopNotifier<T> = (set: Subscriber<T>) => Unsubscriber | void;

/** Readable interface for subscribing. */
export interface Readable<T> {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	subscribe(run: Subscriber<T>, invalidate?: Invalidater<T>): Unsubscriber;
}

/** Writable interface for both updating and subscribing. */
export interface Writable<T> extends Readable<T> {
	/**
	 * Set value and inform subscribers.
	 * @param value to set
	 */
	set(value: T): void;

	/**
	 * Update value using callback and inform subscribers.
	 * @param updater callback
	 */
	update(updater: Updater<T>): void;
}

/** Pair of subscriber and invalidator. */
type SubscribeInvalidateTuple<T> = [Subscriber<T>, Invalidater<T>];

/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
export function readable<T>(value: T, start: StartStopNotifier<T>): Readable<T> {
	return {
		subscribe: writable(value, start).subscribe,
	};
}

interface WritableOptions<T> {
	/** Start and stop notifications for subscriptions */
	start?: StartStopNotifier<T>;
	/** Use immutable equality comparison */
	immutable?: boolean;
}

/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=} value initial value
 * @param {StartStopNotifier|WritableOptions?} options start and stop notifications for subscriptions or options
 */
export function writable<T>(
	value: T,
	options?: StartStopNotifier<T> | WritableOptions<T>,
): Writable<T> {
	let stop: Unsubscriber;
	const subscribers: Array<SubscribeInvalidateTuple<T>> = [];
	let start: StartStopNotifier<T> = noop;
	if (typeof options === "function") {
		start = options;
	} else if (typeof options === "object" && options.start) {
		start = options.start;
	}
	const not_equal_compare = typeof options === "object" && options.immutable ? not_equal : safe_not_equal;

	function set(new_value: T): void {
		if (not_equal_compare(value, new_value)) {
			value = new_value;
			if (!stop) {
				return; // not ready
			}
			subscribers.forEach((s) => s[1]());
			subscribers.forEach((s) => s[0](value));
		}
	}

	function update(fn: Updater<T>): void {
		set(fn(value));
	}

	function subscribe(run: Subscriber<T>, invalidate: Invalidater<T> = noop): Unsubscriber {
		const subscriber: SubscribeInvalidateTuple<T> = [run, invalidate];
		subscribers.push(subscriber);
		if (subscribers.length === 1) {
			stop = start(set) || noop;
		}
		run(value);

		return () => {
			const index = subscribers.indexOf(subscriber);
			if (index !== -1) {
				subscribers.splice(index, 1);
			}
			if (subscribers.length === 0) {
				stop();
			}
		};
	}

	return { set, update, subscribe };
}

/** One or more `Readable`s. */
type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>];

/** One or more values from `Readable` stores. */
type StoresValues<T> = T extends Readable<infer U> ? U :
	{ [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 * @param {Stores} stores input stores
 * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
 * @param {*=}initial_value when used asynchronously
 */
export function derived<T, S extends Stores>(
	stores: S,
	fn: (values: StoresValues<S>, set?: Subscriber<T>) => T | Unsubscriber | void,
	initial_value?: T,
): Readable<T> {

	const single = !Array.isArray(stores);
	const stores_array: Array<Readable<any>> = single
		? [stores as Readable<any>]
		: stores as Array<Readable<any>>;

	const auto = fn.length < 2;

	return readable(initial_value, (set) => {
		let inited = false;
		const values: StoresValues<S> = [] as StoresValues<S>;

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

		const unsubscribers = stores_array.map((store, i) => store.subscribe(
			(value) => {
				values[i] = value;
				pending &= ~(1 << i);
				if (inited) {
					sync();
				}
			},
			() => {
				pending |= (1 << i);
			}),
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
export function get<T>(store: Readable<T>): T {
	let value: T | undefined;
	store.subscribe((_: T) => value = _)();
	return value as T;
}
