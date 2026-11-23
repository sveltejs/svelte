import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [increment_a, increment_a_b, shift_second, shift] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		increment_a.click();
		await tick();
		assert.deepEqual(logs, ['a_d: 1']);
		logs.length = 0;

		increment_a_b.click();
		await tick();
		assert.deepEqual(logs, ['a_d: 2', 'c: 1']);
		logs.length = 0;

		shift_second.click(); // a_d of second batch
		await tick();
		assert.deepEqual(logs, ['c: 3']);
		logs.length = 0;

		shift.click(); // a_d of first batch - should not rerun second batch
		await tick();
		assert.deepEqual(logs, ['c: 1']);
		logs.length = 0;

		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '3');
		assert.deepEqual(logs, []);
	}
});
