import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [btn] = target.querySelectorAll('button');

		btn.click();
		flushSync();

		assert.deepEqual(logs, [
			'prop1',
			'init',
			'prop1',
			'prop1',
			'update',
			'prop2'
		]);
	}
});
