import { test } from '../../test';

export default test({
	html: `[{"a":0}] <button>[{"a":0}]</button>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `[{"a":0}] <button>[{"a":0},{"a":1}]</button>`);
	}
});
