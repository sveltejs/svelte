import { test } from '../../test';

export default test({
	test(assert, target, snapshot, component, window) {
		const head = target.ownerDocument.head;
		const meta = head.querySelectorAll('meta[name="author"]');
		const link = head.querySelectorAll('link[rel="author"]');
		const script = head.querySelectorAll('script[type="application/ld+json"]');

		assert.equal(meta.length, 1);
		assert.equal(link.length, 1);
		assert.equal(script.length, 1);

		assert.equal(meta[0].getAttribute('class'), null);
		assert.equal(link[0].getAttribute('class'), null);
		assert.equal(script[0].getAttribute('class'), null);

		assert.equal(meta[0].getAttribute('content'), 'Re:Designed');
		assert.equal(link[0].getAttribute('href'), 'https://example.com/re-designed');
	}
});
