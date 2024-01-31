import { test } from '../../test';

export default test({
	html: `<input type="checkbox"><br>\nChecked:\nfalse`,

	async test({ assert, target }) {
		const input = target.querySelector('input');

		await input?.click();
		assert.htmlEqual(target.innerHTML, `<input type="checkbox"><br>\nChecked:\ntrue`);
	}
});
