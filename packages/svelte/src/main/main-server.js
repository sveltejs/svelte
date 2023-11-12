export { flushSync, onDestroy, selector, tick, untrack } from '../internal/client/runtime.js';

export { getAllContexts, getContext, hasContext, setContext } from '../internal/common/index.js';

/** @returns {void} */
export function onMount() {}

/** @returns {void} */
export function beforeUpdate() {}

/** @returns {void} */
export function afterUpdate() {}

// TODO: Replace with empty functions because these should not be run on the server
export { createRoot, createEventDispatcher, mount } from './main-client.js';
