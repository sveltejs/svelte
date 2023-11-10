import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-legacy-export',
		message: 'Cannot use `export let` in runes mode — use $props instead'
	}
});
