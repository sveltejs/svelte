import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: {
		dev: true
	},

	error: 'state_unsafe_mutation',

	// silence the logs
	test({ logs }) {}
});
