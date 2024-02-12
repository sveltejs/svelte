import { test } from '../../test';
import { magic_string_bundle } from '../../helpers.js';

export const component_filepath = 'src/input.svelte';

export const component_file_basename = 'input.svelte';

// as output by external tool for src/external_code.css (relative to src/input.svelte)
export const external_relative_filename = 'external_code.css';

const external_code = `
span {
	--external_code-var: 1px;
}
`;

export default test({
	css_map_sources: [external_relative_filename],
	preprocess: [
		{
			style: ({ content, filename = '' }) => {
				const external = `/* Filename from preprocess: ${filename} */` + external_code;
				return magic_string_bundle([
					{ code: external, filename: external_relative_filename },
					{ code: content, filename }
				]);
			}
		}
	],
	options: {
		filename: component_filepath
	},
	client: [],
	preprocessed: ['Hello world'],
	test({ assert, code_preprocessed, map_preprocessed }) {
		assert.include(
			code_preprocessed,
			`/* Filename from preprocess: ${component_filepath} */`,
			'Preprocessor should receive same value for filename as passed to preprocess function'
		);

		assert.deepEqual(
			map_preprocessed.sources.slice().sort(),
			[external_relative_filename, component_file_basename].sort(),
			'Preprocessed map should contain sources relative to filepath'
		);
	}
});
