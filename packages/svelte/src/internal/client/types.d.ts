import { STATE_SYMBOL } from './constants.js';
import type { Effect, Source, Value } from './reactivity/types.js';

type EventCallback = (event: Event) => boolean;
export type EventCallbackMap = Record<string, EventCallback | EventCallback[]>;

export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

// For all the core internal objects, we use single-character property strings.
// This not only reduces code-size and parsing, but it also improves the performance
// when the JS VM JITs the code.

export type ComponentContext = {
	/** local signals (needed for beforeUpdate/afterUpdate) */
	d: null | Source[];
	/** props */
	s: Record<string, unknown>;
	/** exports (and props, if `accessors: true`) */
	x: Record<string, any> | null;
	/** effects */
	e: null | Effect[];
	/** mounted */
	m: boolean;
	/** parent */
	p: null | ComponentContext;
	/** context */
	c: null | Map<unknown, unknown>;
	/** runes */
	r: boolean;
	/** legacy mode: if `$:` statements are allowed to run (ensures they only run once per render) */
	l1: any[];
	/** legacy mode: if `$:` statements are allowed to run (ensures they only run once per render) */
	l2: Source<boolean>;
	/** update_callbacks */
	u: null | {
		/** afterUpdate callbacks */
		a: Array<() => void>;
		/** beforeUpdate callbacks */
		b: Array<() => void>;
		/** onMount callbacks */
		m: Array<() => any>;
	};
};

export type Equals = (this: Value, value: unknown) => boolean;

export type TemplateNode = Text | Element | Comment;

export type RootBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Effect;
	/** intro */
	i: boolean;
	/** parent */
	p: null;
};

export type IfBlock = {
	/** value */
	v: boolean;
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Effect;
	/** parent */
	p: Block;
};

export type HeadBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Effect;
	/** parent */
	p: Block;
};

export type DynamicElementBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Effect;
	/** parent */
	p: Block;
};

export type DynamicComponentBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Effect;
	/** parent */
	p: Block;
};

export type AwaitBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Effect;
	/** parent */
	p: Block;
	/** pending */
	n: boolean;
};

export type EachBlock = {
	/** flags */
	f: number;
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** items */
	v: EachItemBlock[];
	/** effewct */
	e: null | Effect;
	/** parent */
	p: Block;
};

export type EachItemBlock = {
	/** animation manager */
	a: AnimationManager | null;
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: Effect;
	/** item */
	v: any | Source<any>;
	/** index */
	i: number | Source<number>;
	/** key */
	k: unknown;
};

export type SnippetBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** parent */
	p: Block;
	/** effect */
	e: null | Effect;
};

export type Block =
	| RootBlock
	| IfBlock
	| AwaitBlock
	| DynamicElementBlock
	| DynamicComponentBlock
	| HeadBlock
	| EachBlock
	| EachItemBlock
	| SnippetBlock;

export interface TransitionManager {
	is_global: boolean;
	in: () => void;
	out: (callback?: () => void) => void;
	stop: () => void;
}

export interface AnimationManager {
	element: Element;
	measure: () => void;
	apply: () => void;
}

export interface Animation {
	abort: () => void;
	neuter: () => void;
	reset: () => void;
	p: (now: number) => number;
}

export type TransitionFn<P> = (
	element: Element,
	props: P,
	options: { direction?: 'in' | 'out' | 'both' }
) => TransitionConfig | ((options: { direction?: 'in' | 'out' }) => TransitionConfig);

export type AnimateFn<P> = (
	element: Element,
	rects: { from: DOMRect; to: DOMRect },
	props: P
) => TransitionConfig;

export type TransitionConfig = {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
	css?: (t: number, u: number) => string;
	tick?: (t: number, u: number) => string;
};

export type StoreReferencesContainer = Record<
	string,
	{
		store: Store<any> | null;
		last_value: any;
		unsubscribe: Function;
		value: Source<any>;
	}
>;

export type ActionPayload<P> = { destroy?: () => void; update?: (value: P) => void };

export type Render = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Effect;
	/** prev */
	p: Render | null;
};

export type Raf = {
	tick: (callback: (time: DOMHighResTimeStamp) => void) => any;
	now: () => number;
	tasks: Set<any>;
};

export interface Task {
	abort(): void;
	promise: Promise<void>;
}

export type TaskCallback = (now: number) => boolean | void;

export type TaskEntry = { c: TaskCallback; f: () => void };

export interface ProxyMetadata<T = Record<string | symbol, any>> {
	/** A map of signals associated to the properties that are reactive */
	s: Map<string | symbol, Source<any>>;
	/** A version counter, used within the proxy to signal changes in places where there's no other way to signal an update */
	v: Source<number>;
	/** `true` if the proxified object is an array */
	a: boolean;
	/** Immutable: Whether to use a source or mutable source under the hood */
	i: boolean;
	/** The associated proxy */
	p: ProxyStateObject<T>;
	/** The original target this proxy was created for */
	t: T;
	/** Dev-only — the components that 'own' this state, if any */
	o: null | Set<Function>;
}

export type ProxyStateObject<T = Record<string | symbol, any>> = T & {
	[STATE_SYMBOL]: ProxyMetadata;
};

export * from './reactivity/types';
