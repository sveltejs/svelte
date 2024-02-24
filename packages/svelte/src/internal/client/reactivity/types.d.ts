import type { Computation, EqualsFunctions, SignalFlags } from '../types';

export type Source<V = unknown> = {
	/** consumers: Signals that read from the current signal */
	c: null | Computation[];
	/** equals: For value equality */
	e: null | EqualsFunctions;
	/** flags: The types that the signal represent, as a bitwise value */
	f: SignalFlags;
	/** value: The latest value for this signal */
	v: V;
	// write version
	w: number;
};

export type SourceDebug = {
	/** This is DEV only */
	inspect: Set<Function>;
};
