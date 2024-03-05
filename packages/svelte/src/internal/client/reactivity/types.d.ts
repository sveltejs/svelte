import type { Block, ComponentContext, EqualsFunctions } from '#client';
import type { DERIVED, EFFECT, PRE_EFFECT, RENDER_EFFECT, SOURCE } from '../constants';

export type SignalFlags =
	| typeof SOURCE
	| typeof DERIVED
	| typeof EFFECT
	| typeof PRE_EFFECT
	| typeof RENDER_EFFECT;
export type EffectType = typeof EFFECT | typeof PRE_EFFECT | typeof RENDER_EFFECT;

// We keep two shapes rather than a single monomorphic shape to improve the memory usage.
// Source signals don't need the same shape as they simply don't do as much as computations
// (effects and derived signals). Thus we can improve the memory profile at the slight cost
// of some runtime performance.

export type SourceSignal<V = unknown> = {
	/** consumers: Signals that read from the current signal */
	c: null | ComputationSignal[];
	/** equals: For value equality */
	e: null | EqualsFunctions;
	/** flags: The types that the signal represent, as a bitwise value */
	f: SignalFlags;
	/** value: The latest value for this signal */
	v: V;
	// write version
	w: number;
};

export type SourceSignalDebug = {
	/** This is DEV only */
	inspect: Set<Function>;
};

export type ComputationSignal<V = unknown> = {
	/** block: The block associated with this effect/computed */
	b: null | Block;
	/** consumers: Signals that read from the current signal */
	c: null | ComputationSignal[];
	/** context: The associated component if this signal is an effect/computed */
	x: null | ComponentContext;
	/** dependencies: Signals that this signal reads from */
	d: null | Signal<V>[];
	/** destroy: Thing(s) that need destroying */
	y: null | (() => void) | Array<() => void>;
	/** equals: For value equality */
	e: null | EqualsFunctions;
	/** The types that the signal represent, as a bitwise value */
	f: SignalFlags;
	/** init: The function that we invoke for effects and computeds */
	i:
		| null
		| (() => V)
		| (() => void | (() => void))
		| ((b: Block, s: Signal) => void | (() => void));
	/** references: Anything that a signal owns */
	r: null | ComputationSignal[];
	/** value: The latest value for this signal, doubles as the teardown for effects */
	v: V;
	/** level: the depth from the root signal, used for ordering render/pre-effects topologically **/
	l: number;
	/** write version: used for unowned signals to track if their depdendencies are dirty or not **/
	w: number;
};

export type Signal<V = unknown> = SourceSignal<V> | ComputationSignal<V>;

export type SignalDebug<V = unknown> = SourceSignalDebug & Signal<V>;

export type EffectSignal = ComputationSignal<null | (() => void)>;

export type MaybeSignal<T = unknown> = T | Signal<T>;

export type UnwrappedSignal<T> = T extends Signal<infer U> ? U : T;
