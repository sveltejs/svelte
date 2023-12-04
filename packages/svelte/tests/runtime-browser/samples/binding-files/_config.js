import { test } from '../../assert';

export default test({
	async test({ assert, window }) {
		const input = window.document.querySelector('input');
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(input?.files?.length, 1);
		window.document.querySelector('button')?.click();
		await new Promise((r) => setTimeout(r, 100));
		assert.equal(input?.files?.length, 0);
	}
});
