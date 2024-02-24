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

export interface Derived<V = unknown> {
	/** consumers: Signals that read from the current signal */
	c: null | Reaction[];
	/** context: The associated component if this signal is an effect/computed */
	x: null | ComponentContext;
	/** dependencies: Signals that this signal reads from */
	d: null | ValueSignal[];
	/** equals: For value equality */
	e: null | EqualsFunctions;
	/** The types that the signal represent, as a bitwise value */
	f: SignalFlags;
	/** init: The function that we invoke for effects and computeds */
	i: () => V;
	/** references: Anything that a signal owns */
	r: null | Reaction[];
	/** value: The latest value for this signal */
	v: V;
	/** write version: used for unowned signals to track if their depdendencies are dirty or not **/
	w: number;
}

export interface DerivedDebug<V = unknown> extends Derived<V> {
	inspect: Set<Function>;
}

export interface Effect {
	/** consumers: Signals that read from the current signal */
	c: null | Reaction[];
	/** context: The associated component if this signal is an effect/computed */
	x: null | ComponentContext;
	/** dependencies: Signals that this signal reads from */
	d: null | ValueSignal[];
	/** destroy: Thing(s) that need destroying */
	y: null | (() => void) | Array<() => void>;
	/** equals: For value equality */
	e: null | EqualsFunctions;
	/** The types that the signal represent, as a bitwise value */
	f: SignalFlags;
	/** init: The function that we invoke for effects and computeds */
	i: null | (() => void | (() => void));
	/** references: Anything that a signal owns */
	r: null | Reaction[];
	/** teardown */
	v: null | (() => void);
	/** level: the depth from the root signal, used for ordering render/pre-effects topologically **/
	l: number;
	/** write version: used for unowned signals to track if their depdendencies are dirty or not **/
	w: number;
	/** in transitions */
	in: null | Transition[];
	/** out transitions */
	out: null | Transition[];
	/** DOM nodes belonging to this effect */
	dom: null | TemplateNode | Array<TemplateNode>;
	/** Whether the effect ran or not */
	ran: boolean;
	/** The parent effect */
	parent: null | Effect;
}

export type Reaction = Derived | Effect;

export type ValueSignal<V = unknown> = Source<V> | Derived<V>;

export type ValueSignalDebug<V = unknown> = SourceDebug<V> | DerivedDebug<V>;

export type Signal<V = unknown> = Source<V> | Reaction;
