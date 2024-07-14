import { ok, test } from '../../test';

export default test({
	async test({ assert, target }) {
		const circle = target.querySelector('circle');
		ok(circle);
		assert.equal(circle.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
