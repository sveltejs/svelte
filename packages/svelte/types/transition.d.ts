/// <reference path="./ambient.d.ts" />
export * from './shared';
import type { Brand, Branded, Component, ComponentConstructorOptions, ComponentEvents, ComponentInternals, ComponentProps, ComponentType, DispatchOptions, EventDispatcher, Fork, Getters, MountOptions, NotFunction, Properties, Snippet, SnippetReturn, SvelteComponent, SvelteComponentTyped, afterUpdate, beforeUpdate, brand, createContext, createEventDispatcher, createRawSnippet, flushSync, fork, getAbortSignal, getAllContexts, getContext, hasContext, hydratable, hydrate, mount, onDestroy, onMount, setContext, settled, tick, unmount, untrack } from './shared';
export type EasingFunction = (t: number) => number;

export interface TransitionConfig {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => void;
}

export interface BlurParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	amount?: number | string;
	opacity?: number;
}

export interface FadeParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
}

export interface FlyParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	x?: number | string;
	y?: number | string;
	opacity?: number;
}

export interface SlideParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	axis?: 'x' | 'y';
}

export interface ScaleParams {
	delay?: number;
	duration?: number;
	easing?: EasingFunction;
	start?: number;
	opacity?: number;
}

export interface DrawParams {
	delay?: number;
	speed?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}

export interface CrossfadeParams {
	delay?: number;
	duration?: number | ((len: number) => number);
	easing?: EasingFunction;
}
/**
 * Animates a `blur` filter alongside an element's opacity.
 *
 * */
export function blur(node: Element, { delay, duration, easing, amount, opacity }?: BlurParams | undefined): TransitionConfig;
/**
 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
 *
 * */
export function fade(node: Element, { delay, duration, easing }?: FadeParams | undefined): TransitionConfig;
/**
 * Animates the x and y positions and the opacity of an element. `in` transitions animate from the provided values, passed as parameters to the element's default values. `out` transitions animate from the element's default values to the provided values.
 *
 * */
export function fly(node: Element, { delay, duration, easing, x, y, opacity }?: FlyParams | undefined): TransitionConfig;
/**
 * Slides an element in and out.
 *
 * */
export function slide(node: Element, { delay, duration, easing, axis }?: SlideParams | undefined): TransitionConfig;
/**
 * Animates the opacity and scale of an element. `in` transitions animate from the provided values, passed as parameters, to an element's current (default) values. `out` transitions animate from an element's default values to the provided values.
 *
 * */
export function scale(node: Element, { delay, duration, easing, start, opacity }?: ScaleParams | undefined): TransitionConfig;
/**
 * Animates the stroke of an SVG element, like a snake in a tube. `in` transitions begin with the path invisible and draw the path to the screen over time. `out` transitions start in a visible state and gradually erase the path. `draw` only works with elements that have a `getTotalLength` method, like `<path>` and `<polyline>`.
 *
 * */
export function draw(node: SVGElement & {
	getTotalLength(): number;
}, { delay, speed, duration, easing }?: DrawParams | undefined): TransitionConfig;
/**
 * The `crossfade` function creates a pair of [transitions](https://svelte.dev/docs/svelte/transition) called `send` and `receive`. When an element is 'sent', it looks for a corresponding element being 'received', and generates a transition that transforms the element to its counterpart's position and fades it out. When an element is 'received', the reverse happens. If there is no counterpart, the `fallback` transition is used.
 *
 * */
export function crossfade({ fallback, ...defaults }: CrossfadeParams & {
	fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
}): [(node: any, params: CrossfadeParams & {
	key: any;
}) => () => TransitionConfig, (node: any, params: CrossfadeParams & {
	key: any;
}) => () => TransitionConfig];

export {};

