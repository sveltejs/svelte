/// <reference path="../ambient.d.ts" />
export * from '../shared';
import type { Brand, Branded, Component, ComponentConstructorOptions, ComponentEvents, ComponentInternals, ComponentProps, ComponentType, DispatchOptions, EventDispatcher, Fork, Getters, MountOptions, NotFunction, Properties, Snippet, SnippetReturn, SvelteComponent, SvelteComponentTyped, afterUpdate, beforeUpdate, brand, createContext, createEventDispatcher, createRawSnippet, flushSync, fork, getAbortSignal, getAllContexts, getContext, hasContext, hydratable, hydrate, mount, onDestroy, onMount, setContext, settled, tick, unmount, untrack } from '../shared';
/**
 * `scrollX.current` is a reactive view of `window.scrollX`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const scrollX: ReactiveValue<number | undefined>;
/**
 * `scrollY.current` is a reactive view of `window.scrollY`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const scrollY: ReactiveValue<number | undefined>;
/**
 * `innerWidth.current` is a reactive view of `window.innerWidth`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const innerWidth: ReactiveValue<number | undefined>;
/**
 * `innerHeight.current` is a reactive view of `window.innerHeight`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const innerHeight: ReactiveValue<number | undefined>;
/**
 * `outerWidth.current` is a reactive view of `window.outerWidth`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const outerWidth: ReactiveValue<number | undefined>;
/**
 * `outerHeight.current` is a reactive view of `window.outerHeight`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const outerHeight: ReactiveValue<number | undefined>;
/**
 * `screenLeft.current` is a reactive view of `window.screenLeft`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
 * @since 5.11.0
 */
export const screenLeft: ReactiveValue<number | undefined>;
/**
 * `screenTop.current` is a reactive view of `window.screenTop`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
 * @since 5.11.0
 */
export const screenTop: ReactiveValue<number | undefined>;
/**
 * `online.current` is a reactive view of `navigator.onLine`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const online: ReactiveValue<boolean | undefined>;
/**
 * `devicePixelRatio.current` is a reactive view of `window.devicePixelRatio`. On the server it is `undefined`.
 * Note that behaviour differs between browsers — on Chrome it will respond to the current zoom level,
 * on Firefox and Safari it won't.
 * @since 5.11.0
 */
export const devicePixelRatio: {
	get current(): number | undefined;
};
export class ReactiveValue<T> {
	
	constructor(fn: () => T, onsubscribe: (update: () => void) => void);
	get current(): T;
	#private;
}

export {};

