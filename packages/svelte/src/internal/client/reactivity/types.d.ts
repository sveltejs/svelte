import type {
	AnimationManager,
	ComponentContext,
	DevStackEntry,
	Equals,
	TemplateNode,
	TransitionManager
} from '#client';
import type { Boundary } from '../dom/blocks/boundary';
import type { Batch } from './batch';

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
	/** The ordered dependencies of the global run. Never modified in place: it can be shared with records and `edges` */
	deps: null | Value[];
	/**
	 * The exact versions read by the global run, aligned with `deps`.
	 * `null` if no such run exists or it was invalidated. Owned by the global run, which updates it in place
	 */
	dv: null | number[];
	/** Graph edges: a superset of the dependencies of every live run. Never modified in place, like `deps` */
	edges: null | Value[];
	/**
	 * The AbortControllers of the runs that asked for a signal (see `getAbortSignal`), per batch that they ran in
	 * (`null` for runs outside of a batch). They abort once a run replaces them, or the reaction is destroyed
	 */
	ac: null | Map<Batch | null, AbortController>;
}

/**
 * A value of a signal and its version, as a batch holds it: a write in the batch (`Batch#current`),
 * the value from before the write (`Batch#previous`), or what a view of the world holds instead
 * of the real value (`batch_values`)
 */
export interface BatchValue {
	v: any;
	wv: number;
	/** Whether the value is an error */
	e?: boolean;
	/** Only in `Batch#previous`, for a derived: whether its value before was assigned, too (otherwise it was computed) */
	assigned?: boolean;
}

/**
 * The result of a run of a reaction retained by a batch:
 * the values it read (in order) and their exact versions at the time — and, for
 * deriveds, the resulting value and its version (see `DerivedRecord`)
 */
export interface BatchRecord {
	deps: null | Value[];
	dv: number[];
	/** Set for deriveds, omitted for effects */
	v?: any;
	/** Set for deriveds, omitted for effects */
	wv?: number;
	/** Whether the value of a derived record is an error */
	e?: boolean;
}

/** A record of a derived, which — unlike the record of an effect — has a value */
export interface DerivedRecord extends BatchRecord {
	v: any;
	wv: number;
	e: boolean;
}

export interface Derived<V = unknown> extends Value<V>, Reaction {
	/** The derived function */
	fn: () => V;
	/** Effects created inside this signal. Used to destroy those effects when the derived reruns or is cleaned up */
	effects: null | Effect[];
	/** Parent effect */
	parent: Effect | null;
}

export interface EffectNodes {
	start: TemplateNode;
	end: TemplateNode | null;
	/** $.animation */
	a: AnimationManager | null;
	/** $.transition */
	t: TransitionManager[] | null;
}

export interface Effect extends Reaction {
	/**
	 * Branch effects store their start/end nodes so that they can be
	 * removed when the effect is destroyed, or moved when an `each`
	 * block is reconciled. In the case of a single text/element node,
	 * `start` and `end` will be the same.
	 */
	nodes: null | EffectNodes;
	/** The effect function */
	fn: null | (() => void | (() => void));
	/** The teardown function returned from the effect function */
	teardown: null | (() => void);
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

/**
 * The async deriveds that content awaits (see `async_collected`)
 */
export interface Collector {
	/** The batch the code continues in: the one whose results the async deriveds it awaited resolved with */
	batch: Batch | null;
	/** Resolves once the content was created (or destroyed), `null` from then on */
	created: { promise: Promise<void>; resolve: () => void } | null;
}

export interface Blocker {
	promise: Promise<any>;
	settled: boolean;
	/** The code of the component's script that it belongs to, and the batch that code continued in, see `run` */
	collector?: Collector | null;
}
