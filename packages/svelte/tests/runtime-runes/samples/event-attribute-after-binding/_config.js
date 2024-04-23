import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [i1, i2] = target.querySelectorAll('input');

		i1?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'true true <input type="checkbox"> false false <input type="checkbox">'
		);

		i2?.click();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			'true true <input type="checkbox"> true true <input type="checkbox">'
		);
	}
});
