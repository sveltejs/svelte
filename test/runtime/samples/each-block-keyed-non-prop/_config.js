export default {
	props: {
		words: ['foo', 'bar', 'baz']
	},

	html: `
		<p>foo</p>
		<p>bar</p>
		<p>baz</p>
	`,

	test({ assert, component, target }) {
		const [p1, p2, p3] = target.querySelectorAll('p');

		component.words = ['foo', 'baz'];

		assert.htmlEqual(target.innerHTML, `
			<p>foo</p>
			<p>baz</p>
		`);

		const [p4, p5] = target.querySelectorAll('p');

		assert.ok(!target.contains(p2), '<p> element should be removed');

		assert.equal(p1, p4, 'first <p> element should be retained');
		assert.equal(p3, p5, 'last <p> element should be retained');
	},
};
