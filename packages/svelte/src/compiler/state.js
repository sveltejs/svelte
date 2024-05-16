import { getLocator } from 'locate-character';

/** @typedef {{ start?: number, end?: number }} NodeLike */

/** @type {import('#compiler').Warning[]} */
export let warnings = [];

/**
 * The filename (if specified in the compiler options) relative to the rootDir (if specified).
 * This should not be used in the compiler output except in dev mode
 * @type {string | undefined}
 */
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
 * @param {string} source
 * @param {{ filename?: string, rootDir?: string }} options
 */
export function reset(source, options) {
	const root_dir = options.rootDir?.replace(/\\/g, '/');
	filename = options.filename?.replace(/\\/g, '/');

	if (
		typeof filename === 'string' &&
		typeof root_dir === 'string' &&
		filename.startsWith(root_dir)
	) {
		// make filename relative to rootDir
		filename = filename.replace(root_dir, '').replace(/^[/\\]/, '');
	}

	locator = getLocator(source, { offsetLine: 1 });
	warnings = [];
	ignore_stack = [];
}
