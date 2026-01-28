import { test } from '../../test';

export default test({
	html: `
	<div><a><span>Hello</span></a></div>
	<div><a><span>Hello</span></a></div>
	<div><a><span>Hello</span></a></div>
`,
	test({ assert, target }) {
		const div = target.querySelectorAll('div');
		const a = target.querySelectorAll('a');
		const span = target.querySelectorAll('span');

		for (const element of div) {
			assert.equal(element.namespaceURI, 'http://www.w3.org/1999/xhtml');
		}

		for (const element of a) {
			assert.equal(element.namespaceURI, 'http://www.w3.org/1999/xhtml');
		}

		for (const element of span) {
			assert.equal(element.namespaceURI, 'http://www.w3.org/1999/xhtml');
		}
	}
});
