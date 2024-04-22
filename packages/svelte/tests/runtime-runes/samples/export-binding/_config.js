import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true // to ensure we don't throw a false-positive "cannot bind to this" error
	},
	html: `0 0 <button>increment</button>`,

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, `0 1 <button>increment</button>`);
	}
});
