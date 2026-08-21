import { tick } from 'svelte';
import { test } from '../../test';
import { normalise_trace_logs } from '../../../helpers.js';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, warnings }) {
		await new Promise((r) => setTimeout(r, 25));

		const [count] = target.querySelectorAll('button');

		count.click();
		await new Promise((r) => setTimeout(r, 25));

		assert.deepEqual(normalise_trace_logs(warnings), [
			{
				log: 'Detected reactivity loss when reading `other`. This happens when state is read in an async function after an earlier `await`'
			},
			{
				log: 'Detected reactivity loss when reading `other`. This happens when state is read in an async function after an earlier `await`'
			}
		]);
	}
});
