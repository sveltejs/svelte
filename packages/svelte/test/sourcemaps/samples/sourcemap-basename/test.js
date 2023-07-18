import { component_filepath, component_file_basename, external_relative_filename } from './_config';

export function test({ assert, preprocessed }) {
	assert.notEqual(
		preprocessed.locate(`/* Filename from preprocess: ${component_filepath} */`),
		undefined,
		'Preprocessor should receive same value for filename as passed to preprocess function'
	);

	assert.deepEqual(
		preprocessed.map.sources.slice().sort(),
		[external_relative_filename, component_file_basename].sort(),
		'Preprocessed map should contain sources relative to filepath'
	);
}
