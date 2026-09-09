import { assert_ok, test } from '../../assert';

export default test({
	async test({ assert, target, waitUntil, window }) {
		const form = target.querySelector('form');
		const button = target.querySelector('button');
		const [i1, i2, i3] = target.querySelectorAll('input');
		assert_ok(form);
		assert_ok(button);

		assert.equal(form.id, 'initial-form');
		assert.equal(form.className, 'first');
		assert.equal(window.getComputedStyle(form).backgroundColor, 'rgb(255, 0, 0)');

		button.click();
		await waitUntil(() => form.id === 'updated-form');

		assert.equal(form.id, 'updated-form');
		assert.equal(form.className, 'second');
		assert.equal(i3.id, '', 'input clobbered form');
		assert.equal(window.getComputedStyle(form).backgroundColor, 'rgb(0, 0, 255)');
	}
});
