import { assert_mapped } from '../../helpers';
import { EXTERNAL } from './_config';

export function test({ input, preprocessed }) {
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
