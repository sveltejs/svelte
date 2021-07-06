import { assert_mapped } from '../../helpers';

export function test({ input, preprocessed }) {
	assert_mapped({
		code: 'Target',
		input: input.locate,
		preprocessed
	});
}
