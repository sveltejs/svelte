import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [svg1, svg2] = target.querySelectorAll('svg');
		const [path1, path2] = target.querySelectorAll('path');
		const [fO1, fO2] = target.querySelectorAll('foreignObject');
		const [span1, span2] = target.querySelectorAll('span');

		assert.equal(svg1.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(path1.namespaceURI, 'http://www.w3.org/2000/svg');

		assert.equal(svg2.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(path2.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(fO1.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(span1.namespaceURI, 'http://www.w3.org/1999/xhtml');
		assert.equal(fO2.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(span2.namespaceURI, 'http://www.w3.org/1999/xhtml');
	}
});
