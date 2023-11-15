import { ok, test } from '../../test';

export default test({
	html: `
		<svg>
			<foreignObject>
				<p>hello</p>
			</foreignObject>
		</svg>
	`,

	test({ assert, target }) {
		const svg = target.querySelector('svg');
		ok(svg);
		assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');

		const p = target.querySelector('p');
		ok(p);
		assert.equal(p.namespaceURI, 'http://www.w3.org/1999/xhtml');
	}
});
