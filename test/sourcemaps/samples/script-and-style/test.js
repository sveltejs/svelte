import { assert_mapped } from '../../helpers';

export function test({ input, preprocessed }) {
	assert_mapped({
		code: '<h1>Hello world!</h1>',
		input: input.locate,
		preprocessed
	});
}
