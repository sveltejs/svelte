import { ok, test } from '../../test';

// Checks that the template function is correct when there's a svg before a div
export default test({
	html: `
		<svg viewBox='0 0 100 100' id='one'>
			<text textLength=100>hellooooo</text>
		</svg>

		<math>
			<mrow></mrow>
		</svg>

		<div class="hi">hi</div>
	`,

	test({ assert, target }) {
		const svg = target.querySelector('svg');
		ok(svg);
		assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');

		const math = target.querySelector('math');
		ok(math);
		assert.equal(math.namespaceURI, 'http://www.w3.org/1998/Math/MathML');

		const div = target.querySelector('div');
		ok(div);
		assert.equal(div.namespaceURI, 'http://www.w3.org/1999/xhtml');
	}
});
