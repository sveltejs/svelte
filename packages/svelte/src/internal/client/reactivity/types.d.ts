import type {
	ComponentContext,
	DevStackEntry,
	Equals,
	TemplateNode,
	TransitionManager
} from '#client';
import type { Boundary } from '../dom/blocks/boundary';

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

	// dev-only
	/** A label (e.g. the `foo` in `let foo = $state(...)`) used for `$inspect.trace()` */
	label?: string;
	/** An error with a stack trace showing when the source was created */
	created?: Error | null;
	/** An map of errors with stack traces showing when the source was updated, keyed by the stack trace */
	updated?: Map<string, { error: Error; count: number }> | null;
	/**
	 * Whether or not the source was set while running an effect — if so, we need to
	 * increment the write version so that it shows up as dirty when the effect re-runs
	 */
	set_during_effect?: boolean;
	/** A function that retrieves the underlying source, used for each block item signals */
	trace?: null | (() => void);
}

export interface Reaction extends Signal {
	/** The associated component context */
	ctx: null | ComponentContext;
	/** The reaction function */
	fn: null | Function;
	/** Signals that this signal reads from */
	deps: null | Value[];
	/** An AbortController that aborts when the signal is destroyed */
	ac: null | AbortController;
}

export interface Derived<V = unknown> extends Value<V>, Reaction {
	/** The derived function */
	fn: () => V;
	/** Effects created inside this signal. Used to destroy those effects when the derived reruns or is cleaned up */
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
	/** The boundary this effect belongs to */
	b: Boundary | null;
	/** Dev only */
	component_function?: any;
	/** Dev only. Only set for certain block effects. Contains a reference to the stack that represents the render tree */
	dev_stack?: DevStackEntry | null;
}

export type Source<V = unknown> = Value<V>;

export type MaybeSource<T = unknown> = T | Source<T>;
