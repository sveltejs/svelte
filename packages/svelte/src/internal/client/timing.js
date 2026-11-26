/** @import { Raf } from '#client' */
import { noop } from '../shared/utils.js';
import { custom_renderers_flag } from '../flags/index.js';

import { BROWSER } from 'esm-env';

const now = BROWSER ? () => performance.now() : () => Date.now();

/** @type {Raf} */
export const raf = {
	// don't access requestAnimationFrame eagerly outside method
	// this allows basic testing of user code without JSDOM
	// bunder will eval and remove ternary when the user's app is built
	tick: /** @param {any} _ */ (_) => {
		if (custom_renderers_flag) {
			// Custom renderers can run outside the browser (e.g. Node with the `svelte-custom-renderer`
			// condition), where `requestAnimationFrame` might not exist. Fall back to a timer so that
			// loops (e.g. `Tween`/`Spring` from `svelte/motion`) still run instead of silently stalling
			return typeof requestAnimationFrame === 'function'
				? requestAnimationFrame(_)
				: setTimeout(_, 1000 / 60);
		}

		return (BROWSER ? requestAnimationFrame : noop)(_);
	},
	now: () => now(),
	tasks: new Set()
};
