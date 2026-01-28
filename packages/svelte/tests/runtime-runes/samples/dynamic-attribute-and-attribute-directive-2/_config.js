import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ target, logs, assert }) {
		const [div, div2] = target.querySelectorAll('div');
		const button = target.querySelector('button');

		assert.deepEqual(logs, [
			'updated class attribute',
			'updated class directive',
			'updated style attribute',
			'updated style directive'
		]);

		assert.ok(div.classList.contains('dark'));
		assert.ok(div.classList.contains('small'));

		assert.equal(div2.getAttribute('style'), 'background: green; color: green;');

		flushSync(() => button?.click());

		assert.deepEqual(logs, [
			'updated class attribute',
			'updated class directive',
			'updated style attribute',
			'updated style directive',
			'updated class attribute',
			'updated style attribute'
		]);

		assert.ok(div.classList.contains('dark'));
		assert.ok(div.classList.contains('big'));

		assert.equal(div2.getAttribute('style'), 'background: red; color: green;');
	}
});
