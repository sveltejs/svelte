export { flushSync, onDestroy, selector, tick, untrack } from '../internal/common/runtime.js';

export { getAllContexts, getContext, hasContext, setContext } from '../internal/common/index.js';

/** @returns {void} */
export function onMount() {}

/** @returns {void} */
export function beforeUpdate() {}

/** @returns {void} */
export function afterUpdate() {}

// TODO: Either move to common or replace with empty functions because some of these
export { createRoot, createEventDispatcher, mount } from './main-client.js';
