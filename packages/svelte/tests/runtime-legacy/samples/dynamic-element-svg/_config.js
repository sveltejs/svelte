import { test } from '../../test';

export default test({
	html: '<svg xmlns="http://www.w3.org/2000/svg"><path xmlns="http://www.w3.org/2000/svg"></path></svg>',

	test({ assert, target }) {
		const svg = target.querySelector('svg');
		const rect = target.querySelector('path');
		assert.equal(svg?.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(rect?.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
