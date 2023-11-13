import { test } from '../../test';

export default test({
	async test({ assert, component, window, target }) {
		const event = new window.MouseEvent('click', { bubbles: true });
		const button = target.querySelector('button');

		await button?.dispatchEvent(event);
		assert.equal(component.logs.length, 0);
	}
});
