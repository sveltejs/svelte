// General flags
export const DERIVED = 1 << 1;
export const EFFECT = 1 << 2;
export const RENDER_EFFECT = 1 << 3;
export const BLOCK_EFFECT = 1 << 4;
export const BRANCH_EFFECT = 1 << 5;
export const ROOT_EFFECT = 1 << 6;
export const BOUNDARY_EFFECT = 1 << 7;
/**
 * Indicates that a reaction is connected to an effect root — either it is an effect,
 * or it is a derived that is depended on by at least one effect. If a derived has
 * no dependents, we can disconnect it from the graph, allowing it to either be
 * GC'd or reconnected later if an effect comes to depend on it again
 */
export const CONNECTED = 1 << 9;
export const CLEAN = 1 << 10;
export const DIRTY = 1 << 11;
export const MAYBE_DIRTY = 1 << 12;
export const INERT = 1 << 13;
export const DESTROYED = 1 << 14;

// Flags exclusive to effects
/** Set once an effect that should run synchronously has run */
export const EFFECT_RAN = 1 << 15;
/**
 * 'Transparent' effects do not create a transition boundary.
 * This is on a block effect 99% of the time but may also be on a branch effect if its parent block effect was pruned
 */
export const EFFECT_TRANSPARENT = 1 << 16;
export const EAGER_EFFECT = 1 << 17;
export const HEAD_EFFECT = 1 << 18;
export const EFFECT_PRESERVED = 1 << 19;
export const USER_EFFECT = 1 << 20;

// Flags exclusive to deriveds
/**
 * Tells that we marked this derived and its reactions as visited during the "mark as (maybe) dirty"-phase.
 * Will be lifted during execution of the derived and during checking its dirty state (both are necessary
 * because a derived might be checked but not executed).
 */
export const WAS_MARKED = 1 << 15;

// Flags used for async
export const REACTION_IS_UPDATING = 1 << 21;
export const ASYNC = 1 << 22;

export const ERROR_VALUE = 1 << 23;

export const STATE_SYMBOL = Symbol('$state');
export const LEGACY_PROPS = Symbol('legacy props');
export const LOADING_ATTR_SYMBOL = Symbol('');
export const PROXY_PATH_SYMBOL = Symbol('proxy path');

/** allow users to ignore aborted signal errors if `reason.name === 'StaleReactionError` */
export const STALE_REACTION = new (class StaleReactionError extends Error {
	name = 'StaleReactionError';
	message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
})();

export const ELEMENT_NODE = 1;
export const TEXT_NODE = 3;
export const COMMENT_NODE = 8;
export const DOCUMENT_FRAGMENT_NODE = 11;
