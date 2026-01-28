import { test } from '../../test';

export default test({
	async test({ target, assert }) {
		assert.htmlEqual(target.innerHTML, `<p>bar</p>`);
	}
});
