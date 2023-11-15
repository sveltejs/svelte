import * as assert from 'node:assert';
import { getLocator } from 'locate-character';
import MagicString, { Bundle } from 'magic-string';

/**
 * @typedef {{ code: string; filename?: string; input: string | ReturnType<typeof getLocator>; input_code?: string; preprocessed: any; }} AssertMappedParameters
 */

/**
 * @param {AssertMappedParameters} param
 */
export function assert_mapped({ code, filename, input, input_code, preprocessed }) {
	const locate_input = typeof input === 'function' ? input : getLocator(input);
	if (filename === undefined) filename = 'input.svelte';
	if (input_code === undefined) input_code = code;

	const source_loc = /** @type {import('locate-character').Location} */ (locate_input(input_code));
	assert.notEqual(source_loc, undefined, `failed to locate "${input_code}" in "${filename}"`);

	const transformed_loc = preprocessed.locate_1(code);
	assert.notEqual(
		transformed_loc,
		undefined,
		`failed to locate "${code}" in transformed "${filename}"`
	);

	assert.deepEqual(
		preprocessed.mapConsumer.originalPositionFor(transformed_loc),
		{
			source: filename,
			name: null,
			line: source_loc.line + 1,
			column: source_loc.column
		},
		`incorrect mappings for "${input_code}" in "${filename}"`
	);
}

/**
 * @typedef {{ code: string; filename?: string; preprocessed: any; }} AssertNotMappedParameters
 */

/**
 * @param {AssertNotMappedParameters} param
 */
export function assert_not_mapped({ code, filename, preprocessed }) {
	if (filename === undefined) filename = 'input.svelte';

	const transformed_loc = preprocessed.locate_1(code);
	assert.notEqual(
		transformed_loc,
		undefined,
		`failed to locate "${code}" in transformed "${filename}"`
	);

	assert.deepEqual(
		preprocessed.mapConsumer.originalPositionFor(transformed_loc),
		{
			source: null,
			name: null,
			line: null,
			column: null
		},
		`incorrect mappings for "${code}" in "${filename}"`
	);
}

/**
 * @param {string} code
 * @param {ReturnType<typeof getLocator>} locate
 * @param {string} filename
 */
export function assert_not_located(code, locate, filename = 'input.svelte') {
	assert.equal(
		locate(code),
		undefined,
		`located "${code}" that should be removed from ${filename}`
	);
}

/**
 * @param {Array<{ code: string | MagicString, filename: string }>} inputs
 * @param {string} filename
 * @param {string} separator
 * @returns
 */
export function magic_string_bundle(inputs, filename = 'bundle.js', separator = '\n') {
	const bundle = new Bundle({ separator });
	inputs.forEach(({ code, filename }) => {
		bundle.addSource({
			filename,
			content: typeof code === 'string' ? new MagicString(code) : code
		});
	});
	return {
		code: bundle.toString(),
		map: bundle.generateMap({
			source: filename,
			hires: true,
			includeContent: false
		})
	};
}

/**
 * @param {string} filename
 * @param {MagicString} src
 * @returns
 */
export function magic_string_preprocessor_result(filename, src) {
	return {
		code: src.toString(),
		map: src.generateMap({
			source: filename,
			hires: true,
			includeContent: false
		})
	};
}

/**
 * @param {MagicString} src
 * @param {string} search
 * @param {string} replace
 */
export function magic_string_replace_all(src, search, replace) {
	let idx = src.original.indexOf(search);
	if (idx == -1) throw new Error('search not found in src');
	do {
		src.overwrite(idx, idx + search.length, replace, { storeName: true });
	} while ((idx = src.original.indexOf(search, idx + 1)) != -1);
}
