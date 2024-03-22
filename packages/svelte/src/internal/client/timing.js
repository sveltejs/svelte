import { noop } from '../common.js';

const is_client = typeof window !== 'undefined';

const request_animation_frame = is_client ? requestAnimationFrame : noop;

const now = is_client ? () => performance.now() : () => Date.now();

/** @type {import('./types.js').Raf} */
export const raf = {
	tick: /** @param {any} _ */ (_) => request_animation_frame(_),
	now: () => now(),
	tasks: new Set()
};
