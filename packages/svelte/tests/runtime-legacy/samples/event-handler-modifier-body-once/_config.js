import { test } from '../../test';

export default test({
	async test({ assert, component, window }) {
		const event = new window.MouseEvent('click', { bubbles: true });

		await window.document.body.dispatchEvent(event);
		assert.equal(component.count, 1);

		await window.document.body.dispatchEvent(event);
		assert.equal(component.count, 1);
	}
});
