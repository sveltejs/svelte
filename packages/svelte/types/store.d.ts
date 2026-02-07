/// <reference path="./ambient.d.ts" />
export * from './shared';
import type { Brand, Branded, Component, ComponentConstructorOptions, ComponentEvents, ComponentInternals, ComponentProps, ComponentType, DispatchOptions, EventDispatcher, Fork, Getters, MountOptions, NotFunction, Properties, Snippet, SnippetReturn, SvelteComponent, SvelteComponentTyped, afterUpdate, beforeUpdate, brand, createContext, createEventDispatcher, createRawSnippet, flushSync, fork, getAbortSignal, getAllContexts, getContext, hasContext, hydratable, hydrate, mount, onDestroy, onMount, setContext, settled, tick, unmount, untrack } from './shared';
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
 * @param set Function that sets the value of the store.
 * @param update Function that sets the value of the store after passing the current value to the update function.
 * @returns Optionally, a cleanup function that is called when the last remaining
 * subscriber unsubscribes.
 */
export type StartStopNotifier<T> = (
	set: (value: T) => void,
	update: (fn: Updater<T>) => void
) => void | (() => void);

/** Readable interface for subscribing. */
export interface Readable<T> {
	/**
	 * Subscribe on value changes.
	 * @param run subscription callback
	 * @param invalidate cleanup callback
	 */
	subscribe(this: void, run: Subscriber<T>, invalidate?: () => void): Unsubscriber;
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
export function toStore<V>(get: () => V, set: (v: V) => void): Writable<V>;

export function toStore<V>(get: () => V): Readable<V>;

export function fromStore<V>(store: Writable<V>): {
	current: V;
};

export function fromStore<V>(store: Readable<V>): {
	readonly current: V;
};
/**
 * Creates a `Readable` store that allows reading by subscription.
 *
 * @param value initial value
 * */
export function readable<T>(value?: T | undefined, start?: StartStopNotifier<T> | undefined): Readable<T>;
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 *
 * @param value initial value
 * */
export function writable<T>(value?: T | undefined, start?: StartStopNotifier<T> | undefined): Writable<T>;
/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * */
export function derived<S extends Stores, T>(stores: S, fn: (values: StoresValues<S>, set: (value: T) => void, update: (fn: Updater<T>) => void) => Unsubscriber | void, initial_value?: T | undefined): Readable<T>;
/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * */
export function derived<S extends Stores, T>(stores: S, fn: (values: StoresValues<S>) => T, initial_value?: T | undefined): Readable<T>;
/**
 * Takes a store and returns a new one derived from the old one that is readable.
 *
 * @param store  - store to make readonly
 * */
export function readonly<T>(store: Readable<T>): Readable<T>;
/**
 * Get the current value from a store by subscribing and immediately unsubscribing.
 *
 * */
export function get<T>(store: Readable<T>): T;
/** One or more `Readable`s. */
export type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;

/** One or more values from `Readable` stores. */
export type StoresValues<T> =
	T extends Readable<infer U> ? U : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

export {};

