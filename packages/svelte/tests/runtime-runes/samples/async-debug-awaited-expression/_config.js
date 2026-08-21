import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	mode: ['client', 'async-server'],

	async test({ assert, logs }) {
		await tick();

		assert.deepEqual(logs, [{ data: 'works' }]);
	},
	test_ssr({ assert, logs }) {
		assert.deepEqual(logs, [{ data: 'works' }]);
	}
});
