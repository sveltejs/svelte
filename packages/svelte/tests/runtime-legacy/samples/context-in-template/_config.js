import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `hello world`);
	}
});
