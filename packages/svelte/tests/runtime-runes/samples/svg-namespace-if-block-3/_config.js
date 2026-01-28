import { test, ok } from '../../test';

export default test({
	html: `<svg><title>potato</title></svg>`,
	test({ assert, target }) {
		const title = target.querySelector('title');
		ok(title);

		assert.equal(title.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
