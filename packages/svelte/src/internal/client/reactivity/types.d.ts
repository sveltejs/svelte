import type { ComponentContext, Dom, Equals, TemplateNode, TransitionManager } from '#client';

export interface Signal {
	/** Flags bitmask */
	f: number;
	/** Write version */
	wv: number;
}

export interface Value<V = unknown> extends Signal {
	/** Equality function */
	equals: Equals;
	/** Signals that read from this signal */
	reactions: null | Reaction[];
	/** Read version */
	rv: number;
	/** The latest value for this signal */
	v: V;
	/** Dev only */
	created?: Error | null;
	updated?: Error | null;
	trace_need_increase?: boolean;
	trace_v?: V;
	debug?: null | (() => void);
}

export interface Reaction extends Signal {
	/** The associated component context */
	ctx: null | ComponentContext;
	/** The reaction function */
	fn: null | Function;
	/** Signals that this signal reads from */
	deps: null | Value[];
}

export interface Derived<V = unknown> extends Value<V>, Reaction {
	/** The derived function */
	fn: () => V;
	/** Effects created inside this signal */
	effects: null | Effect[];
	/** Parent effect or derived */
	parent: Effect | Derived | null;
}

export interface Effect extends Reaction {
	/**
	 * Branch effects store their start/end nodes so that they can be
	 * removed when the effect is destroyed, or moved when an `each`
	 * block is reconciled. In the case of a single text/element node,
	 * `start` and `end` will be the same.
	 */
	nodes_start: null | TemplateNode;
	nodes_end: null | TemplateNode;
	/** The effect function */
	fn: null | (() => void | (() => void));
	/** The teardown function returned from the effect function */
	teardown: null | (() => void);
	/** Transition managers created with `$.transition` */
	transitions: null | TransitionManager[];
	/** Next sibling child effect created inside the parent signal */
	prev: null | Effect;
	/** Next sibling child effect created inside the parent signal */
	next: null | Effect;
	/** First child effect created inside this signal */
	first: null | Effect;
	/** Last child effect created inside this signal */
	last: null | Effect;
	/** Parent effect */
	parent: Effect | null;
	/** Dev only */
	component_function?: any;
}

export type Source<V = unknown> = Value<V>;

export type MaybeSource<T = unknown> = T | Source<T>;
