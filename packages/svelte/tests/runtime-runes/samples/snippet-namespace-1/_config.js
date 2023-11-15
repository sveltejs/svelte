import { ok, test } from '../../test';

export default test({
	html: `
		<div>
			<svg>
				<line x1="0" y1="0" x2="100" y2="100" />
			</svg>
		</div>
	`,

	test({ assert, target }) {
		const div = target.querySelector('div');
		ok(div);
		assert.equal(div.namespaceURI, 'http://www.w3.org/1999/xhtml');

		const line = target.querySelector('line');
		ok(line);
		assert.equal(line.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
