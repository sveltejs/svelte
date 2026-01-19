import { test } from '../../test';

export default test({
	// This test verifies that completely static select with rich option content
	// hydrates correctly and the content is preserved
	snapshot(target) {
		const select = target.querySelector('select');
		const options = target.querySelectorAll('option');

		return {
			select,
			option1: options[0],
			option2: options[1],
			option3: options[2]
		};
	},

	async test(assert, target) {
		const options = target.querySelectorAll('option');

		// Verify the rich content is present in the options
		assert.equal(options[0]?.textContent, 'Bold Option');
		assert.equal(options[1]?.textContent, 'Italic Option');
		assert.equal(options[2]?.textContent, 'Plain Option');

		// Check that the rich elements are actually there (on supporting browsers)
		const strong = options[0]?.querySelector('strong');
		const em = options[1]?.querySelector('em');

		// These may or may not exist depending on browser support
		// but the text content should always be correct
		if (strong) {
			assert.equal(strong.textContent, 'Bold');
		}
		if (em) {
			assert.equal(em.textContent, 'Italic');
		}
	}
});
