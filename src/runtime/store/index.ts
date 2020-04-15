import { subscribe, noop, safe_not_equal, get_store_value } from '../internal/utils';

/**
 * Get the current value from a store by subscribing and immediately unsubscribing.
 * @param store readable
 */
export { get_store_value as get };

/** Sets the value of a store. */
type Setter<T> = (value: T) => void;
/** Called on last removed subscriber */
type StopCallback = () => void;
type CleanupCallback = () => void;
/** Function called on first added subscriber
 * 	If a callback is returned it will be called on last removed subscriber */
type StartStopNotifier<T> = (set: Setter<T>) => StopCallback | void;
type Subscriber<T> = (value: T) => void;
export type Unsubscriber = () => void;
type Updater<T> = (value: T) => T;
/** Internal callback, used to invalidate every store before updating */
type Invalidator = () => void;
type SubscribeInvalidateTuple<T> = [Subscriber<T>, Invalidator];
export type Store<T> = Writable<T> | Readable<T>;
type SingleStore = Store<any>;
type ArrayStore = SingleStore[];
type ValuesOf<T> = { [K in keyof T]: T[K] extends Store<infer U> ? U : never };
type ValueOf<T> = T extends Store<infer U> ? U : never;
type StoreValues<T> = T extends SingleStore ? ValueOf<T> : T extends ArrayStore ? ValuesOf<T> : T;

export interface Readable<T> {
	subscribe(run: Subscriber<T>, invalidate?: Invalidator): Unsubscriber;
}
export interface Writable<T> extends Readable<T> {
	set: Setter<T>;
	update(updater: Updater<T>): void;
}

const subscriber_queue = [];

/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param start start and stop notifications for subscriptions
 */
export function readable<T>(value: T, start: StartStopNotifier<T>): Readable<T> {
	return { subscribe: writable(value, start).subscribe };
}

/**
 * Creates a `Writable` store that allows both updating and reading by subscription.
 * @param value initial value
 * @param start start and stop notifications for subscriptions
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
 * Creates a `Readable` store whose value depends on other stores.
 *
 * @param stores - input store(s)
 * @param fn - function callback that aggregates the values
 * @param initial_value - initial value
 */
export function derived<S extends SingleStore | ArrayStore, F extends Deriver<S, T>, T>(
	stores: S,
	fn: F,
	initial_value?: T
): Readable<T> {
	const mode = fn.length < 2 ? auto(fn as AutoDeriver<S, T>) : manual(fn as ManualDeriver<S, T>);
	const deriver = Array.isArray(stores) ? multiple(stores, mode) : single(stores as SingleStore, mode);
	return readable(initial_value, deriver);
}

/** StartStopNotifier when deriving a single store */
const single = <S extends SingleStore, T>(store: S, { derive, cleanup }: Controller<S, T>): StartStopNotifier<T> =>
	function StartStopSingle(set) {
		const unsub = subscribe(store, value => {
			derive(value, set);
		});
		return function stop() {
			unsub(), cleanup();
		};
	};

/** StartStopNotifier when deriving an array of stores */
const multiple = <S extends ArrayStore, T>(stores: S, { derive, cleanup }: Controller<S, T>): StartStopNotifier<T> =>
	function StartStopMultiple(set) {
		const values = new Array(stores.length) as StoreValues<S>;
		let pending = 1 << stores.length;

		const unsubs = stores.map((store, index) =>
			subscribe(
				store,
				value => {
					values[index] = value;
					pending &= ~(1 << index);
					if (!pending) derive(values, set);
				},
				() => {
					pending |= 1 << index;
				}
			)
		);

		pending &= ~(1 << stores.length);
		derive(values, set);

		return function stop() {
			unsubs.forEach(v => v());
			cleanup();
		};
	};

type Deriver<S, T> = AutoDeriver<S, T> | ManualDeriver<S, T>;

interface Controller<S, T> {
	derive(payload: StoreValues<S>, set: Setter<T>): void;
	cleanup(): void;
}
/** UPDATE/CLEANUP CONTROLLERS */

/**
 *  mode "auto" : deriving function has <2 arguments
 *  the derived value is the value returned by the function
 */
type AutoDeriver<S, T> = (values: StoreValues<S>) => T;
function auto<S, T>(fn: AutoDeriver<S, T>) {
	function derive(payload: StoreValues<S>, set: Setter<T>) {
		set(fn(payload));
	}
	return { derive, cleanup: noop };
}

/**
 *  mode "manual" : deriving function has >1 arguments
 *  [(...args) does not count as an argument]
 *
 *  derived value is set() manually
 *  if a callback is returned it is called on before next update
 */
type ManualDeriver<S, T> = (values: StoreValues<S>, set: Setter<T>) => CleanupCallback | void;
function manual<S, T>(fn: ManualDeriver<S, T>) {
	let callback = noop;
	function derive(payload: StoreValues<S>, set: Setter<T>) {
		callback();
		callback = fn(payload, set) as CleanupCallback;
		if (typeof callback !== 'function') callback = noop;
	}
	function cleanup() {
		callback();
	}
	return { derive, cleanup };
}
