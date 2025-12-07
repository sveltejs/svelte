import { test } from '../../assert';

export default test({
	async test({ assert, target }) {
		// Test 1: Verify body content appears in body, not head
		const mainContent = target.querySelector('main');
		assert.ok(mainContent, 'Main element should exist in body');
		assert.equal(mainContent?.textContent, 'Main content');

		// Test 2: Verify head contains meta tag (head-specific)
		const metaTag = document.head.querySelector('meta[name="child-data"]');
		assert.ok(metaTag, 'Meta tag should be in head');
		assert.equal(metaTag?.getAttribute('content'), 'value');

		// Test 3: Verify title is in head
		const titleTag = document.head.querySelector('title');
		assert.ok(titleTag, 'Title should be in head');
		assert.equal(titleTag?.textContent, 'CSR Test');

		// Test 4: Verify body elements are NOT in head
		const pInHead = document.head.querySelector('p');
		assert.equal(pInHead, null, 'Paragraph element should NOT be in head');
	}
});
