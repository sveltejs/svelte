import { assert_ok, test } from '../../assert';

export default test({
	html: `<div style="color: red;"></div>`,

	test({ assert, target, window, component }) {
		const div = target.querySelector('div');
		assert_ok(div);

		// Initial value with trailing semicolon — should produce valid CSS
		assert.equal(window.getComputedStyle(div).color, 'rgb(255, 0, 0)');

		// Update to a new value that also has a trailing semicolon
		component.color = 'blue;';
		assert.equal(window.getComputedStyle(div).color, 'rgb(0, 0, 255)');

		// Update to a value without trailing semicolon — should still work
		component.color = 'green';
		assert.equal(window.getComputedStyle(div).color, 'rgb(0, 128, 0)');
	}
});
