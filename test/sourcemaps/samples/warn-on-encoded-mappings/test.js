export function test({ assert, preprocessed, js }) {

	assert.equal(preprocessed.error, undefined);

  // TODO can we automate this test?
  // we need the output of console.log
  // to test the warning message.
  // or use a different method for warnings?

  // expected warning message:
  // warning. svelte.preprocess received encoded sourcemaps (index 0, 2). [....]

}
