import { flushSync } from 'svelte';
import { test } from '../../test';

// An effect that writes state and then calls `flushSync()` flushes a second batch
// while the batch that ran the effect is still being processed
export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		const [count, both] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(output.innerHTML, `<p>0 0 0</p><span>multiple of four</span>`);
		assert.deepEqual(logs, ['effect 0 0', 'other 0 0']);

		logs.length = 0;
		count.click();
		flushSync();
		assert.htmlEqual(output.innerHTML, `<p>2 4 0</p><span>not 2</span>`);
		assert.deepEqual(logs, [
			'teardown 0 0',
			'effect 1 2',
			'teardown 1 2',
			'effect 2 4',
			'other 0 2',
			'flushed 2 4'
		]);

		logs.length = 0;
		both.click();
		flushSync();
		assert.htmlEqual(output.innerHTML, `<p>4 8 1</p><span>multiple of four</span>`);
		assert.deepEqual(logs, [
			'teardown 2 4',
			'effect 3 6',
			'teardown 3 6',
			'effect 4 8',
			'other 1 4',
			'flushed 4 8'
		]);

		logs.length = 0;
		count.click();
		flushSync();
		assert.htmlEqual(output.innerHTML, `<p>6 12 1</p><span>not 6</span>`);
		assert.deepEqual(logs, [
			'teardown 4 8',
			'effect 5 10',
			'teardown 5 10',
			'effect 6 12',
			'other 1 6',
			'flushed 6 12'
		]);
	}
});
