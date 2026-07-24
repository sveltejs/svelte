import { missing_context } from './errors.js';

/**
 * @template T
 * @param {(key: object) => T} get_context
 * @param {(key: object, context: T) => T} set_context
 * @param {(key: object) => boolean} has_context
 * @returns {[() => T, (context: T) => T]}
 */
export function create_context(get_context, set_context, has_context) {
	const key = {};

	return [
		() => {
			if (!has_context(key)) {
				missing_context();
			}

			return get_context(key);
		},
		(context) => set_context(key, context)
	];
}

/**
 * @typedef {{ p: Context | null, c: Map<unknown, unknown> | null }} Context
 */

/**
 * @param {Context} context
 * @returns {Map<unknown, unknown> | null}
 */
export function get_parent_context(context) {
	let parent = context.p;
	while (parent !== null) {
		const context_map = parent.c;
		if (context_map !== null) {
			return context_map;
		}
		parent = parent.p;
	}
	return null;
}
