import { ok, test } from '../../test';

export default test({
	get props() {
		return { foo: 'bar' };
	},

	html: `
		<svg>
			<use xlink:href="#bar"/>
		</svg>
	`,

	test({ assert, target }) {
		const use = target.querySelector('use');
		ok(use);
		assert.equal(use.getAttributeNS('http://www.w3.org/1999/xlink', 'href'), '#bar');
	}
});
