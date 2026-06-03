import { test } from '../../assert';

// Browsers split text nodes > 65536 characters into multiple consecutive text nodes
// during HTML parsing. This test verifies that hydration correctly merges them.
const LARGE_TEXT = 'x'.repeat(70000);

export default test({
	mode: ['hydrate'],
	skip_mode: ['client'],

	props: {
		text: LARGE_TEXT
	},

	async test({ assert, target }) {
		const [p] = target.querySelectorAll('p');

		// The text content should be preserved after hydration
		assert.equal(p.textContent?.trim(), LARGE_TEXT);
		// After hydration, there should be only one text node (plus possible comment nodes)
		const textNodes = [...p.childNodes].filter((node) => node.nodeType === 3);
		assert.equal(textNodes.length, 1, `Expected 1 text node, got ${textNodes.length}`);
	}
});
