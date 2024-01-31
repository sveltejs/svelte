import { test, ok } from '../../test';

export default test({
	html: `
	<svg>
		<text x="0" y="14">outside</text>
		<text x="0" y="26">true</text>
		<text x="0" y="42">0</text>
		<text x="10" y="42">1</text>
		<text x="20" y="42">2</text>
	</svg>
`,
	test({ assert, target }) {
		const svg = target.querySelector('svg');
		ok(svg);

		assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');

		const text_elements = target.querySelectorAll('text');

		assert.equal(text_elements.length, 5);

		for (const { namespaceURI } of text_elements)
			assert.equal(namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
