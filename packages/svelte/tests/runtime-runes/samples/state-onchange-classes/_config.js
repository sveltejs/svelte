import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2, btn3, btn4, btn5, btn6, btn7] = target.querySelectorAll('button');

		assert.deepEqual(logs, [
			'constructor count',
			'constructor proxy',
			'assign in constructor',
			'assign in constructor proxy'
		]);

		logs.length = 0;

		flushSync(() => btn.click());
		assert.deepEqual(logs, ['class count']);

		flushSync(() => btn2.click());
		assert.deepEqual(logs, ['class count', 'class proxy']);

		flushSync(() => btn3.click());
		assert.deepEqual(logs, ['class count', 'class proxy', 'class proxy']);

		flushSync(() => btn4.click());
		assert.deepEqual(logs, [
			'class count',
			'class proxy',
			'class proxy',
			'declared in constructor'
		]);

		flushSync(() => btn5.click());
		assert.deepEqual(logs, [
			'class count',
			'class proxy',
			'class proxy',
			'declared in constructor',
			'declared in constructor'
		]);

		flushSync(() => btn6.click());
		assert.deepEqual(logs, [
			'class count',
			'class proxy',
			'class proxy',
			'declared in constructor',
			'declared in constructor',
			'declared in constructor proxy'
		]);

		flushSync(() => btn7.click());
		assert.deepEqual(logs, [
			'class count',
			'class proxy',
			'class proxy',
			'declared in constructor',
			'declared in constructor',
			'declared in constructor proxy',
			'declared in constructor proxy'
		]);
	}
});
