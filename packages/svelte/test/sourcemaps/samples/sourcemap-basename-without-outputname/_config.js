import { magic_string_bundle } from '../../helpers.js';

export const component_filepath = 'src/some/deep/path/input.svelte';
export const component_file_basename = 'input.svelte';
export const css_file_basename = 'input.css';

const input_css = ' h1 {color: blue;}';

export default {
	preprocess: [
		{
			style: ({ content, filename }) => {
				const style_to_add = `/* Filename from preprocess: ${filename} */` + input_css;
				return magic_string_bundle(
					[
						{ code: content, filename: component_file_basename },
						{ code: style_to_add, filename: css_file_basename }
					],
					component_filepath
				);
			}
		}
	],
	js_map_sources: [component_file_basename],
	css_map_sources: [css_file_basename, component_file_basename],
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
