import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	async test({ assert, target }) {
		const btn = target.querySelector('button');

		await btn?.click();
		assert.htmlEqual(target.innerHTML, `<button></button>\n[object Object]`);
	}
});
