import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const svg = target.querySelector('svg');
		const path = target.querySelector('path');
		assert.equal(svg?.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(path?.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
