/** @import { Renderer } from './types.js'; */

import { hydrating, set_hydrating } from '../dom/hydration.js';

/**
 * @type {Renderer<any, any, any, any> | null}
 */
export let current_renderer = null;

/**
 * @param {Renderer<any, any, any, any> | null} value
 */
export function set_renderer(value) {
	current_renderer = value;
}

/**
 *
 * @param {Renderer<any, any, any, any> | null} value
 */
export function push_renderer(value) {
	var previous_hydrating = hydrating;
	var should_disable_hydration = hydrating && value != null;
	// this is to allow hydration code to treeshake
	if (should_disable_hydration) {
		set_hydrating(false);
	}
	var previous_renderer = current_renderer;
	current_renderer = value;

	return () => {
		current_renderer = previous_renderer;
		if (should_disable_hydration) {
			set_hydrating(previous_hydrating);
		}
	};
}
