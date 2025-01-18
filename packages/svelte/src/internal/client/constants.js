export const DERIVED = 1 << 1;
export const EFFECT = 1 << 2;
export const RENDER_EFFECT = 1 << 3;
export const BLOCK_EFFECT = 1 << 4;
export const BRANCH_EFFECT = 1 << 5;
export const ROOT_EFFECT = 1 << 6;
export const BOUNDARY_EFFECT = 1 << 7;
export const TEMPLATE_EFFECT = 1 << 8;
export const AWAIT_EFFECT = 1 << 9;
export const UNOWNED = 1 << 10;
export const DISCONNECTED = 1 << 11;
export const CLEAN = 1 << 12;
export const DIRTY = 1 << 13;
export const MAYBE_DIRTY = 1 << 14;
export const INERT = 1 << 15;
export const DESTROYED = 1 << 16;
export const EFFECT_RAN = 1 << 17;
/** 'Transparent' effects do not create a transition boundary */
export const EFFECT_TRANSPARENT = 1 << 18;
/** Svelte 4 legacy mode props need to be handled with deriveds and be recognized elsewhere, hence the dedicated flag */
export const LEGACY_DERIVED_PROP = 1 << 19;
export const INSPECT_EFFECT = 1 << 20;
export const HEAD_EFFECT = 1 << 21;
export const EFFECT_HAS_DERIVED = 1 << 22;

export const STATE_SYMBOL = Symbol('$state');
export const STATE_SYMBOL_METADATA = Symbol('$state metadata');
export const LEGACY_PROPS = Symbol('legacy props');
export const LOADING_ATTR_SYMBOL = Symbol('');
export const PENDING = Symbol();
