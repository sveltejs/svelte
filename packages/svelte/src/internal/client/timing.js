/** @import { Raf } from '#client' */
import { noop } from '../shared/utils.js';

import { BROWSER } from 'esm-env';

const now = BROWSER ? () => performance.now() : () => Date.now();

/** @type {Raf} */
export const raf = {
	// don't access requestAnimationFrame eagerly outside method
	// this allows basic testing of user code without JSDOM
	// bunder will eval and remove ternary when the user's app is built
	tick: /** @param {any} _ */ (_) => (BROWSER ? requestAnimationFrame : noop)(_),
	now: () => now(),
	tasks: new Set()
};
