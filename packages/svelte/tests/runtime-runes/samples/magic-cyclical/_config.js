import { test } from '../../test';

export default test({
	html: `<button>hello!</button>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');
		await btn?.click();

		assert.htmlEqual(target.innerHTML, `<button>goodbye!</button>`);
	}
});
