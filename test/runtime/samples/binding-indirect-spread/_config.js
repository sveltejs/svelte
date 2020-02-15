export default {
	skip_if_ssr: true,
	async test({ assert, component, target, window }) {
		const event = new window.MouseEvent('click');

		const [radio1, radio2, radio3] = target.querySelectorAll('input[type=radio]');

		assert.ok(!radio1.checked);
		assert.ok(radio2.checked);
		assert.ok(!radio3.checked);

		component.radio = 'radio1';

		assert.ok(radio1.checked);
		assert.ok(!radio2.checked);
		assert.ok(!radio3.checked);

		await radio3.dispatchEvent(event);

		assert.equal(component.radio, 'radio3');
		assert.ok(!radio1.checked);
		assert.ok(!radio2.checked);
		assert.ok(radio3.checked);

		const [check1, check2, check3] = target.querySelectorAll('input[type=checkbox]');

		assert.ok(!check1.checked);
		assert.ok(check2.checked);
		assert.ok(!check3.checked);

		component.check = ['check1', 'check2'];

		assert.ok(check1.checked);
		assert.ok(check2.checked);
		assert.ok(!check3.checked);

		await check3.dispatchEvent(event);

		assert.deepEqual(component.check, ['check1', 'check2', 'check3']);
		assert.ok(check1.checked);
		assert.ok(check2.checked);
		assert.ok(check3.checked);
	}
};
