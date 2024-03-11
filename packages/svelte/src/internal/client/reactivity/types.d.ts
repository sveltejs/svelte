import type { Block, ComponentContext, Equals } from '#client';
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
	eq: Equals;
	/** The latest value for this signal */
	v: V;
	/** Write version */
	w: number;
}

export interface Reaction extends Signal {
	/** The reaction function */
	fn: null | Function;
	/** Signals that this signal reads from */
	deps: null | Value[];
	/** Effects created inside this signal */
	effects: null | Effect[];
	/** Deriveds created inside this signal */
	deriveds: null | Derived[];
}

export interface Derived<V = unknown> extends Value<V>, Reaction {
	fn: () => V;
}

export interface Effect extends Reaction {
	/** block: The block associated with this effect/computed */
	block: null | Block;
	/** context: The associated component if this signal is an effect/computed */
	ctx: null | ComponentContext;
	/** destroy: Thing(s) that need destroying */
	ondestroy: null | (() => void);
	/** init: The function that we invoke for effects and computeds */
	fn: null | (() => void | (() => void)) | ((b: Block, s: Signal) => void | (() => void));
	/** value: The latest value for this signal, doubles as the teardown for effects */
	teardown: null | (() => void);
	/** level: the depth from the root signal, used for ordering render/pre-effects topologically **/
	l: number;
	/** write version: used for unowned signals to track if their depdendencies are dirty or not **/
	w: number;
}

export interface ValueDebug<V = unknown> extends Value<V> {
	inspect: Set<Function>;
}

export interface DerivedDebug<V = unknown> extends Derived<V>, ValueDebug<V> {}

export type Source<V = unknown> = Value<V>;

export type MaybeSignal<T = unknown> = T | Source<T>;

export type UnwrappedSignal<T> = T extends Value<infer U> ? U : T;
