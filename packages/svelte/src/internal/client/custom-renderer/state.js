/** @import { Renderer } from './types.js'; */

import { hydrating, set_hydrating } from '../dom/hydration.js';

/**
 * @type {Renderer<any, any, any, any> | null}
 */
export let current_renderer = null;

/**
 * The renderer that was active before `current_renderer` was pushed. This
 * allows custom renderers to be interleaved (e.g. a custom renderer rendering
 * into another one) by keeping a reference to the renderer one level up.
 * @type {Renderer<any, any, any, any> | null}
 */
export let parent_renderer = null;

/**
 * @param {Renderer<any, any, any, any> | null} value
 */
export function set_renderer(value) {
	current_renderer = value;
}

/**
 * @param {Renderer<any, any, any, any> | null} value
 */
export function set_parent_renderer(value) {
	parent_renderer = value;
}

/**
 *
 * @param {Renderer<any, any, any, any> | null} value
 * @param {Renderer<any, any, any, any> | null} [parent] the renderer to restore as the
 * `parent_renderer`. Defaults to the current renderer so that, in the common case, the
 * renderer that was active before this push becomes the parent.
 */
export function push_renderer(value, parent = current_renderer) {
	var previous_hydrating = hydrating;
	var should_disable_hydration = hydrating && value != null;
	// this is to allow hydration code to treeshake
	if (should_disable_hydration) {
		set_hydrating(false);
	}
	var previous_renderer = current_renderer;
	var previous_parent_renderer = parent_renderer;
	parent_renderer = parent;
	current_renderer = value;

	return () => {
		current_renderer = previous_renderer;
		parent_renderer = previous_parent_renderer;
		if (should_disable_hydration) {
			set_hydrating(previous_hydrating);
		}
	};
}
