export const DERIVED = 1 << 1;
export const EFFECT = 1 << 2;
export const RENDER_EFFECT = 1 << 3;
export const BLOCK_EFFECT = 1 << 4;
export const BRANCH_EFFECT = 1 << 5;
export const ROOT_EFFECT = 1 << 6;
export const UNOWNED = 1 << 7;
export const DISCONNECTED = 1 << 8;
export const CLEAN = 1 << 9;
export const DIRTY = 1 << 10;
export const MAYBE_DIRTY = 1 << 11;
export const INERT = 1 << 12;
export const DESTROYED = 1 << 13;
export const EFFECT_RAN = 1 << 14;
/** 'Transparent' effects do not create a transition boundary */
export const EFFECT_TRANSPARENT = 1 << 15;
/** Svelte 4 legacy mode props need to be handled with deriveds and be recognized elsewhere, hence the dedicated flag */
export const LEGACY_DERIVED_PROP = 1 << 16;
export const INSPECT_EFFECT = 1 << 17;
export const HEAD_EFFECT = 1 << 18;

export const STATE_SYMBOL = Symbol('$state');
export const STATE_FROZEN_SYMBOL = Symbol('$state.frozen');
export const LOADING_ATTR_SYMBOL = Symbol('');
