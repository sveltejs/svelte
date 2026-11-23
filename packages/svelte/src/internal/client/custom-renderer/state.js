/** @import { Renderer } from './types.js'; */

import { hydrating, set_hydrating } from '../dom/hydration.js';

/**
 * @type {Renderer<any> | null}
 */
export let current_renderer = null;

/**
 * @param {Renderer<any> | null} value
 */
export function set_renderer(value) {
	current_renderer = value;
}

/** How many `push_renderer` calls haven't been matched by a `pop_renderer` yet */
var depth = 0;

/** @type {number[]} Depths of pushes that suspended hydration, including nested hydrate calls */
var suspended_hydration_at = [];

/**
 * Makes `value` the current renderer (`null` for the DOM), returning the previous one.
 * Every call must be matched by a call to `pop_renderer` with the returned value
 * (in a `finally` block, if anything in between can throw).
 *
 * Custom renderers never hydrate, so hydration is suspended while one is active.
 * This doesn't allocate, since it runs for every effect when custom renderers are used.
 * @param {Renderer<any> | null} value
 * @returns {Renderer<any> | null}
 */
export function push_renderer(value) {
	var previous = current_renderer;
	current_renderer = value;
	depth += 1;

	// this is to allow hydration code to treeshake
	if (hydrating && value !== null) {
		set_hydrating(false);
		suspended_hydration_at.push(depth);
	}

	return previous;
}

/**
 * Restores the renderer that was current before the matching `push_renderer` call
 * @param {Renderer<any> | null} previous The value returned by `push_renderer`
 */
export function pop_renderer(previous) {
	if (suspended_hydration_at[suspended_hydration_at.length - 1] === depth) {
		suspended_hydration_at.pop();
		set_hydrating(true);
	}

	depth -= 1;
	current_renderer = previous;
}
