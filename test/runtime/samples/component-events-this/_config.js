export default {
	test({ assert, component, target, window }) {
		const [button1, button2] = target.querySelectorAll('button');

		button1.dispatchEvent(new window.MouseEvent('click'));
		button2.dispatchEvent(new window.MouseEvent('click'));

		assert.strictEqual(component.logs[0], button1);
		assert.ok(component.logs[1] instanceof component.Inner);
	}
};
