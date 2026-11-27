import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	error: 'state_unsafe_mutation',

	// silence the logs
	test({ logs }) {}
});
