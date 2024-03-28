import type { Invalidator, Revalidator } from './private.js';

/** Callback to inform of a value updates. */
export type Subscriber<T> = (value: T) => void;

/** Unsubscribes from value updates. */
export type Unsubscriber = () => void;

/** Callback to update a value. */
export type Updater<T> = (value: T) => T;

/**
 * Start and stop notification callbacks.
 * This function is called when the first subscriber subscribes.
 *
 * @param {((value: T) => void) & { set: (value: T) => void, update: (fn: Updater<T>) => void, invalidate: () => void })} set Function that sets the value of the store.
 * @param {(value: Updater<T>) => void} update Function that sets the value of the store after passing the current value to the update function.
 * @returns {void | (() => void)} Optionally, a cleanup function that is called when the last remaining
 * subscriber unsubscribes.
 */
export type StartStopNotifier<T> = (
	set: ((value: T) => void) & {
		set: (value: T) => void,
		update: (fn: Updater<T>) => void,
		invalidate: () => void,
		revalidate: () => void
	},
	update: (fn: Updater<T>) => void
) => void | (() => void);

/** Readable interface for subscribing. */
export interface Readable<T> {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback - run when inputs are in an indeterminate state
	 * @param revalidate cleanup callback - run when inputs have been resolved to their previous values
	 */
	subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>, revalidate?: Revalidator<T>): Unsubscriber;
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

export * from './index.js';
