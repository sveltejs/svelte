import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_legacy_export',
		message: 'Cannot use `export let` in runes mode — use $props instead'
	}
});
