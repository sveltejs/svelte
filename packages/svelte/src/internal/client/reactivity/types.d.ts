import type { ComponentContext, Dom, Equals, TemplateNode, TransitionManager } from '#client';

export interface Signal {
	/** Flags bitmask */
	f: number;
	/** Write version */
	version: number;
}

export interface Value<V = unknown> extends Signal {
	/** Signals that read from this signal */
	reactions: null | Reaction[];
	/** Equality function */
	equals: Equals;
	/** The latest value for this signal */
	v: V;
	/** Dev only */
	created?: Error | null;
	updated?: Error | null;
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
	/** Reactions created inside this signal */
	children: null | Reaction[];
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
	/** Reactions created inside this signal */
	deriveds: null | Derived[];
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
