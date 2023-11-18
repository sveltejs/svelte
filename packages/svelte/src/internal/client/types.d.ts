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
	SNIPPET_BLOCK
} from './block.js';
import { DERIVED, EFFECT, RENDER_EFFECT, SOURCE, PRE_EFFECT } from './runtime.js';

// Put all internal types in this file. Once we convert to JSDoc, we can make this a d.ts file

export type SignalFlags =
	| typeof SOURCE
	| typeof DERIVED
	| typeof EFFECT
	| typeof PRE_EFFECT
	| typeof RENDER_EFFECT;
export type EffectType = typeof EFFECT | typeof PRE_EFFECT | typeof RENDER_EFFECT;

type EventCallback = (event: Event) => boolean;
export type EventCallbackMap = Record<string, EventCallback | EventCallback[]>;

export type Store<V> = {
	subscribe: (run: (value: V) => void) => () => void;
	set(value: V): void;
};

export type ComponentContext = {
	props: MaybeSignal<Record<string, unknown>>;
	accessors: Record<string, any> | null;
	effects: null | Array<EffectSignal>;
	mounted: boolean;
	parent: null | ComponentContext;
	context: null | Map<unknown, unknown>;
	immutable: boolean;
	runes: boolean;
	update_callbacks: null | {
		before: Array<() => void>;
		after: Array<() => void>;
		execute: () => void;
	};
};

export type Signal<V = unknown> = {
	/** The block associated with this effect/computed */
	block: null | Block;
	/** Signals that read from the current signal */
	consumers: null | Signal[];
	/** The associated component if this signal is an effect/computed */
	context: null | ComponentContext;
	/** Signals that this signal reads from */
	dependencies: null | Signal[];
	/** Thing(s) that need destroying */
	destroy: null | (() => void) | Array<() => void>;
	/** For value equality */
	equals: null | EqualsFunctions;
	/** The types that the signal represent, as a bitwise value */
	flags: SignalFlags;
	/** The function that we invoke for effects and computeds */
	init: null | (() => V) | (() => void | (() => void)) | ((b: Block) => void | (() => void));
	/** Anything that a signal owns */
	references: null | Signal[];
	/** The latest value for this signal, doubles as the teardown for effects */
	value: V;
};

export type EffectSignal = Signal<null | (() => void)>;

export type MaybeSignal<T = unknown> = T | Signal<T>;

export type UnwrappedSignal<T> = T extends Signal<infer U> ? U : T;

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
	effect: Signal;
	payload: null | TransitionPayload;
	init: (from?: DOMRect) => TransitionPayload;
	finished: (fn: () => void) => void;
	in: () => void;
	out: () => void;
	cancel: () => void;
	cleanup: () => void;
	direction: 'in' | 'out' | 'both' | 'key';
	dom: HTMLElement;
};

export type RootBlock = {
	dom: null | TemplateNode | Array<TemplateNode>;
	effect: null | Signal;
	container: Node;
	intro: boolean;
	parent: null;
	transition: null | ((transition: Transition) => void);
	type: typeof ROOT_BLOCK;
};

export type IfBlock = {
	current: boolean;
	dom: null | TemplateNode | Array<TemplateNode>;
	effect: null | Signal;
	parent: Block;
	transition: null | ((transition: Transition) => void);
	type: typeof IF_BLOCK;
};

export type KeyBlock = {
	dom: null | TemplateNode | Array<TemplateNode>;
	effect: null | Signal;
	parent: Block;
	transition: null | ((transition: Transition) => void);
	type: typeof KEY_BLOCK;
};

export type HeadBlock = {
	dom: null | TemplateNode | Array<TemplateNode>;
	effect: null | Signal;
	parent: Block;
	transition: null | ((transition: Transition) => void);
	type: typeof HEAD_BLOCK;
};

export type DynamicElementBlock = {
	dom: null | TemplateNode | Array<TemplateNode>;
	effect: null | Signal;
	parent: Block;
	transition: null | ((transition: Transition) => void);
	type: typeof DYNAMIC_ELEMENT_BLOCK;
};

export type DynamicComponentBlock = {
	dom: null | TemplateNode | Array<TemplateNode>;
	effect: null | Signal;
	parent: Block;
	transition: null | ((transition: Transition) => void);
	type: typeof DYNAMIC_COMPONENT_BLOCK;
};

export type AwaitBlock = {
	dom: null | TemplateNode | Array<TemplateNode>;
	effect: null | Signal;
	parent: Block;
	pending: boolean;
	transition: null | ((transition: Transition) => void);
	type: typeof AWAIT_BLOCK;
};

export type EachBlock = {
	anchor: Element | Comment;
	flags: number;
	dom: null | TemplateNode | Array<TemplateNode>;
	items: EachItemBlock[];
	effect: null | Signal;
	parent: Block;
	transition: null | ((transition: Transition) => void);
	transitions: Array<EachItemBlock>;
	type: typeof EACH_BLOCK;
};

export type EachItemBlock = {
	dom: null | TemplateNode | Array<TemplateNode>;
	effect: null | Signal;
	item: any | Signal<any>;
	index: number | Signal<number>;
	key: unknown;
	parent: EachBlock;
	transition: null | ((transition: Transition) => void);
	transitions: null | Set<Transition>;
	type: typeof EACH_ITEM_BLOCK;
};

export type SnippetBlock = {
	dom: null | TemplateNode | Array<TemplateNode>;
	parent: Block;
	effect: null | Signal;
	transition: null;
	type: typeof SNIPPET_BLOCK;
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
		value: Signal<any>;
	}
>;

export type ActionPayload<P> = { destroy?: () => void; update?: (value: P) => void };

export type Render = {
	dom: null | TemplateNode | Array<TemplateNode>;
	effect: null | EffectSignal;
	transitions: Set<Transition>;
	prev: Render | null;
};

export type Raf = {
	tick: (callback: (time: DOMHighResTimeStamp) => void) => any;
	now: () => number;
};
