import { DEV } from 'esm-env';
import { on_destroy } from './index.js';
import * as e from '../shared/errors.js';

/** @type {import('#server').Component | null} */
export var current_component = null;

/**
 * @template T
 * @param {any} key
 * @returns {T}
 */
export function getContext(key) {
	const context_map = get_or_init_context_map('getContext');
	const result = /** @type {T} */ (context_map.get(key));

	return result;
}

/**
 * @template T
 * @param {any} key
 * @param {T} context
 * @returns {T}
 */
export function setContext(key, context) {
	get_or_init_context_map('setContext').set(key, context);
	return context;
}

/**
 * @param {any} key
 * @returns {boolean}
 */
export function hasContext(key) {
	return get_or_init_context_map('hasContext').has(key);
}

/** @returns {Map<any, any>} */
export function getAllContexts() {
	return get_or_init_context_map('getAllContexts');
}

/**
 * @param {string} name
 * @returns {Map<unknown, unknown>}
 */
function get_or_init_context_map(name) {
	if (current_component === null) {
		e.lifecycle_outside_component(name);
	}

	return (current_component.c ??= new Map(get_parent_context(current_component) || undefined));
}

export function push() {
	current_component = { p: current_component, c: null, d: null };
}

export function pop() {
	var component = /** @type {import('#server').Component} */ (current_component);

	var ondestroy = component.d;

	if (ondestroy) {
		on_destroy.push(...ondestroy);
	}

	current_component = component.p;
}

/**
 * @param {import('#server').Component} component_context
 * @returns {Map<unknown, unknown> | null}
 */
function get_parent_context(component_context) {
	let parent = component_context.p;

	while (parent !== null) {
		const context_map = parent.c;
		if (context_map !== null) {
			return context_map;
		}
		parent = parent.p;
	}

	return null;
}
