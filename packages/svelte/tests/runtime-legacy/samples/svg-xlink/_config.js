import { ok, test } from '../../test';

export default test({
	html: `
		<svg>
			<defs>
				<circle id='stamp' r='10' fill='blue'/>
			</defs>

			<use xlink:href='#stamp' x='20' y='20'/>
		</svg>
	`,
	test({ assert, target }) {
		const use = target.querySelector('use');
		ok(use);

		// @ts-ignore
		const href = use.attributes['xlink:href'];

		assert.equal(href.namespaceURI, 'http://www.w3.org/1999/xlink');
	}
});
