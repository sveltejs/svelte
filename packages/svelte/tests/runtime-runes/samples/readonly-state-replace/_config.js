import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [b1] = target.querySelectorAll('button');
		b1.click();
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, `<button>0, 1</button>`);
	}
});
