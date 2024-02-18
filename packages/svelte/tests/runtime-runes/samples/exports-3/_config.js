import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `0 0 <button>0 / 0</button>`);
		const [btn] = target.querySelectorAll('button');

		btn?.click();
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '1 2 <button>1 / 2</button>');
	}
});
