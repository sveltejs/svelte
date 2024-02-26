import type { EFFECT, PRE_EFFECT, RENDER_EFFECT } from '../constants';
import type { ComponentContext, EqualsFunctions, TemplateNode, Transition } from '../types';

export type EffectType = typeof EFFECT | typeof PRE_EFFECT | typeof RENDER_EFFECT;

export interface Source<V = unknown> {
	/** Signals that read from this signal */
	reactions: null | Reaction[];
	/** Equality function */
	eq: EqualsFunctions;
	/** Flags bitmask */
	f: number;
	/** The latest value for this signal */
	v: V;
	// Write version
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
}

export interface DerivedDebug<V = unknown> extends Derived<V> {
	inspect: Set<Function>;
}

export interface Effect {
	/** The component to which this effect belongs, if any */
	ctx: null | ComponentContext;
	/** Signals that this signal reads from */
	deps: null | Value[];
	/** Thing(s) that need destroying */
	y: null | (() => void);
	/** Flags bitmask */
	f: number;
	/** The effect function */
	fn: null | (() => void | (() => void));
	/** Deriveds belonging to this effect */
	r: null | Derived[];
	/** Teardown function */
	v: null | (() => void);
	/** The depth from the root signal, used for ordering render/pre-effects topologically **/
	l: number;
	/** In transitions */
	in: null | Transition[];
	/** Out transitions */
	out: null | Transition[];
	/** DOM nodes belonging to this effect */
	dom: null | TemplateNode | Array<TemplateNode>;
	/** Whether the effect ran or not */
	ran: boolean;
	/** The parent effect */
	parent: null | Effect;
	/** Child effects */
	children: null | Effect[];
}

export type Reaction = Derived | Effect;

export type Value<V = unknown> = Source<V> | Derived<V>;

export type ValueDebug<V = unknown> = SourceDebug<V> | DerivedDebug<V>;

export type Signal = Source | Derived | Effect;
