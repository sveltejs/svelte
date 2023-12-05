import { test } from '../../test';

export default test({
	html: `<button>[{"data":{"a":0}}]</button>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `<button>[{"data":{"a":0}},{"data":{"a":1}}]</button>`);
	}
});
