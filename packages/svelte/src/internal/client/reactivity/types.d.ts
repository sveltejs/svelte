import type { Block, ComponentContext, Equals } from '#client';
import type { EFFECT, PRE_EFFECT, RENDER_EFFECT } from '../constants';

export type EffectType = typeof EFFECT | typeof PRE_EFFECT | typeof RENDER_EFFECT;

export interface Source<V = unknown> {
	/** Signals that read from this signal */
	reactions: null | Reaction[];
	/** Equality function */
	eq: Equals;
	/** Flags bitmask */
	f: number;
	/** The latest value for this signal */
	v: V;
	/** Write version */
	w: number;
}

export interface SourceDebug<V = unknown> extends Source<V> {
	inspect: Set<Function>;
}

export interface Derived<V = unknown> extends Source<V> {
	/** Signals that this signal reads from */
	deps: null | Value[];
	/** The derived function */
	fn: () => V;

	// TODO get rid of these

	/** references: Anything that a signal owns */
	r: null | Reaction[];
	/** block: The block associated with this effect/computed */
	b: null | Block;
	/** context: The associated component if this signal is an effect/computed */
	x: null | ComponentContext;
}

export interface DerivedDebug<V = unknown> extends Derived<V> {
	inspect: Set<Function>;
}

export type Effect = {
	/** block: The block associated with this effect/computed */
	b: null | Block;
	/** context: The associated component if this signal is an effect/computed */
	x: null | ComponentContext;
	/** dependencies: Signals that this signal reads from */
	deps: null | Value[];
	/** destroy: Thing(s) that need destroying */
	y: null | (() => void);
	/** Flags bitmask */
	f: number;
	/** init: The function that we invoke for effects and computeds */
	fn: null | (() => void | (() => void)) | ((b: Block, s: Signal) => void | (() => void));
	/** references: Anything that a signal owns */
	r: null | Reaction[];
	/** value: The latest value for this signal, doubles as the teardown for effects */
	v: null | Function;
	/** level: the depth from the root signal, used for ordering render/pre-effects topologically **/
	l: number;
	/** write version: used for unowned signals to track if their depdendencies are dirty or not **/
	w: number;
};

export type Reaction = Derived | Effect;

export type MaybeSignal<T = unknown> = T | Source<T>;

export type UnwrappedSignal<T> = T extends Value<infer U> ? U : T;

export type Value<V = unknown> = Source<V> | Derived<V>;

export type ValueDebug<V = unknown> = SourceDebug<V> | DerivedDebug<V>;

export type Signal = Source | Derived | Effect;
