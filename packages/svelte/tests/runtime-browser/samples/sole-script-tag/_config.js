import { test } from '../../assert';

export default test({
	// Test that template with sole script tag does execute when instantiated in the client.
	// Needs to be in this test suite because JSDOM does not quite get this right.
	mode: ['client'],
	test({ window, assert }) {
		// In here to give effects etc time to execute
		assert.htmlEqual(window.document.body.innerHTML, 'this should be executed');
	}
});
