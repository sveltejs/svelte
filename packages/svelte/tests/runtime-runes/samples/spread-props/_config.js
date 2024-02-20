import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`<button data-attr="">Hello world</button><button data-attr="">Hello world</button>`
		);
	}
});
