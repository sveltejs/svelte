import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2, btn3, btn4, btn5, btn6, btn7, btn8, btn9] = target.querySelectorAll('button');

		assert.deepEqual(logs, ['constructor count', 'constructor proxy']);

		logs.length = 0;

		flushSync(() => {
			btn.click();
		});
		assert.deepEqual(logs, ['count']);

		flushSync(() => {
			btn2.click();
		});
		assert.deepEqual(logs, ['count', 'proxy']);

		flushSync(() => {
			btn3.click();
		});
		assert.deepEqual(logs, ['count', 'proxy', 'proxy']);

		flushSync(() => {
			btn4.click();
		});
		assert.deepEqual(logs, ['count', 'proxy', 'proxy', 'class count']);

		flushSync(() => {
			btn5.click();
		});
		assert.deepEqual(logs, ['count', 'proxy', 'proxy', 'class count', 'class proxy']);

		flushSync(() => {
			btn6.click();
		});
		assert.deepEqual(logs, [
			'count',
			'proxy',
			'proxy',
			'class count',
			'class proxy',
			'class proxy'
		]);

		flushSync(() => {
			btn7.click();
		});
		assert.deepEqual(logs, [
			'count',
			'proxy',
			'proxy',
			'class count',
			'class proxy',
			'class proxy',
			'arr'
		]);

		flushSync(() => {
			btn8.click();
		});
		assert.deepEqual(logs, [
			'count',
			'proxy',
			'proxy',
			'class count',
			'class proxy',
			'class proxy',
			'arr',
			'arr'
		]);

		flushSync(() => {
			btn9.click();
		});
		assert.deepEqual(logs, [
			'count',
			'proxy',
			'proxy',
			'class count',
			'class proxy',
			'class proxy',
			'arr',
			'arr',
			'arr'
		]);
	}
});
