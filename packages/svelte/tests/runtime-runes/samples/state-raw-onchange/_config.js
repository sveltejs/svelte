import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2, btn3, btn4, btn5, btn6, btn7, btn8, btn9, btn10, btn11, btn12, btn13] =
			target.querySelectorAll('button');

		assert.deepEqual(logs, [
			'constructor count',
			'constructor object',
			'assign in constructor',
			'assign in constructor object'
		]);

		logs.length = 0;

		flushSync(() => btn.click());
		assert.deepEqual(logs, ['count']);

		flushSync(() => btn2.click());
		assert.deepEqual(logs, ['count']);

		flushSync(() => btn3.click());
		assert.deepEqual(logs, ['count', 'object']);

		flushSync(() => btn4.click());
		assert.deepEqual(logs, ['count', 'object', 'class count']);

		flushSync(() => btn5.click());
		assert.deepEqual(logs, ['count', 'object', 'class count']);

		flushSync(() => btn6.click());
		assert.deepEqual(logs, ['count', 'object', 'class count', 'class object']);

		flushSync(() => btn7.click());
		assert.deepEqual(logs, [
			'count',
			'object',
			'class count',
			'class object',
			'declared in constructor'
		]);

		flushSync(() => btn8.click());
		assert.deepEqual(logs, [
			'count',
			'object',
			'class count',
			'class object',
			'declared in constructor',
			'declared in constructor object'
		]);

		flushSync(() => btn9.click());
		assert.deepEqual(logs, [
			'count',
			'object',
			'class count',
			'class object',
			'declared in constructor',
			'declared in constructor object'
		]);

		flushSync(() => btn10.click());
		assert.deepEqual(logs, [
			'count',
			'object',
			'class count',
			'class object',
			'declared in constructor',
			'declared in constructor object'
		]);

		flushSync(() => btn11.click());
		assert.deepEqual(logs, [
			'count',
			'object',
			'class count',
			'class object',
			'declared in constructor',
			'declared in constructor object'
		]);

		flushSync(() => btn12.click());
		assert.deepEqual(logs, [
			'count',
			'object',
			'class count',
			'class object',
			'declared in constructor',
			'declared in constructor object'
		]);

		flushSync(() => btn13.click());
		assert.deepEqual(logs, [
			'count',
			'object',
			'class count',
			'class object',
			'declared in constructor',
			'declared in constructor object',
			'arr'
		]);
	}
});
