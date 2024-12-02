import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, ' / ');
		await new Promise((r) => setTimeout(r, 110));
		assert.htmlEqual(target.innerHTML, '42 / 42');
	}
});
