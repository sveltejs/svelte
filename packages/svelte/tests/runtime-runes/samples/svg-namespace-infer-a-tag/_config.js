import { test } from '../../test';

export default test({
	html: `
	<svg><a><text>Hello</text></a></svg>
	<svg><a><text>Hello</text></a></svg>
	<svg><a><text>Hello</text></a></svg>
`,
	test({ assert, target }) {
		const svg = target.querySelectorAll('svg');
		const a = target.querySelectorAll('a');
		const text = target.querySelectorAll('text');

		for (const element of svg) {
			assert.equal(element.namespaceURI, 'http://www.w3.org/2000/svg');
		}

		for (const element of a) {
			assert.equal(element.namespaceURI, 'http://www.w3.org/2000/svg');
		}

		for (const element of text) {
			assert.equal(element.namespaceURI, 'http://www.w3.org/2000/svg');
		}
	}
});
