import { test } from '../../test';

export default test({
	html: '<svg><rect fill="black" width="10" height="90"></rect></svg>',

	test({ assert, target }) {
		const svg = target.querySelector('svg');
		const rect = target.querySelector('rect');
		assert.equal(svg?.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(rect?.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
