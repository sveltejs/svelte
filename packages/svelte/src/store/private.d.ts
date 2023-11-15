import { Updater, Subscriber, ExternalReadable, Readable, Writable } from './public.js';

/** An object with `set` and `update` methods that only work if the object's `enabled` property is
 * `true` */
export type DisableableSetterUpdater<T> = {
	enabled: boolean;
	set: (value: T) => void;
	update: (fn: Updater<T>) => void;
};

/** A tuple of a function which is called when a store's value changes and a function which is
 * called shortly before the first to enable proper order of evaluation. */
export type SubscriberInvalidator<T> = [(value: T, isChanged?: boolean) => void, () => void];

/** An `Array` of all subscribers to a store. */
export type Subscribers<T> = Array<Subscriber<T> | SubscriberInvalidator<T>>;

/** One or more `Readable` or `ExternalReadable` stores. The spread syntax is important for
 * `StoresValues` to work. */
export type Stores =
	| Readable<any>
	| ExternalReadable<any>
	| [Readable<any> | ExternalReadable<any>, ...Array<Readable<any> | ExternalReadable<any>>];

/** One or more values from `Readable` stores. */
export type StoresValues<T> = T extends Readable<infer U> | ExternalReadable<infer U>
	? U
	: {
			[K in keyof T]: T[K] extends Readable<infer U> | ExternalReadable<infer U> ? U : never;
	  };

/** A special case of `OnStart` created by `derived` when subscribing to other stores created by
 * this module. */
export type DerivedOnStart<T> = (store: Writable<T>) => () => void;
