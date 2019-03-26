export default {
	html: `
		<svg>
			<foreignObject x="0" y="0" width="100" height="100">
				<p>some text</p>
			</foreignObject>
		</svg>
	`,

	test({ assert, target }) {
		const p = target.querySelector('p');
		assert.equal(p.namespaceURI, 'http://www.w3.org/1999/xhtml');
	}
};
