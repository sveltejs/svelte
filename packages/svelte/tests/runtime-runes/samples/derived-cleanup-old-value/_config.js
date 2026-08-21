import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, logs, target }) {
		const [increment] = target.querySelectorAll('button');

		flushSync(() => increment.click());
		flushSync(() => increment.click());
		flushSync(() => increment.click());

		assert.deepEqual(logs, [
			'count: 1',
			'squared: 1',
			'count: 2',
			'squared: 4',
			'count: 3',
			'squared: 9',
			'count: 4'
		]);
	}
});
