import { test } from '../../assert';

export default test({
	async test({ assert, window }) {
		window.document.querySelector('button')?.click();
		await new Promise((r) => setTimeout(r, 200));

		const [a, b] = window.document.querySelectorAll('div');
		assert.equal(a.style.overflowX, 'auto');
		assert.equal(b.style.overflowY, 'scroll');
	}
});
