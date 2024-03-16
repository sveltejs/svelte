import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();

		assert.htmlEqual(target.innerHTML, `<button>1 1 1</button>`);

		await btn?.click();

		assert.htmlEqual(target.innerHTML, `<button>2 2 2</button>`);
	}
});
