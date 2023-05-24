import { noop } from './utils.js';

export const is_client = typeof window !== 'undefined';

/** @type {() => number} */
export let now = is_client ? () => window.performance.now() : () => Date.now();

export let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

// used internally for testing
/** @returns {void} */
export function set_now(fn) {
	now = fn;
}

/** @returns {void} */
export function set_raf(fn) {
	raf = fn;
}
