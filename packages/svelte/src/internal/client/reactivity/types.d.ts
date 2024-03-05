import type { Block, ComponentContext, EqualsFunctions } from '#client';
import type { DERIVED, EFFECT, PRE_EFFECT, RENDER_EFFECT, SOURCE } from '../constants';

export type SignalFlags =
	| typeof SOURCE
	| typeof DERIVED
	| typeof EFFECT
	| typeof PRE_EFFECT
	| typeof RENDER_EFFECT;
export type EffectType = typeof EFFECT | typeof PRE_EFFECT | typeof RENDER_EFFECT;

export interface Source<V = unknown> {
	/** consumers: Signals that read from the current signal */
	c: null | Reaction[];
	/** equals: For value equality */
	e: null | EqualsFunctions;
	/** flags: The types that the signal represent, as a bitwise value */
	f: SignalFlags;
	/** value: The latest value for this signal */
	v: V;
	// write version
	w: number;
}

export interface SourceDebug<V = unknown> extends Source<V> {
	inspect: Set<Function>;
}

export interface Derived<V = unknown> extends Source<V> {
	/** dependencies: Signals that this signal reads from */
	d: null | Value[];
	/** The derived function */
	i: () => V;

	// TODO get rid of these

	/** references: Anything that a signal owns */
	r: null | Reaction[];
	/** block: The block associated with this effect/computed */
	b: null | Block;
	/** context: The associated component if this signal is an effect/computed */
	x: null | ComponentContext;
	/** destroy: Thing(s) that need destroying */
	y: null | (() => void) | Array<() => void>;
}

export interface DerivedDebug<V = unknown> extends Derived<V> {
	inspect: Set<Function>;
}

export type Effect = {
	/** block: The block associated with this effect/computed */
	b: null | Block;
	/** consumers: Signals that read from the current signal */
	c: null | Reaction[];
	/** context: The associated component if this signal is an effect/computed */
	x: null | ComponentContext;
	/** dependencies: Signals that this signal reads from */
	d: null | Value[];
	/** destroy: Thing(s) that need destroying */
	// TODO simplify this, it is only used in one place
	y: null | (() => void) | Array<() => void>;
	/** equals: For value equality */
	e: null | EqualsFunctions;
	/** The types that the signal represent, as a bitwise value */
	f: SignalFlags;
	/** init: The function that we invoke for effects and computeds */
	i: null | (() => void | (() => void)) | ((b: Block, s: Signal) => void | (() => void));
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

export type Signal<V = unknown> = Source<V> | Reaction;

export type MaybeSignal<T = unknown> = T | Source<T>;

export type UnwrappedSignal<T> = T extends Value<infer U> ? U : T;

export type Value<V = unknown> = Source<V> | Derived<V>;

export type ValueDebug<V = unknown> = SourceDebug<V> | DerivedDebug<V>;
