import type { Block, ComponentContext, Dom, Equals, TransitionManager } from '#client';
import type { EFFECT, PRE_EFFECT, RENDER_EFFECT } from '../constants';

export type EffectType = typeof EFFECT | typeof PRE_EFFECT | typeof RENDER_EFFECT;

export interface Signal {
	/** Flags bitmask */
	f: number;
}

export interface Value<V = unknown> extends Signal {
	/** Signals that read from this signal */
	reactions: null | Reaction[];
	/** Equality function */
	equals: Equals;
	/** The latest value for this signal */
	v: V;
	/** Write version */
	version: number;
}

export interface Reaction extends Signal {
	/** The reaction function */
	fn: Function;
	/** Signals that this signal reads from */
	deps: null | Value[];
	/** Effects created inside this signal */
	effects: null | Effect[];
	/** Deriveds created inside this signal */
	deriveds: null | Derived[];
}

export interface Derived<V = unknown> extends Value<V>, Reaction {
	/** The derived function */
	fn: () => V;
}

export interface Effect extends Reaction {
	parent: Effect | null;
	dom: Dom | null;
	/** The associated component context */
	ctx: null | ComponentContext;
	/** Stuff to do when the effect is destroyed */
	ondestroy: null | (() => void);
	/** The effect function */
	fn: () => void | (() => void);
	/** The teardown function returned from the effect function */
	teardown: null | (() => void);
	/** The depth from the root signal, used for ordering render/pre-effects topologically **/
	l: number;
	/** Transition managers created with `$.transition` */
	transitions: null | TransitionManager[];
}

export interface ValueDebug<V = unknown> extends Value<V> {
	inspect: Set<Function>;
}

export interface DerivedDebug<V = unknown> extends Derived<V>, ValueDebug<V> {}

export type Source<V = unknown> = Value<V>;

export type MaybeSource<T = unknown> = T | Source<T>;
