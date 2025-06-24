export const DERIVED = 1 << 1;
export const EFFECT = 1 << 2;
export const RENDER_EFFECT = 1 << 3;
export const BLOCK_EFFECT = 1 << 4;
export const BRANCH_EFFECT = 1 << 5;
export const ROOT_EFFECT = 1 << 6;
export const BOUNDARY_EFFECT = 1 << 7;
export const UNOWNED = 1 << 9;
export const DISCONNECTED = 1 << 10;
export const CLEAN = 1 << 11;
export const DIRTY = 1 << 12;
export const MAYBE_DIRTY = 1 << 13;
export const INERT = 1 << 14;
export const DESTROYED = 1 << 15;
export const EFFECT_RAN = 1 << 16;
/** 'Transparent' effects do not create a transition boundary */
export const EFFECT_TRANSPARENT = 1 << 17;
/** Svelte 4 legacy mode props need to be handled with deriveds and be recognized elsewhere, hence the dedicated flag */
export const LEGACY_DERIVED_PROP = 1 << 18;
export const INSPECT_EFFECT = 1 << 19;
export const HEAD_EFFECT = 1 << 20;
export const EFFECT_HAS_DERIVED = 1 << 21;
export const EFFECT_IS_UPDATING = 1 << 22;
export const EFFECT_PRESERVED = 1 << 23; // effects with this flag should not be pruned

// Flags used for async
export const REACTION_IS_UPDATING = 1 << 24;
export const EFFECT_ASYNC = 1 << 25;

export const ASYNC_ERROR = 1;

export const STATE_SYMBOL = Symbol('$state');
export const PROXY_PATH_SYMBOL = Symbol('proxy path');
export const LEGACY_PROPS = Symbol('legacy props');
export const LOADING_ATTR_SYMBOL = Symbol('');

export const STALE_REACTION = Symbol('stale reaction');

export const ELEMENT_NODE = 1;
export const TEXT_NODE = 3;
export const COMMENT_NODE = 8;
export const DOCUMENT_FRAGMENT_NODE = 11;
