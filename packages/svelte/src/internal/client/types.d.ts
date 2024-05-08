import type { Store } from '#shared';
import { STATE_SYMBOL } from './constants.js';
import type { Effect, Source, Value } from './reactivity/types.js';

type EventCallback = (event: Event) => boolean;
export type EventCallbackMap = Record<string, EventCallback | EventCallback[]>;

// For all the core internal objects, we use single-character property strings.
// This not only reduces code-size and parsing, but it also improves the performance
// when the JS VM JITs the code.

export type ComponentContext = {
	/** parent */
	p: null | ComponentContext;
	/** context */
	c: null | Map<unknown, unknown>;
	/** deferred effects */
	e: null | Array<() => void | (() => void)>;
	/** mounted */
	m: boolean;
	/**
	 * props — needed for legacy mode lifecycle functions, and for `createEventDispatcher`
	 * @deprecated remove in 6.0
	 */
	s: Record<string, unknown>;
	/**
	 * exports (and props, if `accessors: true`) — needed for `createEventDispatcher`
	 * @deprecated remove in 6.0
	 */
	x: Record<string, any> | null;
	/**
	 * legacy stuff
	 * @deprecated remove in 6.0
	 */
	l: null | {
		/** local signals (needed for beforeUpdate/afterUpdate) */
		s: null | Source[];
		/** update_callbacks */
		u: null | {
			/** afterUpdate callbacks */
			a: Array<() => void>;
			/** beforeUpdate callbacks */
			b: Array<() => void>;
			/** onMount callbacks */
			m: Array<() => any>;
		};
		/** `$:` statements */
		r1: any[];
		/** This tracks whether `$:` statements have run in the current cycle, to ensure they only run once */
		r2: Source<boolean>;
	};
	/**
	 * dev mode only: the component function
	 */
	function?: any;
};

export type ComponentContextLegacy = ComponentContext & {
	l: NonNullable<ComponentContext['l']>;
};

export type Equals = (this: Value, value: unknown) => boolean;

export type TemplateNode = Text | Element | Comment;

export type Dom = TemplateNode | TemplateNode[];

export type EachState = {
	/** flags */
	flags: number;
	/** a key -> item lookup */
	items: Map<any, EachItem>;
	/** head of the linked list of items */
	next: EachItem | null;
};

export type EachItem = {
	/** animation manager */
	a: AnimationManager | null;
	/** effect */
	e: Effect;
	/** item */
	v: any | Source<any>;
	/** index */
	i: number | Source<number>;
	/** key */
	k: unknown;
	/** anchor for items inserted before this */
	o: Comment | Text;
	prev: EachItem | EachState;
	next: EachItem | null;
};

export interface TransitionManager {
	/** Whether the `global` modifier was used (i.e. `transition:fade|global`) */
	is_global: boolean;
	/** Called inside `resume_effect` */
	in: () => void;
	/** Called inside `pause_effect` */
	out: (callback?: () => void) => void;
	/** Called inside `destroy_effect` */
	stop: () => void;
}

export interface AnimationManager {
	/** An element with an `animate:` directive */
	element: Element;
	/** Called during keyed each block reconciliation, before updates */
	measure: () => void;
	/** Called during keyed each block reconciliation, after updates — this triggers the animation */
	apply: () => void;
	/** Fix the element position, so that siblings can move to the correct destination */
	fix: () => void;
	/** Unfix the element position if the outro is aborted */
	unfix: () => void;
}

export interface Animation {
	/** Abort the animation */
	abort: () => void;
	/** Allow the animation to continue running, but remove any callback. This prevents the removal of an outroing block if the corresponding intro has a `delay` */
	deactivate: () => void;
	/** Resets an animation to its starting state, if it uses `tick`. Exposed as a separate method so that an aborted `out:` can still reset even if the `outro` had already completed */
	reset: () => void;
	/** Get the `t` value (between `0` and `1`) of the animation, so that its counterpart can start from the right place */
	t: (now: number) => number;
}

export type TransitionFn<P> = (
	element: Element,
	props: P,
	options: { direction?: 'in' | 'out' | 'both' }
) => AnimationConfig | ((options: { direction?: 'in' | 'out' }) => AnimationConfig);

export type AnimateFn<P> = (
	element: Element,
	rects: { from: DOMRect; to: DOMRect },
	props: P
) => AnimationConfig;

export type AnimationConfig = {
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

export type Raf = {
	/** Alias for `requestAnimationFrame`, exposed in such a way that we can override in tests */
	tick: (callback: (time: DOMHighResTimeStamp) => void) => any;
	/** Alias for `performance.now()`, exposed in such a way that we can override in tests */
	now: () => number;
	/** A set of tasks that will run to completion, unless aborted */
	tasks: Set<TaskEntry>;
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
	/** Dev-only — the components that 'own' this state, if any. `null` means no owners, i.e. everyone can mutate this state. */
	owners: null | Set<Function>;
	/** Dev-only — the parent metadata object */
	parent: null | ProxyMetadata;
}

export type ProxyStateObject<T = Record<string | symbol, any>> = T & {
	[STATE_SYMBOL]: ProxyMetadata;
};

export * from './reactivity/types';
