export const SOURCE = 1;
export const DERIVED = 1 << 1;
export const EFFECT = 1 << 2;
export const PRE_EFFECT = 1 << 3;
export const RENDER_EFFECT = 1 << 4;
export const MANAGED = 1 << 6;
export const UNOWNED = 1 << 7;
export const CLEAN = 1 << 8;
export const DIRTY = 1 << 9;
export const MAYBE_DIRTY = 1 << 10;
export const INERT = 1 << 11;
export const DESTROYED = 1 << 12;
export const ROOT_EFFECT = 1 << 13;
export const BRANCH_EFFECT = 1 << 14;

export const IF_BLOCK = 1;
export const EACH_BLOCK = 2;
export const EACH_ITEM_BLOCK = 3;
export const HEAD_BLOCK = 6;
export const DYNAMIC_COMPONENT_BLOCK = 7;
export const DYNAMIC_ELEMENT_BLOCK = 8;
export const SNIPPET_BLOCK = 9;

export const UNINITIALIZED = Symbol();
export const STATE_SYMBOL = Symbol('$state');
