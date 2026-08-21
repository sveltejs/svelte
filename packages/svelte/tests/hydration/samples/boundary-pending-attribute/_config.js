import { flushSync } from 'svelte';
import { assert_ok, test } from '../../test';

export default test({
	compileOptions: {
		experimental: {
			async: true
		}
	}
});
