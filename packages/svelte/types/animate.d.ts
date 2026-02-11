/// <reference path="./ambient.d.ts" />
import type { Brand, Branded, Component, ComponentConstructorOptions, ComponentEvents, ComponentInternals, ComponentProps, ComponentType, DispatchOptions, EventDispatcher, Fork, Getters, MountOptions, NotFunction, Properties, Snippet, SnippetReturn, SvelteComponent, SvelteComponentTyped, afterUpdate, beforeUpdate, brand, createContext, createEventDispatcher, createRawSnippet, flushSync, fork, getAbortSignal, getAllContexts, getContext, hasContext, hydratable, hydrate, mount, onDestroy, onMount, setContext, settled, tick, unmount, untrack } from './shared';
// todo: same as Transition, should it be shared?
export interface AnimationConfig {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

export interface FlipParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: (t: number) => number;
}
/**
 * The flip function calculates the start and end position of an element and animates between them, translating the x and y values.
 * `flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).
 *
 * */
export function flip(node: Element, { from, to }: {
	from: DOMRect;
	to: DOMRect;
}, params?: FlipParams): AnimationConfig;

export {};

