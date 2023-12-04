import { ok, test } from '../../test';

export default test({
	html: `
		<button>0</button>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const event = new window.MouseEvent('click', { bubbles: true });

		await button.dispatchEvent(event);
		assert.equal(component.count, 1);

		await button.dispatchEvent(event);
		assert.equal(component.count, 1);
	}
});
