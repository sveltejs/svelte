import { test } from '../../test';

export default test({
	html: `
		<button>update handler</button>
		<button>0</button>
	`,

	async test({ assert, component, target, window }) {
		const [updateButton, button] = target.querySelectorAll('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		await button.dispatchEvent(event);
		assert.equal(component.count, 1);

		await updateButton.dispatchEvent(event);
		await button.dispatchEvent(event);
		assert.equal(component.count, 11);
	}
});
