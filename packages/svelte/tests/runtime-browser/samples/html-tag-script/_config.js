import { test } from '../../assert';

export default test({
	// Test that @html does not execute scripts when instantiated in the client.
	// Needs to be in this test suite because JSDOM does not quite get this right.
	mode: ['client'],
	test({ window, assert }) {
		// In here to give effects etc time to execute
		assert.htmlEqual(
			window.document.body.innerHTML,
			`<main><div></div><script>document.body.innerHTML = 'this should not be executed'</script></main>`
		);
	}
});
