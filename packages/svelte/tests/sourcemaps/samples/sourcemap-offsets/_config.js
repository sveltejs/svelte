import { test } from '../../test';
import { magic_string_bundle } from '../../helpers.js';

export const EXTERNAL = 'span { --external-var: 1px; }';

export default test({
	skip: true,
	css_map_sources: ['input.svelte', 'external.css'],
	preprocess: [
		{
			style: ({ content, filename = '' }) => {
				return magic_string_bundle([
					{ code: EXTERNAL, filename: 'external.css' },
					{ code: content, filename }
				]);
			}
		}
	],
	test({ input, preprocessed }) {
		// Part from component, should be with offset
		assert_mapped({
			code: '--component-var',
			input: input.locate,
			preprocessed
		});

		// Part from external file, should be without offset
		assert_mapped({
			filename: 'external.css',
			code: '--external-var',
			input: EXTERNAL,
			preprocessed
		});
	}
});
