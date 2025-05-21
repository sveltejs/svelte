import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [btn, btn2, btn3] = target.querySelectorAll('button');

		// both logs on creation it will not log on change
		assert.deepEqual(logs, ['create', 0, 'action', 'create', 0, 'attachment']);

		// clicking the first button logs the right value
		flushSync(() => {
			btn?.click();
		});
		assert.deepEqual(logs, ['create', 0, 'action', 'create', 0, 'attachment', 0]);

		// clicking the second button logs the right value
		flushSync(() => {
			btn2?.click();
		});
		assert.deepEqual(logs, ['create', 0, 'action', 'create', 0, 'attachment', 0, 0]);

		// updating the arguments logs the update function for both
		flushSync(() => {
			btn3?.click();
		});
		assert.deepEqual(logs, [
			'create',
			0,
			'action',
			'create',
			0,
			'attachment',
			0,
			0,
			'update',
			1,
			'action',
			'update',
			1,
			'attachment'
		]);

		// clicking the first button again shows the right value
		flushSync(() => {
			btn?.click();
		});
		assert.deepEqual(logs, [
			'create',
			0,
			'action',
			'create',
			0,
			'attachment',
			0,
			0,
			'update',
			1,
			'action',
			'update',
			1,
			'attachment',
			1
		]);

		// clicking the second button again shows the right value
		flushSync(() => {
			btn2?.click();
		});
		assert.deepEqual(logs, [
			'create',
			0,
			'action',
			'create',
			0,
			'attachment',
			0,
			0,
			'update',
			1,
			'action',
			'update',
			1,
			'attachment',
			1,
			1
		]);

		// unmounting logs the destroy function for both
		flushSync(() => {
			btn3?.click();
		});
		assert.deepEqual(logs, [
			'create',
			0,
			'action',
			'create',
			0,
			'attachment',
			0,
			0,
			'update',
			1,
			'action',
			'update',
			1,
			'attachment',
			1,
			1,
			'destroy',
			'action',
			'destroy',
			'attachment'
		]);
	}
});
