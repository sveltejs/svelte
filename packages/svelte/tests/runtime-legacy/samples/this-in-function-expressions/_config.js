import { test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const [, btn] = /** @type {NodeListOf<HTMLButtonElement & { x: number }>} */ (
			target.querySelectorAll('button')
		);
		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		await btn.dispatchEvent(clickEvent);

		assert.equal(btn.x, 1);
	}
});
