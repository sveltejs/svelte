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
/** Svelte 4 legacy mode props need to be handled with deriveds and be recognized elsewhere, hence the dedicated flag */
export const LEGACY_DERIVED_PROP = 1 << 17;
export const INSPECT_EFFECT = 1 << 18;
export const HEAD_EFFECT = 1 << 19;
export const EFFECT_HAS_DERIVED = 1 << 20;
export const EFFECT_IS_UPDATING = 1 << 21;

export const STATE_SYMBOL = Symbol('$state');
export const LEGACY_PROPS = Symbol('legacy props');
export const LOADING_ATTR_SYMBOL = Symbol('');
export const PROXY_PATH_SYMBOL = Symbol('proxy path');
