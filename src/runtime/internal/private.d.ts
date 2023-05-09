import type { AnimationConfig } from '../animate';
import type { Fragment, FragmentFactory } from './public';

export type AnimationFn = (
	node: Element,
	{ from, to }: { from: PositionRect; to: PositionRect },
	params: any
) => AnimationConfig;

type Listener = (entry: ResizeObserverEntry) => any;

//todo: documentation says it is DOMRect, but in IE it would be ClientRect
export type PositionRect = DOMRect | ClientRect;

export interface PromiseInfo<T> {
	ctx: null | any;
	// unique object instance as a key to compare different promises
	token: {};
	hasCatch: boolean;
	pending: FragmentFactory;
	then: FragmentFactory;
	catch: FragmentFactory;
	// ctx index for resolved value and rejected error
	value: number;
	error: number;
	// resolved value or rejected error
	resolved?: T;
	// the current factory function for creating the fragment
	current: FragmentFactory | null;
	// the current fragment
	block: Fragment | null;
	// tuple of the pending, then, catch fragment
	blocks: [null | Fragment, null | Fragment, null | Fragment];
	// DOM elements to mount and anchor on for the {#await} block
	mount: () => HTMLElement;
	anchor: HTMLElement;
}

// TODO: Remove this
export interface ResizeObserverSize {
	readonly blockSize: number;
	readonly inlineSize: number;
}

export interface ResizeObserverEntry {
	readonly borderBoxSize: readonly ResizeObserverSize[];
	readonly contentBoxSize: readonly ResizeObserverSize[];
	readonly contentRect: DOMRectReadOnly;
	readonly devicePixelContentBoxSize: readonly ResizeObserverSize[];
	readonly target: Element;
}

export type ResizeObserverBoxOptions = 'border-box' | 'content-box' | 'device-pixel-content-box';

export interface ResizeObserverOptions {
	box?: ResizeObserverBoxOptions;
}

export interface ResizeObserver {
	disconnect(): void;
	observe(target: Element, options?: ResizeObserverOptions): void;
	unobserve(target: Element): void;
}

export interface ResizeObserverCallback {
	(entries: ResizeObserverEntry[], observer: ResizeObserver): void;
}

export declare let ResizeObserver: {
	prototype: ResizeObserver;
	new (callback: ResizeObserverCallback): ResizeObserver;
};

export interface StyleInformation {
	stylesheet: CSSStyleSheet;
	rules: Record<string, true>;
}

export type TaskCallback = (now: number) => boolean | void;

export type TaskEntry = { c: TaskCallback; f: () => void };
