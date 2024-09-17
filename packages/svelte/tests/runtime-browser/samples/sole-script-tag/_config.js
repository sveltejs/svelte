import { test } from '../../assert';

export default test({
	// Test that template with sole script tag does execute when instantiated in the client.
	// Needs to be in this test suite because JSDOM does not quite get this right.
	mode: ['client'],
	async test({ target, assert }) {
		// In here to give effects etc time to execute
		assert.htmlEqual(target.querySelector('div')?.innerHTML || '', 'this should be executed');
		// Check that the script tag is properly removed
		target.querySelector('button')?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(target.querySelector('script'), null);
	}
});
