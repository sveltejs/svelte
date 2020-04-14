import { subscribe, noop, safe_not_equal, get_store_value } from 'svelte/internal';

/** Sets the value of a store. */
type Setter<T> = (value: T) => void;

/** Called on last removed subscriber */
type StopCallback = () => void;
/** Function called on first added subscriber
 * 	If a callback is returned it will be called on last removed subscriber */
type StartStopNotifier<T> = (set: Setter<T>) => StopCallback | void;
type Subscriber<T> = (value: T) => void;
type Unsubscriber = () => void;
type Updater<T> = (value: T) => T;
/** Internal callback, invalidates every store before updating */
type Invalidator = () => void;
type SubscribeInvalidateTuple<T> = [Subscriber<T>, Invalidator];
type Store<T> = Writable<T> | Readable<T>;
type ValuesOf<T> = { [K in keyof T]: T[K] extends Store<infer U> ? U : never };
type ValueOf<T> = T extends Store<infer U> ? U : never;
type StoreValues<T> = T extends Store<any> ? ValueOf<T> : ValuesOf<T>;
/** The value of the derived store is the value returned by the function */
type AutoDeriver<S, T> = (values: StoreValues<S>) => T;
/** The value of the derived store is set manually through Setter calls */
type ManualDeriver<S, T> = (values: StoreValues<S>, set: Setter<T>) => Unsubscriber | void;
/** Type of derivation function, is decided by the number of arguments */
type Deriver<S, T> = AutoDeriver<S, T> | ManualDeriver<S, T>;
type DerivedValue<T> = T extends Deriver<T, infer U> ? U : never;
type DeriverController = {
	update<S, T>(values: StoreValues<S>, set: Setter<T>): void;
	cleanup?(): void;
};

export interface Readable<T> {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	subscribe(run: Subscriber<T>, invalidate?: Invalidator): Unsubscriber;
}
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

const subscriber_queue = [];

/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
export function readable<T>(value: T, start: StartStopNotifier<T>): Readable<T> {
	return { subscribe: writable(value, start).subscribe };
}

/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
export function writable<T>(value: T, start: StartStopNotifier<T> = noop): Writable<T> {
	let stop: Unsubscriber;
	const subscribers: Array<SubscribeInvalidateTuple<T>> = [];

	function set(new_value: T): void {
		if (!safe_not_equal(value, new_value)) return;
		value = new_value;
		if (!stop) return;
		const run_queue = !subscriber_queue.length;
		for (let i = 0, s; i < subscribers.length; i++) {
			(s = subscribers[i])[1]();
			subscriber_queue.push(s, value);
		}
		if (!run_queue) return;
		for (let i = 0; i < subscriber_queue.length; i++) {
			subscriber_queue[i][0](subscriber_queue[++i]);
		}
		subscriber_queue.length = 0;
	}

	function update(fn: Updater<T>): void {
		set(fn(value));
	}

	function subscribe(run: Subscriber<T>, invalidate: Invalidator = noop): Unsubscriber {
		const subscriber: SubscribeInvalidateTuple<T> = [run, invalidate];
		subscribers.push(subscriber);
		if (subscribers.length === 1) stop = start(set) || noop;
		run(value);
		return () => {
			const index = subscribers.indexOf(subscriber);
			if (~index) subscribers.splice(index, 1);
			if (!subscribers.length) stop(), (stop = null);
		};
	}

	return { set, update, subscribe };
}
/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @param stores - input stores
 * @param fn - function callback that aggregates the values
 * @param initial_value - when used asynchronously
 */
export function derived<S extends Store<any> | Array<Store<any>>, F extends Deriver<S, T | any>, T = DerivedValue<F>>(
	stores: S,
	fn: F,
	initial_value?: T
) {
	const mode = fn.length < 2 ? auto(fn as AutoDeriver<S, T>) : manual(fn as ManualDeriver<S, T>);
	const deriver = Array.isArray(stores)
		? multiple(stores as Array<Store<any>>, mode)
		: single(stores as Store<any>, mode);
	return readable(initial_value, deriver) as Readable<T>;
}

function single<S, T>(store: S, controller: DeriverController): StartStopNotifier<T> {
	return set => {
		const unsub = subscribe(store, value => controller.update(value, set));
		return function stop() {
			unsub(), controller.cleanup();
		};
	};
}
function multiple<S extends Array<Store<any>>, T>(stores: S, controller: DeriverController): StartStopNotifier<T> {
	return set => {
		let inited = false;
		let pending = 0;
		const values = new Array(stores.length) as StoreValues<S>;
		function sync() {
			if (inited && !pending) {
				controller.update(values, set);
			}
		}
		const unsubs = stores.map((store, index) =>
			subscribe(
				store,
				value => {
					values[index] = value;
					pending &= ~(1 << index);
					sync();
				},
				() => {
					pending |= 1 << index;
				}
			)
		);
		(inited = true), sync();
		return function stop() {
			unsubs.forEach(v => v()), controller.cleanup();
		};
	};
}
function auto(fn): DeriverController {
	return {
		update(payload, set) {
			set(fn(payload));
		},
		cleanup: noop,
	};
}
function manual(fn): DeriverController {
	return {
		update(payload, set) {
			this.cleanup();
			this.cleanup = fn(payload, set) as Unsubscriber;
			if (typeof this.cleanup !== 'function') this.cleanup = noop;
		},
		cleanup: noop,
	};
}
/**
 * Get the current value from a store by subscribing and immediately unsubscribing.
 * @param store readable
 */
export { get_store_value as get };
