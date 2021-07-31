export const component_filepath = 'src/some/deep/path/input.svelte';

export const component_file_basename = 'input.svelte';

export default {

	js_map_sources: [component_file_basename],

	options: {
		filename: component_filepath
	},
	compile_options: {
		filename: component_filepath,
		// ../../index.ts initializes output filenames, reset to undefined for this test
		outputFilename: undefined,
		cssOutputFilename: undefined
	}
};
