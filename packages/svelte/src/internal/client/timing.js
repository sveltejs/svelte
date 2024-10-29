/** @import { Raf } from '#client' */
import { noop } from '../shared/utils.js';

import { BROWSER, NODE } from 'esm-env';

// we check both conditions here to allow running browser code in Node for testing
const request_animation_frame = BROWSER && !NODE ? requestAnimationFrame : noop;

const now = BROWSER ? () => performance.now() : () => Date.now();

/** @type {Raf} */
export const raf = {
	tick: /** @param {any} _ */ (_) => request_animation_frame(_),
	now: () => now(),
	tasks: new Set()
};
