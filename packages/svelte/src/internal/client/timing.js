/** @import { Raf } from '#client' */
import { noop } from '../shared/utils.js';

import { BROWSER } from 'esm-env';

const now = BROWSER ? () => performance.now() : () => Date.now();

/** @type {Raf} */
export const raf = {
	tick: /** @param {any} _ */ (_) => (BROWSER ? requestAnimationFrame : noop)(_),
	now: () => now(),
	tasks: new Set()
};
