export const DERIVED = 1 << 1;
export const EFFECT = 1 << 2;
export const RENDER_EFFECT = 1 << 3;
export const BLOCK_EFFECT = 1 << 4;
export const BRANCH_EFFECT = 1 << 5;
export const ROOT_EFFECT = 1 << 6;
export const BOUNDARY_EFFECT = 1 << 7;
export const UNOWNED = 1 << 8;
export const DISCONNECTED = 1 << 9;
export const CLEAN = 1 << 10;
export const DIRTY = 1 << 11;
export const MAYBE_DIRTY = 1 << 12;
export const INERT = 1 << 13;
export const DESTROYED = 1 << 14;
export const EFFECT_RAN = 1 << 15;
/** 'Transparent' effects do not create a transition boundary */
export const EFFECT_TRANSPARENT = 1 << 16;
export const INSPECT_EFFECT = 1 << 17;
export const HEAD_EFFECT = 1 << 18;
export const EFFECT_PRESERVED = 1 << 19;
export const USER_EFFECT = 1 << 20;

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
