import { test, ok } from '../../test';

export default test({
	html: `<svg><a href="/docs"><text class="small" x="20" y="40"></text></a></svg>`,
	test({ assert, target }) {
		const a = target.querySelector('a');
		ok(a);

		assert.equal(a.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
