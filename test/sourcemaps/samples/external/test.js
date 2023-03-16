import { assert_mapped } from '../../helpers';
import { COMMON, STYLES } from './_config';

export function test({ input, preprocessed }) {
	// Transformed script, main file
	assert_mapped({
		filename: 'input.svelte',
		code: 'Divs ftw!',
		input: input.locate,
		preprocessed
	});

	// External files
	assert_mapped({
		filename: 'common.scss',
		code: 'height: 100%;',
		input: COMMON,
		preprocessed
	});
	assert_mapped({
		filename: 'styles.scss',
		code: 'color: orange;',
		input: STYLES,
		preprocessed
	});
}
