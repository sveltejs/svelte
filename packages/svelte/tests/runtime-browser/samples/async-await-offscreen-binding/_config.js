import { test } from '../../assert';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true } },
	async test({ assert, target }) {
		await new Promise((resolve) => setTimeout(resolve, 700));
		assert.htmlEqual(
			target.innerHTML,
			'<details open><summary>group</summary></details><p>second</p>'
		);
	}
});
