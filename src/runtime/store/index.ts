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
type ArrayStore = Array<Store<any>>;
type SingleStore = Store<any>;
type ValuesOf<T> = { [K in keyof T]: T[K] extends Store<infer U> ? U : never };
type ValueOf<T> = T extends Store<infer U> ? U : never;
type StoreValues<T> = T extends Store<any> ? ValueOf<T> : T extends ArrayStore ? ValuesOf<T> : T;
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
export function derived<S extends SingleStore | ArrayStore, F extends Deriver<S, T | any>, T = DerivedValue<F>>(
	stores: S,
	fn: F,
	initial_value?: T
) {
	const mode: DeriverController = fn.length < 2 ? auto(fn as AutoDeriver<S, T>) : manual(fn as ManualDeriver<S, T>);
	const deriver = Array.isArray(stores) ? multiple(stores as ArrayStore, mode) : single(stores as SingleStore, mode);
	return readable(initial_value, deriver) as Readable<T>;
}

/** DERIVING LOGIC */

/**
 * derived from a single store
 *
 * derived store StartStopNotifier function when given a single store
 * */
const single = <T>(store: SingleStore, controller: DeriverController): StartStopNotifier<T> => set => {
	const unsub = subscribe(store, value => controller.update(value, set));
	return function stop() {
		unsub(), controller.cleanup();
	};
};

/** derived store StartStopNotifier function when given an array of stores */
const multiple = <T>(stores: ArrayStore, controller: DeriverController): StartStopNotifier<T> => set => {
	const values = new Array(stores.length);

	let inited = false;
	let pending = 0;

	const sync = () => inited && !pending && controller.update(values, set);
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

/** UPDATE/CLEANUP CONTROLLERS */

/**
 *  mode "auto" : function has <2 arguments
 *
 *  derived value = value returned by the function
 *
 */
const auto = (fn: AutoDeriver<any, any>): DeriverController => ({
	update(payload, set) {
		set(fn(payload));
	},
	cleanup: noop,
});

/**
 *  mode "manual" : function has >1 arguments
 *
 *  derived value = value set manually
 *  before each update => callback returned by the function
 *
 *  note :  [(...args) does not count as an argument]
 */
const manual = (fn: ManualDeriver<any, any>): DeriverController => ({
	update(payload, set) {
		this.cleanup();
		this.cleanup = fn(payload, set) as Unsubscriber;
		if (typeof this.cleanup !== 'function') this.cleanup = noop;
	},
	cleanup: noop,
});
