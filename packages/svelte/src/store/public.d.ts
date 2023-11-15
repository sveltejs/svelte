import { SubscriberInvalidator, Stores, StoresValues } from './private.js';

/** A function which sets a store's value. */
export type Setter<T> = (value: T) => void;

/** A function which returns a new value for a store derived from its current value. */
export type Updater<T> = (value: T) => T;

/** A function which is called when a store's value changes. */
export type Subscriber<T> = (value: T) => void;

/** A store not created by this module, e.g., an RxJS `Observable`. */
export type ExternalReadable<T = unknown> = {
	subscribe: (subscriber: Subscriber<T>) => (() => void) | { unsubscribe: () => void };
};

/** A store created by this module which can be subscribed to. */
export type Readable<T> = {
	subscribe: (subscriber: Subscriber<T> | SubscriberInvalidator<T>) => () => void;
};

/** A store which can be subscribed to and has `set` and `update` methods. */
export type Writable<T> = Readable<T> & {
	set: Setter<T>;
	update: (fn: Updater<T>) => void;
};

/** A function which is called whenever a store receives its first subscriber, and whose return
 * value, if a function, is called when the same store loses its last subscriber. */
export type OnStart<T> = (set: Setter<T>, update: (fn: Updater<T>) => void) => void | (() => void);

/** A function which derives a value from the dependency stores' values and optionally calls the
 * passed `set` or `update` functions to change the store. */
export type ComplexDeriveValue<S, T> = (
	values: S extends Stores ? StoresValues<S> : S,
	set: Setter<T>,
	update: (fn: Updater<T>) => void
) => void | (() => void);

/** A function which derives a value from the dependency stores' values and returns it. */
export type SimpleDeriveValue<S, T> = (values: S extends Stores ? StoresValues<S> : S) => T;

export { writable, readable, derived, readonly, get } from './index.js';
