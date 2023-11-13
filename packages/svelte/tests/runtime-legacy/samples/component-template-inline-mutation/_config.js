import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const btns = target.querySelectorAll('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		await btns[0].dispatchEvent(event);
		await btns[0].dispatchEvent(event);
		await btns[1].dispatchEvent(event);
		await btns[1].dispatchEvent(event);
		await btns[1].dispatchEvent(event);

		assert.equal(btns[1].innerHTML, '3');
	}
});
