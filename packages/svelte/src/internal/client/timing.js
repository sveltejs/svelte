/** @import { Raf } from '#client' */
import { noop } from '../shared/utils.js';

import { BROWSER } from 'esm-env';

const request_animation_frame = BROWSER ? requestAnimationFrame : noop;

const now = BROWSER ? () => performance.now() : () => Date.now();

/** @type {Raf} */
export const raf = {
	tick: /** @param {any} _ */ (_) => request_animation_frame(_),
	now: () => now(),
	tasks: new Set()
};
