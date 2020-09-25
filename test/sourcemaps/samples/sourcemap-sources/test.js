export function test({ assert, preprocessed, js, css }) {

	assert.notEqual(preprocessed.error, undefined, 'expected preprocessed.error');

	const msg_expected_prefix = 'Transformation map 0 must have exactly one source file.';

	assert.equal(
		preprocessed.error.message.slice(0, msg_expected_prefix.length),
		msg_expected_prefix
	);

}
