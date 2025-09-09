import { ok, test } from '../../test';

export default test({
	skip: true,
	html: `
		<p>hello</p>
	`,

	async test({ assert, target }) {
		const p = target.querySelector('p');
		ok(p);
		assert.htmlEqual(p.outerHTML, '<p>hello</p>');
	}
});
