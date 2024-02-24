import type { DERIVED, EFFECT, PRE_EFFECT, RENDER_EFFECT, SOURCE } from '../constants';
import type { ComponentContext, EqualsFunctions, TemplateNode, Transition } from '../types';

type SignalFlags =
	| typeof SOURCE
	| typeof DERIVED
	| typeof EFFECT
	| typeof PRE_EFFECT
	| typeof RENDER_EFFECT;

export type EffectType = typeof EFFECT | typeof PRE_EFFECT | typeof RENDER_EFFECT;

export interface Source<V = unknown> {
	/** consumers: Signals that read from the current signal */
	consumers: null | Reaction[];
	/** equals: For value equality */
	eq: EqualsFunctions;
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
	deps: null | ValueSignal[];
	/** init: The function that we invoke for effects and computeds */
	fn: () => V;
}

export interface DerivedDebug<V = unknown> extends Derived<V> {
	inspect: Set<Function>;
}

export interface Effect {
	/** context: The associated component if this signal is an effect/computed */
	ctx: null | ComponentContext;
	/** dependencies: Signals that this signal reads from */
	deps: null | ValueSignal[];
	/** destroy: Thing(s) that need destroying */
	y: null | (() => void);
	/** The types that the signal represent, as a bitwise value */
	f: SignalFlags;
	/** init: The function that we invoke for effects and computeds */
	fn: null | (() => void | (() => void));
	/** deriveds belonging to this effect */
	r: null | Derived[];
	/** teardown */
	v: null | (() => void);
	/** level: the depth from the root signal, used for ordering render/pre-effects topologically **/
	l: number;
	/** in transitions */
	in: null | Transition[];
	/** out transitions */
	out: null | Transition[];
	/** DOM nodes belonging to this effect */
	dom: null | TemplateNode | Array<TemplateNode>;
	/** Whether the effect ran or not */
	ran: boolean;
	parent: null | Effect;
	children: null | Effect[];
}

export type Reaction = Derived | Effect;

export type ValueSignal<V = unknown> = Source<V> | Derived<V>;

export type ValueSignalDebug<V = unknown> = SourceDebug<V> | DerivedDebug<V>;

export type Signal = Source | Derived | Effect;
