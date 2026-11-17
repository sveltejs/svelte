// NOTE: this is an internal, DEV-only, observe-only channel for the official Svelte devtools.
// It has no stability guarantee and can change in any release.

declare const signal_brand: unique symbol;
declare const reaction_brand: unique symbol;
declare const effect_brand: unique symbol;
declare const component_brand: unique symbol;
declare const batch_brand: unique symbol;

/** A reactive value: `$state`, `$derived`, a property of a `$state` proxy, … */
export interface Signal {
	readonly [signal_brand]: true;
}

/** Something that reads signals and re-runs: an effect or a derived */
export interface Reaction {
	readonly [reaction_brand]: true;
}

/** A derived is both a signal and a reaction */
export interface Derived extends Signal, Reaction {}

export interface Effect extends Reaction {
	readonly [effect_brand]: true;
}

/** The context of a component instance (`$.push(...)`) */
export interface ComponentContext {
	readonly [component_brand]: true;
}

/** A batch of state changes, possibly a fork */
export interface Batch {
	readonly [batch_brand]: true;
}

export type SignalKind = 'state' | 'derived' | 'async-derived' | 'proxy-prop' | 'proxy-version';

export type EffectKind =
	| 'root'
	| 'branch'
	| 'block'
	| 'render'
	| 'effect'
	| 'effectPre'
	| 'managed'
	| 'async'
	| 'eager';

export interface SignalCreatedInfo {
	kind: SignalKind;
	/** e.g. `count` for `let count = $state(0)`, or `todos[0].text` for a proxy property */
	label: string | undefined;
	/** `file:line:column` of the declaration, if known */
	location: string | undefined;
	/** The component context active when the signal was created */
	ctx: ComponentContext | null;
	/** The effect active when the signal was created */
	effect: Effect | null;
	/** For `proxy-prop` and `proxy-version` signals: the `$state` proxy owning this signal */
	proxy?: object;
	/** For `proxy-prop` signals: the property of `proxy` this signal stores */
	key?: PropertyKey;
}

export interface SignalWrittenInfo {
	/** The value before the write. Inside a fork, this is the committed value */
	old: unknown;
	value: unknown;
	/** The batch this write belongs to */
	batch: Batch;
}

/**
 * A devtools plugin. Every method is optional, is called synchronously and untracked,
 * and must not write state. Return values are ignored.
 */
export interface DevtoolsHooks {
	/** Subscribing with the name of an existing plugin replaces it */
	name: string;

	// components
	componentCreated?(ctx: ComponentContext): void;
	componentInitialized?(ctx: ComponentContext): void;
	componentDestroyed?(ctx: ComponentContext): void;

	// signals
	signalCreated?(signal: Signal, info: SignalCreatedInfo): void;
	signalWritten?(signal: Signal, info: SignalWrittenInfo): void;

	// effects and deriveds
	effectCreated?(effect: Effect): void;
	effectDestroyed?(effect: Effect): void;
	reactionRunStart?(reaction: Reaction): void;
	reactionRunEnd?(reaction: Reaction): void;

	// batches
	flushStart?(batch: Batch): void;
	flushEnd?(batch: Batch): void;
	batchCommitted?(batch: Batch): void;
	batchDiscarded?(batch: Batch): void;

	// misc
	hmrUpdateStart?(filename: string | undefined): void;
	hmrUpdateEnd?(filename: string | undefined): void;
	warningEmitted?(code: string, args: unknown[]): void;
}

export * from './index.js';
