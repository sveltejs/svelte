import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: false  // Test the fix works in production mode (where the issue was most severe)
	},
	async test({ mod, assert }) {
		// Try to instantiate the component using the old `new Component()` syntax
		// This should now throw a helpful error message instead of the cryptic "nodes_start" error
		try {
			const ComponentClass = mod.default;
			const app = new ComponentClass();
			assert.fail('Expected error when calling new ComponentClass()');
		} catch (error) {
			// The main fix: should NOT get the cryptic nodes_start error anymore
			assert.ok(!error.message.includes('nodes_start'), 'Should not get cryptic nodes_start error');
			
			// Should get a helpful error message instead
			const isHelpfulError = error.message.includes('no longer valid in Svelte 5') ||
								  error.message.includes('https://svelte.dev/e/component_api_invalid_new');
			assert.ok(isHelpfulError, 'Should get a helpful error message or URL');
			
			// Should be a proper Svelte error
			assert.equal(error.name, 'Svelte error', 'Should be a Svelte error');
		}
	}
});