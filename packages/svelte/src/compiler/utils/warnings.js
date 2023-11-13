import { getLocator } from 'locate-character';

/**
 * @param {string} source
 * @param {string | undefined} name
 * @param {import('#compiler').RawWarning[]} warnings
 * @returns {import('#compiler').Warning[]}
 */
export function transform_warnings(source, name, warnings) {
	if (warnings.length === 0) return [];

	const locate = getLocator(source, { offsetLine: 1 });

	/** @type {import('#compiler').Warning[]} */
	const result = [];

	for (const warning of warnings) {
		const start =
			warning.position &&
			/** @type {import('locate-character').Location} */ (locate(warning.position[0]));

		const end =
			warning.position &&
			/** @type {import('locate-character').Location} */ (locate(warning.position[1]));

		result.push({
			start,
			end,
			filename: name,
			message: warning.message,
			code: warning.code
		});
	}

	return result;
}
