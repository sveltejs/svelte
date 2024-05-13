import { getLocator } from 'locate-character';

/** @typedef {{ start?: number, end?: number }} NodeLike */

/** @type {import('#compiler').Warning[]} */
export let warnings = [];

/** @type {string | undefined} */
export let filename;

export let locator = getLocator('', { offsetLine: 1 });

/**
 * @param {{
 *   source: string;
 *   filename: string | undefined;
 * }} options
 * @returns {{ warnings: import('#compiler').Warning[] }}
 */
export function reset(options) {
	filename = options.filename;
	locator = getLocator(options.source, { offsetLine: 1 });

	return {
		warnings: (warnings = [])
	};
}
