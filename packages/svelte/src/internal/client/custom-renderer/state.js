/** @import { Renderer } from './types.js'; */

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
	var previous_renderer = current_renderer;
	current_renderer = value;

	return () => {
		current_renderer = previous_renderer;
	};
}

/**
 * @template T
 * @param {() => T} fn
 * @returns {T}
 */
export function without_renderer(fn) {
	if (current_renderer === null) {
		return fn();
	}

	var previous_renderer = current_renderer;
	current_renderer = null;

	try {
		return fn();
	} finally {
		current_renderer = previous_renderer;
	}
}
