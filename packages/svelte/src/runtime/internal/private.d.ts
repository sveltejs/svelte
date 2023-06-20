import type { AnimationConfig } from '../animate/public.js';

export type AnimationFn = (
	node: Element,
	{ from, to }: { from: PositionRect; to: PositionRect },
	params: any
) => AnimationConfig;

export type Listener = (entry: ResizeObserverEntry) => any;

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

/**
 * INTERNAL, DO NOT USE. Code may change at any time.
 */
export interface Fragment {
	key: string | null;
	first: null;
	/* create  */ c: () => void;
	/* claim   */ l: (nodes: any) => void;
	/* hydrate */ h: () => void;
	/* mount   */ m: (target: HTMLElement, anchor: any) => void;
	/* update  */ p: (ctx: T$$['ctx'], dirty: T$$['dirty']) => void;
	/* measure */ r: () => void;
	/* fix     */ f: () => void;
	/* animate */ a: () => void;
	/* intro   */ i: (local: any) => void;
	/* outro   */ o: (local: any) => void;
	/* destroy */ d: (detaching: 0 | 1) => void;
}

export type FragmentFactory = (ctx: any) => Fragment;

export interface T$$ {
	dirty: number[];
	ctx: any[];
	bound: any;
	update: () => void;
	callbacks: any;
	after_update: any[];
	props: Record<string, 0 | string>;
	fragment: null | false | Fragment;
	not_equal: any;
	before_update: any[];
	context: Map<any, any>;
	on_mount: any[];
	on_destroy: any[];
	skip_bound: boolean;
	on_disconnect: any[];
	root: Element | ShadowRoot;
}

export interface Task {
	abort(): void;
	promise: Promise<void>;
}

/**
 * Anything except a function
 */
type NotFunction<T> = T extends Function ? never : T;
