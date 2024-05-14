import { getLocator } from 'locate-character';

/** @typedef {{ start?: number, end?: number }} NodeLike */

/** @type {import('#compiler').Warning[]} */
export let warnings = [];

/** @type {string | undefined} */
export let filename;

export let locator = getLocator('', { offsetLine: 1 });

/** @type {Set<string>[]} */
export let ignore_stack = [];

/**
 * @param {string[]} ignores
 */
export function push_ignore(ignores) {
	const next = new Set([...(ignore_stack.at(-1) || []), ...ignores]);
	ignore_stack.push(next);
}

export function pop_ignore() {
	ignore_stack.pop();
}

/**
 * @param {{
 *   source: string;
 *   filename: string | undefined;
 * }} options
 */
export function reset(options) {
	filename = options.filename;
	locator = getLocator(options.source, { offsetLine: 1 });
	warnings = [];
	ignore_stack = [];
}
