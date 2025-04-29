import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings }) {
		const btn = target.querySelector('button');
		btn?.click();
		flushSync();

		assert.deepEqual(warnings, []);
	},

	warnings: []
});
