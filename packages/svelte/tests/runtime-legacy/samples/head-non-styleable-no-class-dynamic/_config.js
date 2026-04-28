import { flushSync } from 'svelte';
import { test } from '../../test';

function assert_head_tags_have_no_class(assert, head) {
	const meta = head.querySelector('meta[name="author"]');
	const link = head.querySelector('link[rel="author"]');
	const script = head.querySelector('script[type="application/ld+json"]');

	assert.ok(meta);
	assert.ok(link);
	assert.ok(script);

	assert.equal(meta.getAttribute('class'), null);
	assert.equal(link.getAttribute('class'), null);
	assert.equal(script.getAttribute('class'), null);
}

export default test({
	test({ assert, target }) {
		const head = target.ownerDocument.head;
		const button = target.querySelector('button');

		assert_head_tags_have_no_class(assert, head);

		assert.equal(head.querySelector('meta[name="author"]')?.getAttribute('content'), 'Re:Designed');
		assert.equal(
			head.querySelector('link[rel="author"]')?.getAttribute('href'),
			'https://example.com/re-designed'
		);

		flushSync(() => {
			button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		});

		assert_head_tags_have_no_class(assert, head);

		assert.equal(head.querySelector('meta[name="author"]')?.getAttribute('content'), 'Anonymous');
		assert.equal(
			head.querySelector('link[rel="author"]')?.getAttribute('href'),
			'https://example.com/anonymous'
		);
	}
});
