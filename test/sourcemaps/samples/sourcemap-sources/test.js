export function test({ assert, preprocessed, js, css }) {

	const msg_expected = 'Transformation map 0 must have exactly one source file.';

  assert.notEqual(preprocessed.error, undefined, 'expected preprocessed.error');

	assert.equal(
		preprocessed.error.message.slice(0, msg_expected.length),
		msg_expected
	);

}
