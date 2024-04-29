import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await target.querySelector('button')?.click();
		assert.htmlEqual(target.innerHTML, `<button>0</button>`);
	}
});
