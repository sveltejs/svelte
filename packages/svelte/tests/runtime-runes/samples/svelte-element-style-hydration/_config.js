import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	html: '<div><style>body { color: red; }</style></div>',
	test({ assert, target }) {
		const style = target.querySelector('style');
		assert.ok(style, 'style element should exist after hydration');
		if (style) {
			for (const child of Array.from(style.childNodes)) {
				assert.ok(
					child.nodeType !== 8, // Node.COMMENT_NODE
					'style element should not contain comment nodes after hydration'
				);
			}
		}
	}
});
