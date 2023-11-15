import { test } from '../../test';

export default test({
	test({ assert, component, target, window }) {
		const [button1, button2] = target.querySelectorAll('button');

		button1.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		button2.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

		assert.strictEqual(component.logs[0], button1);
		assert.ok(component.logs[1]?.exists);
	}
});
