import { assert_mapped, assert_not_located } from '../../helpers.js';

export function test({ input, preprocessed }) {
	// TS => JS code
	assert_mapped({
		code: 'let count = 0;',
		input_code: 'let count: number = 0;',
		input: input.locate,
		preprocessed
	});

	// Markup, not touched
	assert_mapped({
		code: '<h1>Hello world!</h1>',
		input: input.locate,
		preprocessed
	});

	// TS types, removed
	assert_not_located('ITimeoutDestroyer', preprocessed.locate_1);
}
