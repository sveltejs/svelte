import { ok, test } from '../../test';

export default test({
	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		ok(div);
		const click = new window.MouseEvent('click', { bubbles: true });

		assert.htmlEqual(target.innerHTML, '<div style="background: red;"></div>');
		await div.dispatchEvent(click);
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<div style=""></div>');
	}
});
