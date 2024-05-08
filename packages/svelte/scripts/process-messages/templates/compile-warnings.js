import { getLocator } from 'locate-character';

/** @typedef {{ start?: number, end?: number }} NodeLike */

/** @type {Array<{ warning: import('#compiler').Warning; legacy_code: string | null }>} */
let warnings = [];

/** @type {Set<string>[]} */
let ignore_stack = [];

/** @type {string | undefined} */
let filename;

let locator = getLocator('', { offsetLine: 1 });

/**
 * @param {{
 *   source: string;
 *   filename: string | undefined;
 * }} options
 */
export function reset_warnings(options) {
	filename = options.filename;
	ignore_stack = [];
	warnings = [];
	locator = getLocator(options.source, { offsetLine: 1 });
}

/**
 * @param {boolean} is_runes
 */
export function get_warnings(is_runes) {
	/** @type {import('#compiler').Warning[]} */
	const final = [];
	for (const { warning, legacy_code } of warnings) {
		if (legacy_code) {
			if (is_runes) {
				final.push({
					...warning,
					message:
						(warning.message += ` (this warning was tried to silence using code ${legacy_code}. In runes mode, use the new code ${warning.code} instead)`)
				});
			}
		} else {
			final.push(warning);
		}
	}

	return final;
}

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

// TODO add more mappings for prominent codes that have been renamed
const legacy_codes = new Map([
	['reactive_declaration_invalid_placement', 'non-top-level-reactive-declaration']
]);

/**
 * @param {null | NodeLike} node
 * @param {string} code
 * @param {string} message
 */
function w(node, code, message) {
	const ignores = ignore_stack.at(-1);
	if (ignores?.has(code)) return;

	// backwards compat: Svelte 5 changed all warnings from dash to underscore
	/** @type {string | null} */
	let legacy_code = legacy_codes.get(code) || code.replaceAll('_', '-');
	if (!ignores?.has(legacy_code)) {
		legacy_code = null;
	}

	warnings.push({
		legacy_code,
		warning: {
			code,
			message,
			filename,
			start: node?.start !== undefined ? locator(node.start) : undefined,
			end: node?.end !== undefined ? locator(node.end) : undefined
		}
	});
}

/**
 * MESSAGE
 * @param {null | NodeLike} node
 * @param {string} PARAMETER
 */
export function CODE(node, PARAMETER) {
	w(node, 'CODE', MESSAGE);
}
