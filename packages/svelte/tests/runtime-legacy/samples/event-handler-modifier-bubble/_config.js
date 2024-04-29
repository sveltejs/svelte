import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		const button = target.querySelector('button');
		ok(button);

		await button.click();

		assert.ok(component.default_was_prevented);
	}
});
