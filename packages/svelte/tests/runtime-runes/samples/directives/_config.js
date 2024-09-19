import { test } from '../../test';

export default test({
	html: `<div><p class="foo" style="color: red;">This text should be red with a class of foo</p></div>`,

	async test({ assert, target }) {
		const p = target.querySelector('p');

		assert.equal(p?.className, `foo`);
		assert.equal(p?.style.color, `red`);
	}
});
