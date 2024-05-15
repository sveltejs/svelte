import { test, ok } from '../../test';

export default test({
	html: `
	<math>
		<mrow></mrow>
		<mrow></mrow>
		<mrow></mrow>
		<mrow></mrow>
		<mrow></mrow>
		<mrow></mrow>
	</math>
`,
	test({ assert, target }) {
		const math = target.querySelector('math');
		ok(math);

		assert.equal(math.namespaceURI, 'http://www.w3.org/1998/Math/MathML');

		const mrow_elements = target.querySelectorAll('mrow');

		assert.equal(mrow_elements.length, 6);

		for (const { namespaceURI } of mrow_elements)
			assert.equal(namespaceURI, 'http://www.w3.org/1998/Math/MathML');
	}
});
