import {
	ROOT_BLOCK,
	EACH_BLOCK,
	EACH_ITEM_BLOCK,
	IF_BLOCK,
	AWAIT_BLOCK,
	KEY_BLOCK,
	HEAD_BLOCK,
	DYNAMIC_COMPONENT_BLOCK,
	DYNAMIC_ELEMENT_BLOCK,
	SNIPPET_BLOCK,
	STATE_SYMBOL
} from './constants.js';
import type { Reaction, Effect, Signal, Source, Value } from './reactivity/types.js';

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

export type EqualsFunctions<T = any> = (a: T, v: T) => boolean;

export type BlockType =
	| typeof ROOT_BLOCK
	| typeof EACH_BLOCK
	| typeof EACH_ITEM_BLOCK
	| typeof IF_BLOCK
	| typeof AWAIT_BLOCK
	| typeof KEY_BLOCK
	| typeof SNIPPET_BLOCK
	| typeof HEAD_BLOCK
	| typeof DYNAMIC_COMPONENT_BLOCK
	| typeof DYNAMIC_ELEMENT_BLOCK;

export type TemplateNode = Text | Element | Comment;

export type Transition = {
	/** effect */
	e: Effect;
	/** payload */
	p: null | TransitionPayload;
	/** init */
	i: (from?: DOMRect) => TransitionPayload;
	/** finished */
	f: (fn: () => void) => void;
	in: () => void;
	/** out */
	o: () => void;
	/** cancel */
	c: () => void;
	/** cleanup */
	x: () => void;
	/** direction */
	r: 'in' | 'out' | 'both' | 'key';
	/** dom */
	d: HTMLElement;
};

export type RootBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Reaction;
	/** intro */
	i: boolean;
	/** parent */
	p: null;
	/** transition */
	r: null | ((transition: Transition) => void);
	/** type */
	t: typeof ROOT_BLOCK;
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
	/** transition */
	r: null | ((transition: Transition) => void);
	/** consequent transitions */
	c: null | Set<Transition>;
	/** alternate transitions */
	a: null | Set<Transition>;
	/** effect */
	ce: null | Effect;
	/** effect */
	ae: null | Effect;
	/** type */
	t: typeof IF_BLOCK;
};

export type KeyBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Effect;
	/** parent */
	p: Block;
	/** transition */
	r: null | ((transition: Transition) => void);
	/** type */
	t: typeof KEY_BLOCK;
};

export type HeadBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Reaction;
	/** parent */
	p: Block;
	/** transition */
	r: null | ((transition: Transition) => void);
	/** type */
	t: typeof HEAD_BLOCK;
};

export type DynamicElementBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Reaction;
	/** parent */
	p: Block;
	/** transition */
	r: null | ((transition: Transition) => void);
	/** type */
	t: typeof DYNAMIC_ELEMENT_BLOCK;
};

export type DynamicComponentBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Reaction;
	/** parent */
	p: Block;
	/** transition */
	r: null | ((transition: Transition) => void);
	/** type */
	t: typeof DYNAMIC_COMPONENT_BLOCK;
};

export type AwaitBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Reaction;
	/** parent */
	p: Block;
	/** pending */
	n: boolean;
	/** transition */
	r: null | ((transition: Transition) => void);
	/** type */
	t: typeof AWAIT_BLOCK;
};

export type EachBlock = {
	/** anchor */
	a: Element | Comment;
	/** flags */
	f: number;
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** items */
	v: EachItemBlock[];
	/** effewct */
	e: null | Reaction;
	/** parent */
	p: Block;
	/** transition */
	r: null | ((transition: Transition) => void);
	/** transitions */
	s: Array<EachItemBlock>;
	/** type */
	t: typeof EACH_BLOCK;
};

export type EachItemBlock = {
	/** transition */
	a: null | ((block: EachItemBlock, transitions: Set<Transition>) => void);
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** effect */
	e: null | Effect;
	/** item */
	v: any | Source<any>;
	/** index */
	i: number | Source<number>;
	/** key */
	k: unknown;
	/** parent */
	p: EachBlock;
	/** transition */
	r: null | ((transition: Transition) => void);
	/** transitions */
	s: null | Set<Transition>;
	/** type */
	t: typeof EACH_ITEM_BLOCK;
};

export type SnippetBlock = {
	/** dom */
	d: null | TemplateNode | Array<TemplateNode>;
	/** parent */
	p: Block;
	/** effect */
	e: null | Reaction;
	/** transition */
	r: null;
	/** type */
	t: typeof SNIPPET_BLOCK;
};

export type Block =
	| RootBlock
	| IfBlock
	| AwaitBlock
	| DynamicElementBlock
	| DynamicComponentBlock
	| HeadBlock
	| KeyBlock
	| EachBlock
	| EachItemBlock
	| SnippetBlock;

export type TransitionFn<P> = (
	element: Element,
	props: P,
	options: { direction?: 'in' | 'out' | 'both' }
) => TransitionPayload;

export type AnimateFn<P> = (
	element: Element,
	rects: { from: DOMRect; to: DOMRect },
	props: P,
	options: {}
) => TransitionPayload;

export type TransitionPayload = {
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
	/** transitions */
	s: Set<Transition>;
	/** prev */
	p: Render | null;
};

export type Raf = {
	tick: (callback: (time: DOMHighResTimeStamp) => void) => any;
	now: () => number;
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
