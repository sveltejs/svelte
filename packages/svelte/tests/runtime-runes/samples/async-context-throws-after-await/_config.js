import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test() {
		// else runtime_error is checked too soon
		await tick();
	},
	runtime_error: 'set_context_after_init'
});
