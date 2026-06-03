import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');
		let ps = [...target.querySelectorAll('p')];

		for (const p of ps) {
			assert.equal(p.innerHTML, '0');
		}

		flushSync(() => {
			btn1.click();
		});

		// prop update normally if we are not unmounting
		for (const p of ps) {
			assert.equal(p.innerHTML, '1');
		}

		flushSync(() => {
			btn3.click();
		});

		// binding still works and update the value correctly
		for (const p of ps) {
			assert.equal(p.innerHTML, '0');
		}

		flushSync(() => {
			btn1.click();
		});

		flushSync(() => {
			btn1.click();
		});

		// the five components guarded by `count < 2` unmount and log
		assert.deepEqual(logs, [1, true, 1, true, 1, true, 1, true, 1, true]);

		flushSync(() => {
			btn2.click();
		});

		// the three components guarded by `show` unmount and log
		assert.deepEqual(logs, [
			1,
			true,
			1,
			true,
			1,
			true,
			1,
			true,
			1,
			true,
			2,
			true,
			2,
			true,
			2,
			true
		]);
	}
});
