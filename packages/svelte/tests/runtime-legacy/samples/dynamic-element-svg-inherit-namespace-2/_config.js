import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const path = target.querySelector('path');

		assert.equal(path?.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
